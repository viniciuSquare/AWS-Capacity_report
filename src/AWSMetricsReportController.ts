import { AWSMetricsReport } from "./handlers/AWSMetricsFileHandler";
import { InstancesMetadataHelper } from "./handlers/InstancesMap";
import { Queue } from "./handlers/Queue";
import { AWSDetails, MetricDetails } from "./shared/Types";
export class AWSMetricsController {

    // Instances details
    awsDetails?: AWSDetails;
    metricDetails?: MetricDetails;

    /**
     * * Processing metric reports
     *      For each csv report, 
     *      AWS metadata is fetch and Metrics data formatted
     * */ 
    async processReportsOnFilesQueue() {
        const metricsToProcess = await this.getMetricsFromFileQueue();

        const processedMetricsPromises = metricsToProcess.map(
            async awsMetricsReport => {
                if(!awsMetricsReport.metrics) 
                    throw new Error(`There are no metrics`);
                // 
                return awsMetricsReport;
            }
        )

        return await Promise.all(processedMetricsPromises.flat())
    }
    
    // Await report hadler to feed metrics data
    private async getMetricsFromFileQueue() {
        console.log('1 - Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = filesFromQueue.map((file) => new AWSMetricsReport(file))

        const data = await Promise.all(metricsFromFiles.map(async awsMetricsReport =>  {
            await awsMetricsReport.feedDataFromFile();

            const awsInstancesMetadata = await this.feedMetadataFromFile( awsMetricsReport );
            if (awsInstancesMetadata)
                awsMetricsReport.setInstancesDetails(awsInstancesMetadata)

            await awsMetricsReport.feedMetricsFromFile()

        })).then(()=> metricsFromFiles)
        
        return data
    }
    
    // To improve metadata sharing through many reports processing, 
     // * if there is a region change, metadadata is updated
    private async feedMetadataFromFile(awsMetricsReport: AWSMetricsReport) {
        console.log("Metadata verification for ", awsMetricsReport.region," region.")

        const resource = awsMetricsReport.metricResource
        const service = awsMetricsReport.metricService
        
        this.metricDetails = {
            resource: resource,
            service: service
        }

        if (!(this.awsDetails?.region == awsMetricsReport.region)) {
            this.awsDetails = {
                region: awsMetricsReport.region
            }

            console.log("►► Metadata will be fetch for ", this.awsDetails?.region, awsMetricsReport.region)

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
}