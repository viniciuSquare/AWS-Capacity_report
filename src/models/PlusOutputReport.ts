import { OutputReport } from "./OutputReport";

import { AWSService } from "../service/AWS.service";

import * as PLUS_DB_CPU_WidgetJson from '../Metadata/PLUS/PLUS_DB_CPU.json'
import * as PLUS_DB_MEM_WidgetJson from '../Metadata/PLUS/PLUS_DB_MEM.json'
import * as PLUS_APP_CPU_WidgetJson from '../Metadata/PLUS/PLUS_APP_CPU.json'
import * as PLUS_APP_MEM_WidgetJson from '../Metadata/PLUS/PLUS_APP_MEM.json'


require('dotenv').config();


export class PlusOutputReport extends OutputReport {
  private awsService: AWSService;
  private awsCredentials = {
    accessKeyId: process.env.PLUS_ACCESS_KEY_ID ? process.env.PLUS_ACCESS_KEY_ID : "EMPTY",
    secretAccessKey: process.env.PLUS_SECRET_ACCESS_KEY ? process.env.PLUS_SECRET_ACCESS_KEY : "EMPTY"
  }

  weeksReportSheetRange = [['A1', 'O12']]

  constructor( ) {
    super("PLUS");
    this.awsService = new AWSService(this.awsCredentials);
  }

  metricsReportProps = {
    application: {
      sourceRange: [ 'B2', 'E13' ],
      dataOutputRanges: {
        cpu: ['C4','F15'],
        memory: ['I4','L15']
      },
      instancesQuantity: 4
    },
    database: {
      sourceRange: [ 'B2', 'G13' ],
      dataOutputRanges: {
        cpu: ['C4','H15'],
        memory: ['C26','H37']
      },
      instancesQuantity: 6
    }
  }

  /**
   * service:
   *  resource
   *    MetricWidget
   *    MetricDataQueries
   *  * Handle period -> Start and End 
   * */ 

  static metadataProps = {
    database: {
      memory: {
        MetricWidget: JSON.stringify(PLUS_DB_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PLUS_DB_CPU_WidgetJson)
      }
    },
    application: {
      memory: {
        MetricWidget: JSON.stringify(PLUS_APP_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PLUS_APP_CPU_WidgetJson)
      }
    }
  }

  async getMetricsFromWidgetParams() {
    // DATABASE
    await this.awsService.getMetricsDataFromWidgetImage( this.widgetImageParams ).then( (data) => {
      console.log("DATABASE DATA from widget image params:\n", data, "\n\n");
    } )

    // APPLICATION
  }

  get widgetImageParams() {
    return { 
      MetricWidget: PlusOutputReport.metadataProps.database.cpu.MetricWidget 
    }
  }
}