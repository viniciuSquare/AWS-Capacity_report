import { AWSMetricsController } from "./AWSMetricsReportController";
import { MetricsDatabaseService } from "./service/MetricsDatabaseService";
import { MetricsXLSXReportService } from "./service/MetricsXSLXReportService";

async function main() {
    const awsMetricsProcessedReports = await new AWSMetricsController().awsReportsFromQueue()

    awsMetricsProcessedReports.forEach( metricReport => {

        console.log(metricReport.metrics?.length);

        if (metricReport.metrics) {
            // const metrics = metricReport.getMetricsOnValidPeriod();

            const metricsDatabaseService = new MetricsDatabaseService()
            const metricsReportService = new MetricsXLSXReportService( metricReport );
            metricsReportService.buildExcel()
            
            // * Save to database
            // metricsDatabaseService.saveMetrics(metrics);
        }

        // metricReport.metricsByDay();

    });

}

// * Generate XLSX report
// await new MetricsXLSXReportService().buildExcel(AWSReportHandlers);

main()