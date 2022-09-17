import http from "k6/http";
import {check, group, sleep} from "k6";
import {Rate} from "k6/metrics";

// A custom metric to track failure rates
var failureRate = new Rate("check_failure_rate");
// export const options = {vus: 5, iterations: 10};

import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


// These are still very much WIP and untested, but you can use them as is or write your own!
// import {jUnit, textSummary} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Options
export let options = {
    stages: [
        // Linearly ramp up from 1 to 50 VUs during first minute
        {target: 50, duration: "1m"},
        // Hold at 50 VUs for the next 3 minutes and 30 seconds
        {target: 50, duration: "3m30s"},
        // Linearly ramp down from 50 to 0 50 VUs over the last 30 seconds
        {target: 0, duration: "30s"}
        // Total execution time will be ~5 minutes
    ],
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

// Main function
export default function () {
    let response = http.get("https://test.k6.io/");

    // sleep(Math.random() * 3 + 2); // Random sleep between 2s and 5s
}

export function handleSummary(data) {
    console.log('Preparing the end-of-test summary...');

    console.log("測試 handleSummary")
    return {
        // 'stdout': textSummary(data, {indent: ' ', enableColors: true}), // Show the text summary to stdout...
        "summary-report.html": htmlReport(data)
        // '../path/to/junit.xml': jUnit(data), // but also transform it and save it as a JUnit XML...
        // 'other/path/to/summary.json': JSON.stringify(data), // and a JSON with all the details...
        // And any other JS transformation of the data you can think of,
        // you can write your own JS helpers to transform the summary data however you like!
    };

}
