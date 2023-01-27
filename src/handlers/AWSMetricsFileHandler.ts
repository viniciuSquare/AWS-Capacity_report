import { AWSDetails, DashboardMetadata } from "../shared/Types";
import { CSVFile } from "./CSVFile";
import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";

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

    constructor(filename: string) {
        super(filename);
    }

    get dashboardFromFilename() {
        return this.fileName.split('-')[0]
    }

    get metrics() {
        return {
            metadata: this.metadata,
            header: this.header,
            metrics: this.metricsByDay()
        }
    }

    //* Getters returning treated data from CSV

    /**
     * First column head is about date and others are instances ids
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
                metricsByDayFiltered[this.treatDayProp(day)] = []

                metricsByDayFiltered[this.treatDayProp(day)]
                    .push(...metricsGroupedByDay[day].filter( (metric: FormattedData) => this.isBusinessHour(metric.hour)));
            }
        })

        console.log('metricsByDayFiltered ', metricsByDayFiltered);
        

        return metricsByDayFiltered
    }

    private treatDayProp(day: string) {
        let padStart = day.split('/').map((number, idx) => idx <= 1 ? number.padStart(2, '0') : number)
        return [padStart[1], padStart[0], padStart[2]].join(' ');
    }

    async formattedData() {
        let formattedData: any[] = []

        await Promise.all(
            this.rawContentArray.map(async (row, line) => {
                if (line == 0) return // Skip header
                let currentIdx = line - 1

                formattedData[currentIdx] = {}

                const headerPromises = this.header.map(async (head, idx) => {
                    if (idx == 0) {
                        const { day, date, hour } = this.formatDate(row.split(',')[idx]);
                        formattedData[currentIdx].day = day
                        formattedData[currentIdx].date = this.treatDayProp(date)
                        formattedData[currentIdx].hour = hour

                        return {
                            day: day,
                            date: this.treatDayProp(date),
                            hour: hour,
                        }
                    }
                    const instanceName = await this.formatInstanceName(head);

                    formattedData[currentIdx][instanceName] = Number(row.split(',')[idx]).toFixed(2)

                    return { [instanceName]: Number(row.split(',')[idx]).toFixed(2) }

                });


                return await Promise.all(headerPromises).then((result) => result)
            })
        ).then((result) => result.flat())
        return formattedData;
    }

    private formatDate(date: string) {
        return {
            day: new Date(date).getDay(),
            date: new Date(date).toLocaleDateString(),
            hour: new Date(date).getHours(),
        };
    }

    // TODO - UPDATE INSTANCES IDS MAPPING
    private async formatInstanceName(instanceName: string) {
        let name = this.metadata?.instances?.find(instance => instance?.InstanceId == instanceName)?.Label;

        return name || instanceName
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