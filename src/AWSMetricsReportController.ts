import { AWSMetricsFileHandler } from "./handlers/AWSMetricsFileHandler";
import { InstancesMetadataHelper } from "./handlers/InstancesMap";
import { Queue } from "./handlers/Queue";
import { AWSDetails, MetricDetails } from "./shared/Types";

/**
 * * Processing metric reports, for each csv report
 * 
 *  `AWSMetricsFileHandler` process metadata and Metrics data is formatted
 * */ 
export class AWSMetricsController {

    // Instances details
    awsDetails?: AWSDetails;
    metricDetails?: MetricDetails;

    // AWS reports with data ready
    async awsReportsFromQueue(): Promise<AWSMetricsFileHandler[]> {
        const metricsToProcess = await this.getMetricsFromFileQueue();

        const processedMetricsPromises = metricsToProcess.map(
            async AWSMetricsFileHandler => {
                if(!AWSMetricsFileHandler.metrics) 
                    throw new Error(`There are no metrics`);

                return AWSMetricsFileHandler;
            }
        )
        return await Promise.all(processedMetricsPromises.flat())
    }
    
    // Await report hadler to feed metrics data
    private async getMetricsFromFileQueue() {
        console.log('1 - Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = filesFromQueue.map((file) => new AWSMetricsFileHandler(file))

        const data = await Promise.all(metricsFromFiles.map(async awsReportHandler =>  {
            await awsReportHandler.feedDataFromFile();

            const awsInstancesMetadata = await this.feedMetadataFromFile( awsReportHandler );
            if (awsInstancesMetadata)
                awsReportHandler.setInstancesDetails(awsInstancesMetadata)

            await awsReportHandler.feedMetricsFromFile()

        })).then(()=> metricsFromFiles)
        
        return data
    }
    
    // To improve metadata sharing through many reports processing, 
     // * if there is a region change, metadadata is updated
    private async feedMetadataFromFile(awsReportHandler: AWSMetricsFileHandler) {
        console.log("Metadata verification for ", awsReportHandler.region," region.")

        const resource = awsReportHandler.metricResource
        const service = awsReportHandler.MetricsDatabaseService
        
        this.metricDetails = {
            resource: resource,
            service: service
        }

        if (!(this.awsDetails?.region == awsReportHandler.region)) {
            this.awsDetails = {
                region: awsReportHandler.region
            }

            console.log("►► Metadata will be fetch for ", this.awsDetails?.region, awsReportHandler.region)

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