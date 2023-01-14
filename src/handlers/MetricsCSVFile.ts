import fs from 'fs'

/**
 * Methods to process data from Raw CSV from file's name
 */
export class MetricsCSVFile {

    private data: string = '';
    private processedData: string = '';
    private headerEndLine = 4;

    private rawDirPath = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + "/Raw";
    private cleanedDirPath = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + "/Cleaned";
    private treatedDirPath = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + "/Treated";

    constructor(
        private fileName: string
    ) {
        this.getDataFromFile()
    }

    async getDataFromFile() {
        this.data = fs.readFileSync(`${this.rawDirPath}/${this.fileName}`, 'utf-8')
    }

    get metricsByDay() {
        let groupByDay = this.groupBy('date')
        let metricsByDay = groupByDay(this.formattedData)

        let days = Object.keys(metricsByDay);

        days.forEach(day => {
            metricsByDay[day].filter((timeMetric: any) => timeMetric.hour >= 8 && timeMetric.hour <= 19);
        })

        return metricsByDay
    }

    isBusinessDay(day: number): boolean {
        const weekendDays = [0, 6];
        return !weekendDays.includes(day);
    }

    isBusinessHour(hour: number): boolean {
        const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        return businessHour.includes(hour);
    }

    groupBy = (key: any) => (array: any) =>
        array.reduce(
            (objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: string | number; }) => ({
                ...objectsByKeyValue,
                [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
            }),
            {}
        );

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

                formattedData[line - 1][head] = Number(row.split(',')[idx]).toFixed(2)
            }
            )
        });

        return formattedData;
    }

    formatDate(date: string) {
        return {
            day: new Date(date).getDay(),
            date: new Date(date).toLocaleDateString(),
            hour: new Date(date).getHours(),
        };
    }

    get rawData(): string {
        return this.data;
    }

    get rawDataArray(): string[] {
        return this.data.split('\n');
    }

    /**
     * @returns header data
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

    get rawContent() {
        return this.rawContentArray.join('\n');
    }

    get rawContentArray() {
        return this.rawDataArray.slice(4, this.rawDataArray.length);
    }

    
}