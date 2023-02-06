import { AWSDetails, DashboardMetadata } from "../shared/Types";
import { CSVFile } from "./CSVFile";
import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";
import { Metric } from "../models/Metric";

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetricsFileHandler extends CSVFile {

    headerEndLine = 4;

    metadata: AWSDetails | null = null;
    metrics: Metric[] = []

    constructor(filename: string) {
        super(filename);
    }

    async feedMetricsFromFile() {

        const data = await Promise.all(
            this.rawContentArray.map(async (row, line) => {
                if (line == 0) return // Skip header                

                let metricsFromCSVRow = Array.from({ length: this.header.length - 1 }, async (_, idx) => {
                    const instancesHeaderValidIndex = idx+1;
                    let metric = new Metric();

                    // Feed metric metadata
                    const dateStringFromRow = row.split(',')[0];
                    metric.date = new Date(dateStringFromRow);
                    metric.resource = this.metricResource
                    metric.service = this.MetricsDatabaseService
                    metric.maximumUsage = Number(Number(row.split(',')[instancesHeaderValidIndex]).toFixed(2))

                    const instance = await this.instanceFromId(this.header[instancesHeaderValidIndex]);
                    if (instance) metric.instance = instance

                    return metric
                });

                return await Promise.all(metricsFromCSVRow);
            })
        ).then((result) => result.flat().filter(data => !!data))

        data.forEach(data => data != undefined ? this.metrics.push(data) : null)

        console.log("Formatted data from promise\n");

        return {
            metadata: this.metadata,
            header: this.header,
            metrics: this.metrics
        }
    }

    setInstancesDetails(instancesDetails: AWSDetails) {
        this.metadata = instancesDetails;
    }

    //* Getters returning treated data from CSV

    /**
     * First column head is [date,...instances ids]
     * @returns header array  
     */
    get header(): string[] {
        let headerLines = this.rawDataArray.slice(0, this.headerEndLine);

        let instancesData = headerLines[3].split(',');

        return instancesData
            .map(label => {
                if (label.includes("InstanceId")) {
                    const instanceSize = 19;

                    let startIdx = label.indexOf("InstanceId") + "InstanceId".length + 1;
                    let endIdx = startIdx + instanceSize;

                    return label.slice(startIdx, endIdx);
                }
                return "Data/Hora"
            })
    }

    get region() {
        let headerLines = this.rawDataArray.slice(0, this.headerEndLine);
        const startIdx = headerLines[3].indexOf("Full label,") + "Full label,".length
        const endIdx = headerLines[3].indexOf(":AWS/EC2")

        let instancesData = headerLines[3].slice(startIdx, endIdx);

        return instancesData
    }

    get metricResource() {
        return this.dashboardMetadataFromFilename?.resource

    }

    get MetricsDatabaseService() {
        return this.dashboardMetadataFromFilename?.service

    }

    get metricProduct() {
        return this.dashboardMetadataFromFilename?.product

    }

    get dashboardMetadataFromFilename() {
        const dashboardNameFromFilename = this.fileName.split('-')[0]

        // TODO - Improve null verification
        const dash: DashboardMetadata = {
            dashboardName: dashboardNameFromFilename,
        }
        return metricsByDashboardName.find(({ dashboardName }) => dashboardNameFromFilename == dashboardName) || dash
    }

    // Filtering business period - weekdays, from 08h to 21h
    getMetricsOnValidPeriod(): Metric[] {
        let acumulator: {
            notBusinessDay: Metric[], notBusinessHour: Metric[], validPeriod: Metric[]
        }

        const businessPeriodValidation = this.metrics.reduce((acc: typeof acumulator, metric) => {
            if (!metric) return acc
            if (!metric.isBusinessDay) {
                acc.notBusinessDay.push(metric);
            } else if (!metric.isBusinessHour) {
                acc.notBusinessHour.push(metric);
            } else {
                acc.validPeriod.push(metric);
            }
            return acc;
        }, { notBusinessDay: [], notBusinessHour: [], validPeriod: [] });

        console.table(Object.keys(businessPeriodValidation).map((key) => {
            if ((key == "notBusinessDay" || key == "notBusinessHour" || key == "validPeriod"))
                return { key, items: businessPeriodValidation[key].length }
        }))
        return businessPeriodValidation.validPeriod
    }

    private instanceFromId(instanceId: string) {
        return this.metadata?.instances?.find(instance => instance?.instanceId == instanceId);

    }
}