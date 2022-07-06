import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "../../build/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = {
    vus: 1,
    duration: '3s',
    thresholds: {
        http_req_duration: ['p(99)<1500'],
    },
}

const BASE_URL = 'https://test-api.k6.io'
const USERNAME = 'USERNAME'
const PASSWORD = 'PASSWORD'

export default () => {
    const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
        username: USERNAME,
        password: PASSWORD,
    })

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('access') !== '',
    })
}

export function handleSummary(data) {
    return {
        './report/test-report.html': htmlReport(data, { jq: "../tool/jq-win64.exe", args: ["[ inputs | select(.type==\"Point\" and (.metric==\"vus\" or .metric==\"http_reqs\" or .metric==\"http_req_duration\"))]", "./data/points.json"]}),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    }
}
