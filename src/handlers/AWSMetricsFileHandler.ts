import { CSVFile } from "./CSVFile";
import { InstancesMetadataHelper } from "./InstancesMap";

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetrics extends CSVFile {

    headerEndLine = 4;

    constructor(filename: string) {
        super(filename);
    }

    /**
     * @returns header data array, first is about date and others are instances
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
        const startIdx = headerLines[3].indexOf("Full label,")+"Full label,".length
        const endIdx = headerLines[3].indexOf(":AWS/EC2")
        
        let instancesData = headerLines[3].slice(startIdx, endIdx);

        return instancesData
    }

    get rawContentArray() {
        return this.rawDataArray.slice(4, this.rawDataArray.length);
    }

    get metricsByDay() {
        let groupByDay = CSVFile.groupBy('date')
        let metricsGroupedByDay = groupByDay(this.formattedData)
        let metricsByDayFiltered: { [key: string]: object[] } = {}

        let days = Object.keys(metricsGroupedByDay);

        days.forEach(day => {
            if (this.isBusinessDay(new Date(day))) {
                metricsByDayFiltered[this.treatDayProp(day)] = []

                metricsByDayFiltered[this.treatDayProp(day)]
                    .push(...metricsGroupedByDay[day]);
            }
        })

        return metricsByDayFiltered
    }

    private treatDayProp(day: string) {
        let padStart = day.split('/').map((number, idx) => idx <= 1 ? number.padStart(2, '0') : number)
        return [padStart[1], padStart[0], padStart[2]].join(' ');
    }

    get formattedData() {
        let formattedData: any[] = []

        this.rawContentArray.forEach((row, line) => {
            if (line == 0) return
            let currentIdx = line - 1

            formattedData[currentIdx] = {}

            this.header.forEach((head, idx) => {
                // Day stamp column
                if (idx == 0) {
                    const { day, date, hour } = this.formatDate(row.split(',')[idx]);
                    formattedData[line - 1].day = day
                    formattedData[line - 1].date = date
                    formattedData[line - 1].hour = hour

                    return
                }

                formattedData[line - 1][this.formatInstanceName(head)] = Number(row.split(',')[idx]).toFixed(2)
            })
        });

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
    private formatInstanceName(instanceName: string) {
        const instancesMetadata = new InstancesMetadataHelper(this.region).metadata
        const name = instancesMetadata?.instances?.find(instance => instance?.InstanceId == instanceName)?.Label || instanceName

        return name
    }

    private isBusinessDay(day: Date): boolean {
        const weekendDays = [0, 6];
        return !weekendDays.includes(day.getDay());
    }

    private isBusinessHour(hour: number): boolean {
        const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        return businessHour.includes(hour);
    }
}