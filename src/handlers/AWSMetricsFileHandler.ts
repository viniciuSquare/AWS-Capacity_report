import { AWSDetails, DashboardMetadata } from "../shared/Types";
import { CSVFile } from "./CSVFile";
import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";
import { Metric } from "../models/Metric";

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetricsReport extends CSVFile {

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

                let metricsFromCSVRow = Array.from({ length: this.header.length - 1 }, () => {
                    let metric = new Metric();

                    // Feed metric metadata
                    const dateStringFromRow = row.split(',')[0];
                    metric.date = new Date(dateStringFromRow);
                    metric.resource = this.metricResource
                    metric.service = this.metricService

                    return metric
                });

                this.header.forEach(async (head, idx) => {
                    if (idx == 0) return

                    metricsFromCSVRow[idx - 1].maximumUsage = Number(Number(row.split(',')[idx]).toFixed(2))

                    const instance = await this.instanceFromId(head);
                    if (instance) metricsFromCSVRow[idx - 1].instance = instance
                });

                return await Promise.all(metricsFromCSVRow).then((result) => result)
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

    get metricService() {
        return this.dashboardMetadataFromFilename?.service

    }

    get metricProduct() {
        return this.dashboardMetadataFromFilename?.product

    }

    private get dashboardMetadataFromFilename() {
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
            notBusinessDay: Metric[], notBusinessHour: Metric[], businessValidPeriod: Metric[]
        }

        const getMetricsOnValidPeriod = this.metrics.reduce((acc: typeof acumulator, metric) => {
            if (!metric) return acc
            if (!metric.isBusinessDay) {
                acc.notBusinessDay.push(metric);
            } else if (!metric.isBusinessHour) {
                acc.notBusinessHour.push(metric);
            } else {
                acc.businessValidPeriod.push(metric);
            }
            return acc;
        }, { notBusinessDay: [], notBusinessHour: [], businessValidPeriod: [] });

        console.table(Object.keys(getMetricsOnValidPeriod).map((key) => {
            if ((key == "notBusinessDay" || key == "notBusinessHour" || key == "businessValidPeriod"))
                return { key, items: getMetricsOnValidPeriod[key].length }
        }))
        return getMetricsOnValidPeriod.businessValidPeriod
    }

    async metricsByDay() {
        let groupByDay = CSVFile.groupBy('date');
        const metricsGroupedByDay = groupByDay(this.metrics);
        console.log("Data to be grouped ", metricsGroupedByDay);

        let metricsByDayFiltered: { [key: string]: object[] } = {}

        let days = Object.keys(metricsGroupedByDay);

        days.forEach(day => {
            metricsByDayFiltered[day] = []

            metricsByDayFiltered[day]
                .push(...metricsGroupedByDay[day].filter((metric: Metric) => metric.isBusinessHour));
        })
        return metricsByDayFiltered
    }

    private instanceFromId(instanceId: string) {
        return this.metadata?.instances?.find(instance => instance?.instanceId == instanceId);

    }
}