import http from 'k6/http';
import {group, check} from 'k6';
import {Rate} from "k6/metrics";
import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js";
// import {htmlReport} from "./bundle.js";
import file from 'k6/x/file';

var failureRate = new Rate("check_failure_rate");

export const options = {
    thresholds: {
        'checks': ['rate == 1'],
    },
};
const filepath = 'output.txt';
export default function () {


    file.writeString(filepath, 'Writing to file');


    const host = __ENV.HOST || 'http://localhost:8080';
    const token = __ENV.AUTH_TOKEN || '_Ed6edFW27*MB!BR.3ghJbHT2ZpBcj3vKW.WNj49Ao-NBe2WMHr';
    const apiVer = __ENV.API_VERSION || 'v1';
    const baseUrl = `${host}/api/${apiVer}`;
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'X-Lcp-Settle-Api-Version': apiVer,
        },
    };

    const checkResultNotEmpty = (res) => {
        return typeof res.json().result !== 'undefined';
    };

    group('GET /merchant/status/{sellerId}', () => {
    });

    group('Should return 200 with result approved', () => {
        const sellerId = 500001919;
        const res = http.get(`${baseUrl}/merchant/status/${sellerId}`, params);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'success is true': (r) => r.json().success === true,
            'status is approved': (r) => checkResultNotEmpty(r) && r.json().result.status === "APPROVED",
        });
    });

    group('Should return 200 with result not registered', () => {
        const sellerId = -1;
        const res = http.get(`${baseUrl}/merchant/status/${sellerId}`, params);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'success is true': (r) => r.json().success === true,
            'status is not registered': (r) => checkResultNotEmpty(r) && r.json().result.status === "DO_NOT_REGISTER",
        });
    });

}

export function handleSummary(data) {
    console.log('Preparing the end-of-test summary...');

    return {
        // 'stdout': textSummary(data, {indent: ' ', enableColors: true}), // Show the text summary to stdout...
        "lcp-merchant-report.html": htmlReport(data)
    };
}


export function executeAfterAll() {
    console.log("測試 TEST")
}