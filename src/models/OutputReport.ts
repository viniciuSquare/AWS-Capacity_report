interface ServiceReportProps {
    sourceRange: string[],
    dataOutputRanges: {
        cpu: string[]
        memory: string[]
    },
    instancesQuantity: number
}

interface ProductMetricsReportProps {
    application: ServiceReportProps,
    database: ServiceReportProps
}

export abstract class OutputReport {
    protected product: "PRO" | "PLUS";

    abstract metricsReportProps: ProductMetricsReportProps

    // Determine sheets columns size
    abstract weeksReportSheetRange: string[][];

    protected weekReportSheet = "Semanas";
    protected monthReportSheet = "Mês";

    constructor(product: "PRO" | "PLUS") {
        this.product = product;

    }

    setWeeksReportsSheetRanges() {
        if (this.product == 'PLUS') {

        }
    }

    // TODO - Period to generate sheets name
    sheetsNamesFromPeriod() {

    }

    dayAverageFunctions(startCell: string) {
        startCell = 'C4';

        return {
            normal: '=IFERROR((SUMIF(C8:C10;"<>0")+SUMIF(C4;"<>0"))/(COUNTIF(C8:C10;"<>0")+COUNTIF(C4;"<>0"));"-")',
            peak: '=IFERROR((SUMIF(C11:C13;"<>0")+SUMIF(C5:C7;"<>0"))/(COUNTIF(C11:C13;"<>0")+COUNTIF(C5:C7;"<>0"));"-")',
            night: '=IFERROR(SUMIF(C14:C17;"<>0")/COUNTIF(C14:C17;"<>0");"-")',
            day: '=IFERROR(SUMIF(C4:C17;"<>0")/COUNTIF(C4:C17;"<>0");"-")',
        }
    }
}