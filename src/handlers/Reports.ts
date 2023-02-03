import fs from "fs";
import XLSX from 'xlsx'
import { AWSMetricsReport } from "./AWSMetricsFileHandler";
export class Report {
    public srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

    private treatedDirPath = this.srcCodeBaseDir + "/Treated";    

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

    isStructureCreated = (sourceDirPathList: string[]) => (sourceDirPathList.filter(dir => ( dir == 'Raw' || dir == 'Treated' )))

    setWorkbook(workbook: XLSX.WorkBook) {
        this.workbook = workbook;
    }

    public async buildExcel(reportFile: AWSMetricsReport, path = this.treatedDirPath) {
        // TODO - Verify if is it created
        const metricsByDay = reportFile.metricsByDay()

        let days = Object.keys(metricsByDay );

        console.log("days ", metricsByDay);

        const worksheets = days.map( async day => {
            const metricByDay = await reportFile.metricsByDay();
            const worksheet = this.creteWorkbook(metricByDay[day])
            // console.log(reportFile.metricsByDay());
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
                `${path}/${reportFile.fileName}.xlsx`,
                wopts
            );
        })


    }

    creteWorkbook(jsonData: object[]) {
        let worksheet = XLSX.utils.json_to_sheet(jsonData);
        return worksheet
    }

}