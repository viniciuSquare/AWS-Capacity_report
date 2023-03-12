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
    
    // Await report hadler to feed metrics data on local folder
    private async getMetricsFromFileQueue() {
        console.log('1 - Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = filesFromQueue.map((file) => new AWSMetricsFileHandler(file))

        const data = await Promise.all(
                metricsFromFiles.map( awsReport => this.processRawData(awsReport))
            ).then(()=> metricsFromFiles)
        
        return data
    }

    async processRawData( 
        awsRawReport: AWSMetricsFileHandler, 
        contentInputType: 'local' | 'upload' = "local",
        dataBuffer: Buffer | null = null
    )  {
        await awsRawReport.feedRawData(contentInputType, dataBuffer);

        const awsInstancesMetadata = await this.feedMetadataFromRawData( awsRawReport );
        if (awsInstancesMetadata)
            awsRawReport.setInstancesDetails(awsInstancesMetadata)

        await awsRawReport.feedMetricsFromFile()
        return awsRawReport;
    }
    
    // To improve metadata sharing through many reports processing, 
     // * if there is a region change, metadadata is updated
    private async feedMetadataFromRawData(awsReportHandler: AWSMetricsFileHandler) {
        console.log("Metadata verification for ", awsReportHandler.region," region.")

        const resource = awsReportHandler.metricsResource
        const service = awsReportHandler.metricsService
        const product = awsReportHandler.metricsProduct
        
        this.metricDetails = {
            resource,
            service,
            product: product?.replace('_',' ') as "Quiver PRO" | "Quiver PLUS" | undefined
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
        const product = this.metricDetails?.product?.split(' ')[1] as 'PRO' | 'PLUS'

        if (this.awsDetails?.region) {
            const metadata = new InstancesMetadataHelper(this.awsDetails, product)
            const { instances } = await metadata.getMetadata()

            this.awsDetails.instances = instances

            console.log(`> Metadata fed,\n`);
            return
        } console.error("Region is not defined ");
    }
}