import { AWSMetricsController } from "./AWSMetricsReportController";
import { MetricsXLSXReportService } from "./service/MetricsXSLXReportService";
import XLSX from 'xlsx'
import { MetricsDatabaseService } from "./service/MetricsDatabaseService";

const command = process.env.npm_config_command;

switch (command) {
    case undefined:
    case "persist":
    main().then(reports => {
        reports.forEach(metricsReport => {
            const metricsDatabaseService = new MetricsDatabaseService(metricsReport)
            // console.log(metricsDatabaseService.metricsByTime());
            metricsDatabaseService.saveMetrics();
        })
    })

    break;
    case "xlsx":
        main().then(reports => {
            reports.forEach(metricsReport => {
                if (metricsReport.metrics)
                    new MetricsXLSXReportService(metricsReport).buildExcel();
            })
        });
        break;

    case "read":
        readingXLSX();
        break;
    // case undefined:
    //     console.log("\nNo arg\n");
    //     process.exit(1);
}

async function main() {
    const awsMetricsProcessedReports = await new AWSMetricsController().awsReportsFromQueue()

    awsMetricsProcessedReports.forEach(metricsReport => {
        
        console.log(metricsReport.metrics?.length);

    });
    return awsMetricsProcessedReports;
}

// * Generate XLSX report
// await new MetricsXLSXReportService().buildExcel(AWSReportHandlers);


function readingXLSX() {
    const workbook = XLSX.readFile('/Users/square/Documents/Quiver/AWS_PerformanceReport/src/Treated/Quiver_PRO_Lab.xlsx')

    const newWB = XLSX.utils.book_new()
}
