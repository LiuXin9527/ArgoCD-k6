// import {htmlReport} from "./bundle.js";

import {AWSConfig, S3Client} from './aws.min.js'

const awsConfig = new AWSConfig({
    region: 'verda-jp-1',
    endpoint: "line-objects-dev.com",
    accessKeyId: "b7522aab83db443db71b77fb56977a41",
    secretAccessKey: "07e63827debf44e6ade6d42c2e72057b",
    useEndpointOnly: true
})

const s3 = new S3Client(awsConfig)

const reportPath = "lcp-settle-api/"

const merchantName = `${reportPath}lcp-merchant-report.html`
const merchantReport = open(`./report/${merchantName}`, 'r')

const paymentFeeName = `${reportPath}lcp-payment-fee-report.html`
const paymentFeeReport = open(`./report/${paymentFeeName}`, 'r')

const bucketName = 'lcp-settle-auto-test-reports'


export default function () {
    const buckets = s3.listBuckets();

    if (buckets.filter((b) => b.name === bucketName).length == 0) {
        exec.test.abort();
    }

    s3.putObject(bucketName, merchantName, merchantReport);
    s3.putObject(bucketName, paymentFeeName, paymentFeeReport);
    s3.getObject(bucketName, merchantName);

}