import {AWSConfig, S3Client} from './aws.min.js'
import {FormData} from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import http from 'k6/http';
import {uuidv4} from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const awsConfig = new AWSConfig({
    region: 'verda-jp-1',
    endpoint: "line-objects-dev.com",
    accessKeyId: "b7522aab83db443db71b77fb56977a41",
    secretAccessKey: "07e63827debf44e6ade6d42c2e72057b",
    useEndpointOnly: true
})

const s3 = new S3Client(awsConfig)

const bucketPath = 'lcp-settle-api-' + uuidv4();
const bucketName = 'lcp-settle-auto-test-reports'

const merchantName = 'lcp-merchant-report.html'
const paymentFeeName = 'lcp-payment-fee-report.html'
const settlePolicyName = 'lcp-settle-policy-report.html'

// const merchantTarget = `${bucketPath}${merchantName}`
// const merchantReport = open(`./${merchantName}`, 'r')
//

// const paymentFeeTarget = `lcp-settle-api/${paymentFeeName}`
// const paymentFeeReport = open(`./report/${paymentFeeName}`, 'r')
//
// const settlePolicyName = 'lcp-settle-policy-report.html'
// const settlePolicyTarget = `${bucketPath}${settlePolicyName}`
// const settlePolicyReport = open(`./report/${settlePolicyName}`, 'r')

const reportArray = [
    {
        bucketTarget: `${bucketPath}/${merchantName}`,
        reportFile: open(`./report/${merchantName}`, 'r'),
        reportJson: JSON.parse(open('./report/lcp-payment-fee-report.json', 'r'))
    },
    {
        bucketTarget: `${bucketPath}/${paymentFeeName}`,
        reportFile: open(`./report/${paymentFeeName}`, 'r'),
        reportJson: JSON.parse(open('./report/lcp-payment-fee-report.json', 'r'))
    },
    // {
    //     bucketTarget: `${bucketPath}${settlePolicyName}`,
    //     reportFile: open(`./report/${settlePolicyName}`, 'r'),
    //     reportJson:JSON.parse(open(`./report/lcp-settle-policy-report.json`, 'r'))
    // }
]
export default function () {
    const buckets = s3.listBuckets();

    // if (buckets.filter((b) => b.name === bucketName).length == 0) {
    //     exec.test.abort();
    // }

    for (let obj in reportArray) {
        s3.putObject(bucketName, obj.bucketTarget, obj.reportFile);
        s3.putObject(bucketName, obj.bucketTarget, obj.reportJson);
    }

    // s3.putObject(bucketName, merchantTarget, merchantReport);
    // s3.putObject(bucketName, paymentFeeTarget, paymentFeeReport);
    // s3.putObject(bucketName, settlePolicyTarget, settlePolicyReport);

    //slack
    const headers = {
        'X-SENDER': 'slack'
    }

    const fd = new FormData();
    fd.append('channel', "beta_lcp_k6-integration_test");
    // fd.append('message', payload);
    fd.append('nickname', "slack-bot");
    fd.append('color', "yellow");
    fd.append('icon_emoji', ":pika3:");

    // const res = http.post(`https://ikameshi.linecorp.com/notice`, fd.body(), headers);
}