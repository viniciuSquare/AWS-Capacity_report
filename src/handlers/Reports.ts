import fs from "fs";
import XLSX from 'XLSX'

import { MetricsCSVFile } from "./MetricsCSVFile";
import { Queue } from "./Queue";

export class Report {
    private srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

    private rawDirPath = this.srcCodeBaseDir + "/Raw";
    private cleanedDirPath = this.srcCodeBaseDir + "/Cleaned";
    private treatedDirPath = this.srcCodeBaseDir + "/Treated";

    constructor() {
        this.checkStructureIntegrity();
    }

    async checkStructureIntegrity() {
        const sourceDirPathList = await fs.readdirSync(this.srcCodeBaseDir, 'utf-8');

        if (!this.isStructureCreated(sourceDirPathList)) {
            // TODO -> HANDLE DIRS CREATION
            console.log("!!!!!! CREATE BASE STRUCTURE !!!!!!\n\n");
        }
    }

    isStructureCreated = (sourceDirPathList: string[]) => (sourceDirPathList.filter(dir => (dir == 'Cleaned' || dir == 'Raw' || dir == 'Treated')))

    async generateReport() {
        new Queue().checkFilesQueue()
            .then(fileNames =>
                fileNames.map(fileName => new MetricsCSVFile(fileName))
            ).then(data => {
                data.map( report => {
                    this.buildReportExcel(report);
                } )
            });

    }

    buildReportExcel(reportFile: MetricsCSVFile) {
        let days = Object.keys(reportFile.metricsByDay);

        var workbook = XLSX.utils.book_new();

        days.forEach(day => {
            console.log(reportFile.metricsByDay[day].filter((timeMetric: any) => timeMetric.hour >= 8 && timeMetric.hour <= 19));

            let worksheet = XLSX.utils.json_to_sheet(reportFile.metricsByDay[day]);

            let sheetName = day.split('/').map((number, idx) => idx <= 1 ? number.padStart(2, '0') : number).join(' ');

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        })

        // var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };

        // XLSX.writeFileXLSX(
        //     workbook,
        //     `${this.treatedDirPath}/FINISH - ${new Date().getDate()} ${new Date().getMonth()}.xlsx`,
        //     wopts
        // );
    }

}