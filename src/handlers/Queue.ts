import fs from "fs";

export class Queue {
    private srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');

    private rawDirPath = this.srcCodeBaseDir + "/Raw";
    private treatedDirPath = this.srcCodeBaseDir + "/Treated";

    /**
     *  Update queue array of untreated files
     * @returns unprocessed files array
     */
    async filesToProcess() {
        let rawFilesList: string[] = await fs.readdirSync(`${this.rawDirPath}`, "utf-8");
        let treatedFilesList: string[] = await fs.readdirSync(`${this.treatedDirPath}`, "utf-8");

        const filesOnQueue = rawFilesList.filter(
            (fileName) => !treatedFilesList.includes("FINISH - " + fileName) && fileName.includes('.csv')
        );

        filesOnQueue.length
            ? console.log(filesOnQueue.length, " files on queue: ", filesOnQueue)
            : console.log("None file on queue")

        return filesOnQueue;
    }
}