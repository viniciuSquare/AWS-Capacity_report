import { AWSDetails, DashboardMetadata } from "../shared/Types";
import { CSVFile } from "./CSVFile";
import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";
import { Metric } from "../models/Metric";
import { Instance } from "../models/Instance";
import { QuiverProducts } from "@prisma/client";

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetricsFileHandler {

    private headerEndLine = 4;
    private data: string = '';

    metadata: AWSDetails | null = null;
    metrics: Metric[] = []

    constructor( public fileName: string ) { }

    async feedRawData (
        contentInputType: 'local' | 'upload' = "local",
        dataBuffer: Buffer | null = null
    ) {
        switch (contentInputType) {
            case 'local':
                this.data = await CSVFile.getDataFromFile(this.fileName)
                break;
            case 'upload':
                if(!dataBuffer)
                    throw new Error("No uploaded data");
                this.data = dataBuffer.toString('utf8');

                break;
        }
    }

    async feedMetricsFromFile() {
        const data = await Promise.all(
            this.rawContentArray.map(async (row, line) => {
                if (line == 0) return // Skip header                

                let metricsFromCSVRow = Array.from({ length: this.header.length - 1 }, async (_, idx) => {
                    const headerValidIndex = idx + 1;

                    const dateStringFromRow = row.split(',')[0];

                    let metric = new Metric(
                        new Date(dateStringFromRow),
                        Number(Number(row.split(',')[headerValidIndex]).toFixed(2)),
                        this.metricsService,
                        this.metricsResource,
                        this.metricsProduct
                    );

                    // Feed metric metadata
                    const instance = await this.instanceFromId(this.header[headerValidIndex]);
                    if (instance) {
                        metric.instance = instance
                    } else {
                        let instanceAux = new Instance();
                        instanceAux.product = this.metricsProduct;
                        instanceAux.label = this.header[headerValidIndex];
                        
                        metric.instance = instanceAux
                    }

                    return metric
                });

                return await Promise.all(metricsFromCSVRow);
            })
        ).then((result) => result.flat().filter(data => !!data))

        data.forEach(data => data != undefined ? this.metrics.push(data) : null)

        console.log("Formatted data from promise\n");

        return {
            metadata: this.metadata,
            header: this.header,
            metrics: this.metrics
        }
    }

    setInstancesDetails(instancesDetails: AWSDetails) {
        this.metadata = instancesDetails;
    }

    //* Getters returning treated data from CSV

    /**
     * First column head is [date,...instances ids]
     * @returns header array  
     */
    get header(): string[] {
        let headerLines = this.rawDataArray.slice(0, this.headerEndLine);

        let instancesData = headerLines[3].split(',');

        return instancesData
            .map(label => {
                if (label.includes("InstanceId") || label.includes("host")) {
                    const labelHolder = label.includes("InstanceId") ? "InstanceId" : "host"

                    let startIdx = label.indexOf(labelHolder) + labelHolder.length + 1;
                    let endIdx = startIdx + label.slice(startIdx, label.length).indexOf(' ');

                    return label.slice(startIdx, endIdx);
                }

                return "Data/Hora"
            })
    }

    get region() {
        let headerLines = this.rawDataArray.slice(0, this.headerEndLine);
        const startIdx = headerLines[3].indexOf("Full label,") + "Full label,".length
        const endIdx = headerLines[3].indexOf(":AWS/EC2") > 0 ? headerLines[3].indexOf(":AWS/EC2") : headerLines[3].indexOf(":CWAgent")

        let instancesData = headerLines[3].slice(startIdx, endIdx);

        return instancesData
    }

    get metricsResource() {
        return this.dashboardMetadataFromFilename.resource

    }

    get metricsService() {
        return this.dashboardMetadataFromFilename.service

    }

    get metricsProduct(): QuiverProducts | undefined {
        return this.dashboardMetadataFromFilename.product?.replace(" ","_") as QuiverProducts

    }

    get dashboardMetadataFromFilename() {
        const nameSplit = this.fileName.split('-')
        const dashboardNameFromFilename = nameSplit.length > 5 ? `${nameSplit[0]}-${nameSplit[1]}` : nameSplit[0]

        // TODO - Improve null verification
        const dash: DashboardMetadata = {
            dashboardName: dashboardNameFromFilename,
        }
        const filteredName = metricsByDashboardName.find(({ dashboardName }) => dashboardNameFromFilename == dashboardName)
        // console.debug(dashboardNameFromFilename, filteredName, filteredName?"\tFOUND":"\tNOT FOUND")
        return metricsByDashboardName.find(({ dashboardName }) => dashboardNameFromFilename == dashboardName) || dash
    }

    // Filtering business period - weekdays, from 08h to 21h
    getMetricsOnValidPeriod(): Metric[] {
        let acumulator: {
            notBusinessDay: Metric[], notBusinessHour: Metric[], validPeriod: Metric[]
        }

        const businessPeriodValidation = this.metrics.reduce((acc: typeof acumulator, metric) => {
            if (!metric) return acc
            if (!metric.isBusinessDay) {
                acc.notBusinessDay.push(metric);
            } else if (!metric.isBusinessHour) {
                acc.notBusinessHour.push(metric);
            } else {
                acc.validPeriod.push(metric);
            }
            return acc;
        }, { notBusinessDay: [], notBusinessHour: [], validPeriod: [] });

        console.table(Object.keys(businessPeriodValidation).map((key) => {
            if ((key == "notBusinessDay" || key == "notBusinessHour" || key == "validPeriod"))
                return { key, items: businessPeriodValidation[key].length }
        }))
        return businessPeriodValidation.validPeriod
    }

    private instanceFromId(instanceId: string) {
        return this.metadata?.instances?.find(instance => instance?.instanceId == instanceId);

    }

    private get rawDataArray(): string[] {
        return this.data.split('\n');
    }

    private get rawContentArray() {
        return this.rawDataArray.slice(this.headerEndLine, this.rawDataArray.length);
    }
}