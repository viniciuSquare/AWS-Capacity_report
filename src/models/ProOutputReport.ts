import { OutputReport } from "./OutputReport";

import * as PRO_DB_CPU_WidgetJson from '../Metadata/PRO/PRO_DB_CPU.json'
import * as PRO_DB_MEM_WidgetJson from '../Metadata/PRO/PRO_DB_MEM.json'
import * as PRO_APP_CPU_WidgetJson from '../Metadata/PRO/PRO_APP_CPU.json'
import * as PRO_APP_MEM_WidgetJson from '../Metadata/PRO/PRO_APP_MEM.json'

import { AWSService } from "../service/AWS.service";

export class PROOutputReport extends OutputReport {
  private awsService: AWSService;
  private awsCredentials = {
    accessKeyId: process.env.PRO_ACCESS_KEY_ID ? process.env.PRO_ACCESS_KEY_ID : "EMPTY",
    secretAccessKey: process.env.PRO_SECRET_ACCESS_KEY ? process.env.PRO_SECRET_ACCESS_KEY : "EMPTY"
  }

  weeksReportSheetRange = [['A1', 'O12']]

  metricsReportProps = {
    application: {
      sourceRange: [ 'B2', 'N13' ],
      dataOutputRanges: {
        cpu: ['C4','O15'],
        memory: ['C26','O37']
       },
      instancesQuantity: 13
    },
    database: {
      sourceRange: [ 'B2', 'E13' ],
      dataOutputRanges: {
        cpu: ['C4', 'F15'],
        memory: ['I4','L15']
      },
      instancesQuantity: 4
    }
  }

  constructor() {
    super("PRO");
    this.awsService = new AWSService(this.awsCredentials);
  }

  static metadataProps = {
    database: {
      memory: {
        MetricWidget: JSON.stringify(PRO_DB_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PRO_DB_CPU_WidgetJson),
        MetricDataQueries: [
          ...PRO_DB_CPU_WidgetJson.metrics.map( (metricMetaData, index) => {
            return {
              Id: `m${index}`,
              MetricStat: {
                Metric: {
                  Namespace: "AWS/EC2",
                  MetricName: "CPUUtilization",
                  Dimensions: [
                    {
                      Name: "InstanceId",
                      Value: metricMetaData[3] as string
                    }
                  ],
                },
                Period: 3600,
                Stat: "Maximum"
              },
              Label: (metricMetaData[4] as { label: string }).label,
              ReturnData: true
            }
          } ),
        ],
        ScanBy: "TimestampAscending",
        StartTime: new Date('2023-02-01T03:00:00.000Z'),
        EndTime: new Date('2023-03-01T02:59:59.000Z'),
      }
    },
    application: {
      memory: {
        MetricWidget: JSON.stringify(PRO_APP_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PRO_APP_CPU_WidgetJson)
      }
    }
  }

  async getCPUMetricsFromCloudWatchParams() {
    // DATABASE
    return await this.awsService.getMetricsDataFromCloudWatch( this.cloudWatchCPUParams ).then( (data) => {
      console.log("DATABASE CPU DATA from CloudWatch params:\n", data, "\n\n");
      return data
    } )

    // APPLICATION
  
  }

  get cloudWatchCPUParams() {
    const {
      MetricDataQueries,
      EndTime,
      StartTime, 
      ScanBy
    } = PROOutputReport.metadataProps.database.cpu

    return { MetricDataQueries, EndTime, StartTime, ScanBy }
  }

  async getMetricsFromWidgetParams() {
    // DATABASE
    await this.awsService.getMetricsDataFromWidgetImage( this.widgetImageCPUParams ).then( (data) => {
      console.log("DATABASE DATA from widget image params:\n", data, "\n\n");
    } )

    // APPLICATION
  }

  get widgetImageCPUParams() {
    return { 
      MetricWidget: PROOutputReport.metadataProps.database.cpu.MetricWidget 
    }
  }

}