import fs from "fs";

export class Queue {
    public filesToProcess: string[] = [];
    private srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length-1).join('/');

    private rawDirPath     = this.srcCodeBaseDir + "/Raw";
    private cleanedDirPath = this.srcCodeBaseDir + "/Cleaned";
    private treatedDirPath = this.srcCodeBaseDir + "/Treated";

    constructor() { }

    /**
     *  Update queue array of uncleaned files
     * @returns unprocessed files array
     */
    async checkFilesQueue() {
        let rawFilesList    : string[] = await fs.readdirSync(`${this.rawDirPath}`, "utf-8");
        let cleanedFilesList: string[] = await fs.readdirSync(`${this.cleanedDirPath}`, "utf-8");

        this.filesToProcess = rawFilesList.filter(
            (fileName) => !cleanedFilesList.includes(fileName)
        );

        console.log("Uncleaned files", this.filesToProcess);

        return this.filesToProcess
    }
}