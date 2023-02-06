import fs from "fs";
import XLSX from 'xlsx'
import { AWSMetricsFileHandler } from "../handlers/AWSMetricsFileHandler";
import { CSVFile } from "../handlers/CSVFile";
import { Metric } from "../models/Metric";

export class MetricsXLSXReportService {
    public srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

    private treatedDirPath = this.srcCodeBaseDir + "/Treated";    

    public workbook: XLSX.WorkBook;
    public metrics: Metric[] = [];

    constructor( private report: AWSMetricsFileHandler) {
        this.workbook = XLSX.utils.book_new();
        this.metrics = report.getMetricsOnValidPeriod();

        this.checkStructureIntegrity();
    }

    async checkStructureIntegrity() {
        const sourceDirPathList = await fs.readdirSync(this.srcCodeBaseDir, 'utf-8');

        if (!this.isStructureCreated(sourceDirPathList)) {
            // TODO -> HANDLE DIRS CREATION
            console.log("!!!!!! CREATE BASE STRUCTURE !!!!!!\n\n");
        }
    }

    isStructureCreated = (sourceDirPathList: string[]) => (sourceDirPathList.filter(dir => ( dir == 'Raw' || dir == 'Treated' )))

    // ------------------------------> <------------------------------
    
    setWorkbook(workbook: XLSX.WorkBook) {
        this.workbook = workbook;
    }

    public async buildExcel(path = this.treatedDirPath) {
        // TODO - Verify if is it created
        const metricsByDay = await this.metricsByDay()

        let days = Object.keys( metricsByDay );

        console.log("days ", metricsByDay, days);

        const worksheets = days.map( async day => {
            const metricByDay = await this.metricsByDay();
            const worksheet = this.creteWorkbook(metricByDay[day])
            // console.log(this.metricsByDay());
            return { day, worksheet }
        }) 

        await Promise.all(worksheets).then(data => {
            data.map( ({ day, worksheet }) => {
                XLSX.utils.book_append_sheet(this.workbook, worksheet, day);
            } )
        }).then(()=> {
            var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };
            console.log("Day metrics into workbook", this.treatedDirPath, "\n");
    
            XLSX.writeFileXLSX(
                this.workbook,
                `${path}/${this.report.dashboardMetadataFromFilename.dashboardName}.xlsx`,
                wopts
            );
        })


    }

    metricsByDay() {
        let groupByDay = CSVFile.groupBy('monthDate');
        const metricsGroupedByDay = groupByDay(this.metrics);

        let metricsByDayFiltered: { [key: string]: object[] } = {}

        let days = Object.keys(metricsGroupedByDay);
        console.log(days)

        days.forEach(day => {
            metricsByDayFiltered[day] = []

            metricsByDayFiltered[day]
                .push(...metricsGroupedByDay[day].filter((metric: Metric) => metric.isBusinessHour));
        })
        return metricsByDayFiltered
    }

    creteWorkbook(jsonData: object[]) {
        let worksheet = XLSX.utils.json_to_sheet(jsonData);
        return worksheet
    }

}