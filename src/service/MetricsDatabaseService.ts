import dayjs from "dayjs";
import { AWSMetricsFileHandler } from "../handlers/AWSMetricsFileHandler";
import { Metric } from "../models/Metric";
import { ToolsKit } from "../shared/Tool";

export class MetricsDatabaseService {
  private metrics: Metric[] = [];

  constructor(private report: AWSMetricsFileHandler) { 
    this.metrics = report.getMetricsOnValidPeriod()
    console.log(this.metrics[0]);
  }

  async saveMetrics() {
    let promises = this.metrics.map(async (metric) => await metric.store());

    if (promises) {
      return await Promise.all(promises)
    }

    console.log("No promise")
  }

  metricsToTable() {
    // * Presume they are about the same resource/service/product
    const instances = this.metrics.map(metric => metric.instance);
    // Group by date
    const metricsGroupedByDay = ToolsKit.groupBy('day')(this.metrics);
    const keys = Object.keys(metricsGroupedByDay);

    return keys.map(day => {
      return {
        [day]: metricsGroupedByDay[day]
          .map((metric: Metric) => {
            return {
              "Date": metric.date,
              [metric.instance?.label || "Undefined"]: metric.maximumUsage
            }

          })
      } 
    })

    // Transformed Data Structure "date": { "instanceId" : "metricValue" }
    // const metricsTransformedObj = 
  }
  
	metricsByTime() {
		const keys = Object.keys(this.metricsByDay());
		const groupedData: { [day: string]: { [key: string]: string | Date | number }[] } = {}

		keys.map((day: string) => {
			const metricsByDay = this.metricsByDay()[day]
			
			let groupByTime = ToolsKit.groupBy('date');
			const metricsGroupedByDay = groupByTime(metricsByDay); // -> 02-01-2023

			groupedData[day] = []
      
      // console.log("\n\n\n"+Object.keys(metricsGroupedByDay)+"\n\n\n");

			Object.keys(metricsGroupedByDay).forEach( time => {
				let metricByTime: { [key: string]: Date | string | number } = {};
        
				metricByTime["Date"] = dayjs(time).format('YYYY-MM-DD HH:mm:ss') || time;
				metricsGroupedByDay[time].forEach( (metric: Metric) => {
					metricByTime[metric.instance?.label || "undefined"] = Number(metric.maximumUsage);
				})

				groupedData[day].push(metricByTime);
			})
		});
		
		return groupedData
	}

	metricsByDay(): { [key: string]: any } {
		let groupByDay = ToolsKit.groupBy('day');
		const metricsGroupedByDay = groupByDay(this.metrics);

		let metricsByDayFiltered: { [key: string]: object[] } = {}

		let days = Object.keys(metricsGroupedByDay);

		days.forEach(day => {
			metricsByDayFiltered[day] = []

			metricsByDayFiltered[day]
				.push(...metricsGroupedByDay[day].filter((metric: Metric) => metric.isBusinessHour));
		})
		return metricsByDayFiltered
	}


}