import fs from "fs";
import XLSX from 'xlsx'
import { AWSMetricsFileHandler } from "../handlers/AWSMetricsFileHandler";
import { Metric } from "../models/Metric";
import { MetricsDatabaseService } from "./MetricsDatabaseService";

export class MetricsXLSXReportService {
	public srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

	private treatedDirPath = this.srcCodeBaseDir + "/Treated";

	public workbook: XLSX.WorkBook;
	public metrics: Metric[] = [];

	constructor(private report: AWSMetricsFileHandler) {
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

	isStructureCreated = (sourceDirPathList: string[]) => (sourceDirPathList.filter(dir => (dir == 'Raw' || dir == 'Treated')))

	// ------------------------------> <------------------------------

	setWorkbook(workbook: XLSX.WorkBook) {
		this.workbook = workbook;
	}

	public async buildExcel(path = this.treatedDirPath) {
		const metricsService = new MetricsDatabaseService(this.report);

		const metricsByTime = metricsService.metricsByTime();

		let keys = Object.keys(metricsByTime);

		// console.log("days ", metricsByTime, keys);

		const worksheets = keys.map(async day => {
			const metricByDay = metricsByTime
			const worksheet = this.creteWorkbook(metricByDay[day])
			// console.log(this.metricsByTime);
			return { day, worksheet }
		})

		await Promise.all(worksheets).then(data => {
			data.map(({ day, worksheet }) => {
				const sheetName = day.replace('/','-').replace('/','-')
				
				XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName);
			})
		}).then(() => {
			var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };
			console.log("Day metrics into workbook", this.treatedDirPath, "\n");
			const { resource, service, product } = this.report.dashboardMetadataFromFilename;

			XLSX.writeFileXLSX(
				this.workbook,
				`${path}/${product} - ${service} - ${resource}.xlsx`,
				wopts
			);
		})
	}

	creteWorkbook(jsonData: object[]) {
		this.createWorkbookIndexes(jsonData);
		// console.log("Json Data", jsonData);

		let worksheet = XLSX.utils.json_to_sheet(jsonData);
		// console.log("Worksheet ->", worksheet)
		
		return worksheet
	}



	/** *
	 * head: "Product | Service  | Resource"
	 * 
	 */

	createWorkbookIndexes(data:object[]) {
		
	}


}