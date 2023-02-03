import { AWSMetricsController } from "./AWSMetricsReportController";
import { AWSMetricsReport } from "./handlers/AWSMetricsFileHandler";
import { Metric } from "./models/Metric";
import { MetricService } from "./service/MetricService";

async function main() {
    const awsMetricsProcessedReports = await new AWSMetricsController().processReportsOnFilesQueue()

    awsMetricsProcessedReports.forEach( metricReport => {

        console.log(metricReport.metrics?.length);

        if (metricReport.metrics) {
            const metricsService = new MetricService()
            const metrics = metricsService.getMetricsOnValidPeriod(metricReport.metrics);
            
            // * Save to database
            // metricsService.saveMetrics(metrics);
        }

        // metricReport.metricsByDay();

    });

}

// * Generate XLSX report
// await new Report().buildExcel(awsMetricsReports);

main()