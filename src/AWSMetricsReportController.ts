import { AWSMetrics } from "./handlers/AWSMetricsFileHandler";
import { Queue } from "./handlers/Queue";
import { Report } from "./handlers/Reports";

export class AWSMetricsController {

    constructor() {
        // check the queue
        // IF THERE IS REPORT FILE TO PROCESS
        // TODO ->  VERIFY INSTANCES MAP FILE
    }

    async generateReportsFromFilesOnQueue() {
        await this.metricsFilesQueue()
            .then(async metricsFiles =>
                metricsFiles.map( file => this.generateReportFromMetric(file))
            )
    }

    private async generateReportFromMetric(metric: AWSMetrics) {
        console.log('To build report from metrics\n');
        
        await metric.feedDataFromFile();
        // TODO - IDENTIFY TARGET REPORT
            // If is created, creat
            // PLUS | PRO
            // CPU  | MEM
        
        new Report().buildExcel(metric)
    }

    async metricsFilesQueue() {
        console.log('Getting metrics from files on queue\n');

        const filesFromQueue = await new Queue().filesToProcess()

        const metricsFromFiles = await filesFromQueue.map((file) => {
            let metric = new AWSMetrics(file);
            return metric
        })

        return metricsFromFiles;
    }

}