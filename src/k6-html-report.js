import ejs from 'ejs/ejs.min.js'
import template from './template.ejs'
import command from 'k6/x/command'

const DATE = new Date().toJSON().slice(0, 19).replace(/-|:/g, "-")

export function htmlReport(data, opts) {
    console.log(`[report - ${DATE}] creating HTML report`)

    let thresholdFailures = 0
    let checkFailures = 0
    let checkPasses = 0

    for (let metricName in data.metrics) {
        if (data.metrics[metricName].thresholds) {
            let thresholds = data.metrics[metricName].thresholds
            for (let thresName in thresholds) {
                if (!thresholds[thresName].ok) {
                    thresholdFailures++
                }
            }
        }
    }

    if (data.root_group.checks) {
        for (let check of data.root_group.checks) {
            checkPasses += parseInt(check.passes)
            checkFailures += parseInt(check.fails)
        }
    }

    const metrics = [
        'http_req_duration',
        'http_req_waiting',
        'http_req_connecting',
        'http_req_tls_handshaking',
        'http_req_sending',
        'http_req_receiving',
        'http_req_blocked',
        'iteration_duration',
        'grpc_req_duration',
        'group_duration',
    ]

    const chartData = createChart(opts)

    const html = ejs.render(template, {
        DATE,
        checkPasses,
        checkFailures,
        thresholdFailures,
        chartData,
        data,
        metrics
    })

    return html
}

function createChart(opts) {
    let labels = []
    let vusData = [0]
    let httpReqsData = [0]
    let responseTimeData = [0]
    let httpReqsCount = 0
    let responseTime = 0

    let jsonData = JSON.parse(command.exec(opts.jq, opts.args))
    labels.push(new Date(jsonData[0].data.time) - 100)

    jsonData.forEach(element => {
        if (element.metric == 'http_reqs') {
            httpReqsCount += 1
        } else if (element.metric == 'http_req_duration') {
            responseTime += element.data.value
        } else {
            labels.push(element.data.time)
            vusData.push(element.data.value)
            httpReqsData.push(httpReqsCount)
            responseTimeData.push(responseTime / httpReqsCount)
            httpReqsCount = 0
            responseTime = 0
        }
    })

    return { labels, vusData, httpReqsData, responseTimeData }
}
