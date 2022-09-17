import http from 'k6/http';
import {group, check} from 'k6';
import {Rate} from "k6/metrics";
import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js";
// import {htmlReport} from "./bundle.js";

var failureRate = new Rate("check_failure_rate");

export let options = {
    thresholds: {
        // We want the 95th percentile of all HTTP request durations to be less than 500ms
        "http_req_duration": ["p(95)<500"],
        // Requests with the staticAsset tag should finish even faster
        "http_req_duration{staticAsset:yes}": ["p(99)<250"],
        // Thresholds based on the custom metric we defined and use to track application failures
        "check_failure_rate": [
            // Global failure rate should be less than 1%
            "rate<0.01",
            // Abort the test early if it climbs over 5%
            {threshold: "rate<=0.05", abortOnFail: true},
        ],
    },
};

export default function () {

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
            'status is 200': (r) => r.status === 2100,
            'success is true': (r) => r.json().success === true,
            'status is not registered': (r) => checkResultNotEmpty(r) && r.json().result.status === "DO_NOT_REGISTER",
        });
    });

}

export function handleSummary(data) {
    console.log('Preparing the end-of-test summary...');

    return {
        // 'stdout': textSummary(data, {indent: ' ', enableColors: true}), // Show the text summary to stdout...
        "/k6-scripts/report/lcp-merchant-report.html": htmlReport(data)
    };
}
