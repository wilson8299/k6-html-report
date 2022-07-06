import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "../../build/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = {
    stages: [
        { duration: '2s', target: 15 },
        { duration: '4s', target: 15 },
        { duration: '2s', target: 30 },
        { duration: '4s', target: 30 },
        { duration: '2s', target: 50 },
        { duration: '4s', target: 50 },
        { duration: '4s', target: 0 },
    ],
}

const BASE_URL = 'https://test-api.k6.io'

export default function () {
    http.get(`${BASE_URL}/public/crocodiles/1/`)
}

export function handleSummary(data) {
    return {
        './report/test-report.html': htmlReport(data, { jq: "../tool/jq-win64.exe", args: ["[ inputs | select(.type==\"Point\" and (.metric==\"vus\" or .metric==\"http_reqs\" or .metric==\"http_req_duration\"))]", "./data/points.json"]}),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    }
}
