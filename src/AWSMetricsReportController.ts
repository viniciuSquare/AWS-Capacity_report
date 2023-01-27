import { AWSMetrics } from "./handlers/AWSMetricsFileHandler";
import { InstancesMetadataHelper } from "./handlers/InstancesMap";
import { Queue } from "./handlers/Queue";
import { Report } from "./handlers/Reports";
import { AWSDetails } from "./shared/Types";
export class AWSMetricsController {

    reportMetadata: AWSDetails | null = null

    constructor() {
        // check the queue
        // IF THERE IS REPORT FILE TO PROCESS
        // TODO ->  VERIFY INSTANCES MAP FILE
    }

    async generateReportsFromFilesOnQueue() {
        const metricsToProcess = await this.getMetricsFromFileQueue()

        metricsToProcess.forEach(
            async metric => {
                const metadata = await this.getMetricMetadata(metric)

                if (metadata)
                    metric.setInstancesDetails(metadata)
                
                console.log('END - Generating report from metric');
                await new Report().buildExcel(metric);
            }
        )
    }

    private async getMetricsFromFileQueue() {
        console.log('1 - Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = await filesFromQueue.map((file) => {
            let metric = new AWSMetrics(file);
            return metric
        })

        return await Promise.all(metricsFromFiles.map(async metric =>  await metric.feedDataFromFile()))
            .then(()=> metricsFromFiles)
    }

    private async getMetricMetadata(metric: AWSMetrics) {
        console.log("Metadata verification for ", metric.region," region.")

        if (!(this.reportMetadata?.region == metric.region)) {
            this.reportMetadata = {
                region: metric.region
            }

            console.log("►► Metadata will be fetch for ", this.reportMetadata?.region, metric.region)

            await this.feedInstanceDetailsMetadata();
        }

        console.log("Metadata is already updated")
        return this.reportMetadata;
    }

    private async feedInstanceDetailsMetadata() {
        console.log("\n►►► Feeding metadata")

        if (this.reportMetadata?.region) {
            const metadata = new InstancesMetadataHelper(this.reportMetadata.region)
            this.reportMetadata = await metadata.getMetadata()

            console.log("> Metadata fed \n");

            return
        }

        console.error("Region is not defined ");
    }
}