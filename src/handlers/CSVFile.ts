import fs from 'fs'

/**
 * Methods to process data from Raw CSV from file's name
 */
export class CSVFile {

    protected data: string = '';
    protected headerEndLine: number = 0;

    private projectDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
    private rawDirPath = this.projectDir + "/Raw";

    constructor(
        public fileName: string
    ) {
        this.fileName = fileName.slice(0, fileName.indexOf('.csv'))
    }

    async feedDataFromFile() {
        console.log("Reading report raw file from ", this.fileName, " ...\n");
        this.data = await fs.readFileSync(`${this.rawDirPath}/${this.fileName}.csv`, 'utf-8')
    }

    get rawDataArray(): string[] {
        return this.data.split('\n');
    }

    static groupBy = (key: any) => (array: any) =>
        array.reduce(
            (objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: string | number; }) => ({
                ...objectsByKeyValue,
                [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
            }),
            {}
        );
}