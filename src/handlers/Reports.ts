import fs from "fs";
import XLSX from 'xlsx'
import { AWSMetrics } from "./AWSMetricsFileHandler";

export class Report {
    public srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

    private treatedDirPath = this.srcCodeBaseDir + "/Treated";

    private applications = {
        PG: [
            "CPUUtilization_-_SQL_WWW",
            "CPUUtilization_-_WEBs",
            "Memória_Apicação_WEB",
            "Memória_SQL_WWW",
        ],
        SP: [
            "SQL_SERVER_-_CPU",
            "Quiver_PRO",
            "Memória_Banco_QuiverPRO",
            "Memória_AppQuiverPRO"
        ]
    }

    public workbook: XLSX.WorkBook;

    constructor() {
        this.workbook = XLSX.utils.book_new();

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

    setWorkbook(workbook: XLSX.WorkBook) {
        this.workbook = workbook;
    }

    public buildExcel(reportFile: AWSMetrics, path = this.treatedDirPath) {
        let days = Object.keys(reportFile.metricsByDay);
        
        days.forEach(day => {
            const worksheet = this.creteWorkbook(reportFile.metricsByDay[day])
            console.log(reportFile.metricsByDay);
            
            XLSX.utils.book_append_sheet(this.workbook, worksheet, day);
        })

        // console.log("Day metrics into workbook", this.treatedDirPath, this.workbook, "\n");

        var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };

        XLSX.writeFileXLSX(
            this.workbook,
            `${path}/${reportFile.fileName}.xlsx`,
            wopts
        );
    }

    creteWorkbook( jsonData: object[] ) {
        let worksheet = XLSX.utils.json_to_sheet(jsonData);
        return worksheet
    }

}