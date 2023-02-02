import { AWSDetails, DashboardMetadata } from "../shared/Types";
import { CSVFile } from "./CSVFile";
import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";
import { Metric } from "../models/Metric";

interface InstanceData {
    [instance: string]: number 
}
interface FormattedData {
    date: string
    hour: number
    day: number
    metrics?: [
        {
            [key: string]: InstanceData[]
        }
    ]
}

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetrics extends CSVFile {

    headerEndLine = 4;
    metadata: AWSDetails | null = null;

    metrics?: (Metric | undefined)[]

    constructor(filename: string) {
        super(filename);
    }

    get dashboardFromFilename() {
        return this.fileName.split('-')[0]
    }

    async feedMetricsFromFile() {
        const data = await Promise.all(
            this.rawContentArray.map(async (row, line) => {
                if (line == 0) return // Skip header                

                let metricsFromCSVRow = Array.from({ length: this.header.length-1 }, () => {                     
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

                    metricsFromCSVRow[idx-1].maximumUsage = Number(Number(row.split(',')[idx]).toFixed(2))

                    const instance = await this.instanceFromId(head);
                    if(instance) metricsFromCSVRow[idx-1].instance = instance
                });

                return await Promise.all(metricsFromCSVRow).then((result) => result)
            })
        ).then((result) => result.flat())

        if(data)
            this.metrics = data

        console.log("Formatted data from promise", this.metrics, "\n");

        return {
            metadata: this.metadata,
            header: this.header,
            metrics: data
        }
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
        return metricsByDashboardName.find( ({ dashboardName }) => this.dashboardFromFilename == dashboardName )?.resource
        
    }

    get metricService() {
        return metricsByDashboardName.find( ({ dashboardName }) => this.dashboardFromFilename == dashboardName )?.service
        
    }

    get metricProduct() {
        return metricsByDashboardName.find( ({ dashboardName }) => this.dashboardFromFilename == dashboardName )?.product
        
    }

    get rawContentArray() {
        return this.rawDataArray.slice(this.headerEndLine, this.rawDataArray.length);

    }

    async metricsByDay() {
        let groupByDay = CSVFile.groupBy('date');
        const formattedData = await this.formattedData()
        // console.log("Data to be grouped ",formattedData);
        let metricsGroupedByDay = groupByDay(formattedData);
        let metricsByDayFiltered: { [key: string]: object[] } = {}

        let days = Object.keys(metricsGroupedByDay);

        days.forEach(day => {
            if (this.isBusinessDay(new Date(day))) {
                metricsByDayFiltered[day] = []

                metricsByDayFiltered[day]
                    .push(...metricsGroupedByDay[day].filter( (metric: FormattedData) => this.isBusinessHour(metric.hour)));
            }
        })

        // console.log('metricsByDayFiltered ', metricsByDayFiltered);
        

        return metricsByDayFiltered
    }

    private treatDayProp(day: string) {
        let padStart = day.split('/').map((number, idx) => idx <= 1 ? number.padStart(2, '0') : number)
        return [padStart[1], padStart[0], padStart[2]].join(' ');
    }

    async formattedData() {
        const data = await Promise.all(
            this.rawContentArray.map(async (row, line) => {
                if (line == 0) return // Skip header                

                let metricsFromCSVRow = Array.from({ length: this.header.length-1 }, () => {                     
                    let metric = new Metric();
                    
                    const dateStringFromRow = row.split(',')[0];
                    metric.date = new Date(dateStringFromRow);
                    metric.resource = this.metricResource
                    metric.service = this.metricService

                    console.log("Resource and service", this.metricResource, this.metricService)                   

                    return metric
                });

                this.header.forEach(async (head, idx) => {
                    if (idx == 0) return

                    metricsFromCSVRow[idx-1].maximumUsage = Number(Number(row.split(',')[idx]).toFixed(2))

                    const instance = await this.instanceFromId(head);
                    if(instance) metricsFromCSVRow[idx-1].instance = instance
                });

                return await Promise.all(metricsFromCSVRow).then((result) => result)
            })
        ).then((result) => result)

        console.log("Formatted data from promise", data, "\n");
        
        return data;
    }

    // TODO - UPDATE INSTANCES IDS MAPPING
    private instanceFromId(instanceId: string) {
        return this.metadata?.instances?.find(instance => instance?.instanceId == instanceId);

    }

    private isBusinessDay(day: Date): boolean {
        const weekendDays = [0, 6];
        return !weekendDays.includes(day.getDay());
    }

    private isBusinessHour(hour: number): boolean {
        const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        return businessHour.includes(hour);
    }

    setInstancesDetails(instancesDetails: AWSDetails) {
        this.metadata = instancesDetails;
    }

    // TODO - Call on setInstancesDetails to get account, 
    identifyMetric(reportFile: AWSMetrics): DashboardMetadata | void {
        return metricsByDashboardName
            .find((metricDetails)=> metricDetails.dashboardName == reportFile.dashboardFromFilename) || console.log("There's no report to this dashboard")
    }
}