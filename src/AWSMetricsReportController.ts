import { AWSMetrics } from "./handlers/AWSMetricsFileHandler";
import { InstancesMetadataHelper } from "./handlers/InstancesMap";
import { Queue } from "./handlers/Queue";
import { Report } from "./handlers/Reports";
import { AWSDetails, MetricDetails } from "./shared/Types";
export class AWSMetricsController {

    // Instances details
    awsDetails?: AWSDetails;
    metricDetails?: MetricDetails;

    async generateReportsFromFilesOnQueue() {
        const metricsToProcess = await this.getMetricsFromFileQueue();

        /**
         * * Processing metric reports
         *      AWS metadata is fetch 
         *      For each csv report, 
         * */ 
        metricsToProcess.forEach(
            async awsMetricsReport => {
                const awsInstancesMetadata = await this.feedMetadataFromFileMetadata( awsMetricsReport );

                if (awsInstancesMetadata)
                    awsMetricsReport.setInstancesDetails(awsInstancesMetadata)
                await awsMetricsReport.feedMetricsFromFile();
                
                console.log(awsMetricsReport.metrics);

                if(awsMetricsReport.metrics) {
                    awsMetricsReport.metrics.map( metric => metric?.safeStore().then( prismaMetric => console.log("\n Persisted ", prismaMetric) ) )
                }
                
                // console.log('\nEND - Generating report from metric');
                // await new Report().buildExcel(awsMetricsReport);
            }
        )
    }

    private async getMetricsFromFileQueue() {
        console.log('1 - Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = filesFromQueue.map((file) => new AWSMetrics(file))

        return await Promise.all(metricsFromFiles.map(async metric =>  await metric.feedDataFromFile()))
            .then(()=> metricsFromFiles)
    }

    private async feedMetadataFromFileMetadata(metric: AWSMetrics) {
        console.log("Metadata verification for ", metric.region," region.")

        const resource = metric.metricResource
        const service = metric.metricService
        
        this.metricDetails = {
            resource: resource,
            service: service
        }

        if (!(this.awsDetails?.region == metric.region)) {
            this.awsDetails = {
                region: metric.region
            }

            console.log("►► Metadata will be fetch for ", this.awsDetails?.region, metric.region)

            await this.feedInstanceDetailsMetadata();
        }

        console.log("Metadata is already updated")
        return this.awsDetails;
    }

    private async feedInstanceDetailsMetadata() {
        console.log("\n►►► Feeding metadata")

        if (this.awsDetails?.region) {
            const metadata = new InstancesMetadataHelper(this.awsDetails)
            const { instances } = await metadata.getMetadata()

            this.awsDetails.instances = instances

            console.log(`> Metadata fed,\n`);
            return
        } console.error("Region is not defined ");
    }

    private feedMetricsMetadata() {

    }
}