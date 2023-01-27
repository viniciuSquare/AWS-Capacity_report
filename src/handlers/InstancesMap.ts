import fs from 'fs';
import XLSX from 'xlsx';

import AWS from 'aws-sdk'
import { AWSDetails, InstanceDetails } from '../shared/Types';
require('dotenv').config();

export class InstancesMetadataHelper {

    public metadata: AWSDetails;

    static projectDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
    private metadataDir: string = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + '/Metadata';

    private ec2: AWS.EC2 | null = null;
    private credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID ? process.env.ACCESS_KEY_ID : "EMPTY",
        secretAccessKey: process.env.SECRET_ACCESS_KEY ? process.env.SECRET_ACCESS_KEY : "EMPTY"
    }

    constructor(
        private region: string
    ) {
        this.metadata = { region: this.region };
    }

    setRegion(region: string) {
        this.metadata.region = region;
    }

    async getMetadata() {
        // if(await this.regionInstancesAreMapped()) {
        //     const metadataString = await fs.readFileSync(`${this.metadataDir}/${this.region}.json`, `utf-8`)
        //     this.metadata = JSON.parse(metadataString)
            
        //     console.log("Parsed and applied metadata ");

        // } else {
            console.log(" !!! Não estão mepeados !!!");
            await this.feedMetadata()
        // }
        return this.metadata;
    }

    private async feedMetadata() {
        // Instances data 
        this.ec2 = new AWS.EC2({
            region: this.metadata.region,
            credentials: new AWS.Credentials(this.credentials)
        });

        console.log('Fetching instances descriptions from AWS to map services instances...\n');

        let ec2InstancesDescriptionPromise = this.ec2.describeInstances().promise();

        return ec2InstancesDescriptionPromise.then( data => {
            console.log('Feeding instances\n');
            this.metadata.instances = data.Reservations?.map(this.mapInstanceData).flat()

            // Saving data
            // this.saveInstancesToExcelFile();
            this.saveInstancesToJSONFile();
            return this.metadata;
        } )
    }

    async regionInstancesAreMapped(): Promise<boolean> {
        const data = await fs.readdirSync(this.metadataDir, 'utf-8')

        console.log('Instances metadata saved: ', data, data.indexOf(this.region + '.json'), data.indexOf(this.region + '.xlsz'));

        return data.indexOf(this.region + '.json') >= 0 || data.indexOf(this.region + '.xlsx') >= 0
    }

    private mapInstanceData(reservations: AWS.EC2.Reservation) {
        return reservations.Instances?.map(({
            InstanceId,
            InstanceType,
            KeyName,
            Monitoring,
            Placement,
            Platform,
            PrivateDnsName,
            PrivateIpAddress,
            PublicDnsName,
            PublicIpAddress,
            Tags,
            PlatformDetails,
            State
        }) => {
            return {
                Produto: Tags?.find(tag => tag.Key == 'produto')?.Value || undefined,
                Label: Tags?.find(tag => tag.Key == 'Name')?.Value || undefined,
                State: State?.Name,
                InstanceId,
                InstanceType,
                KeyName,
                Monitoring: Monitoring?.State,
                Region: Placement?.AvailabilityZone,
                Platform,
                PrivateDnsName,
                PrivateIpAddress,
                PublicDnsName,
                PublicIpAddress,
                Tags,
                PlatformDetails,
            }
        })
    }

    private saveInstancesToJSONFile() {
        const parsedData = JSON.stringify(this.metadata, null, 2)
        console.log('Saving JSON file with instances!!\n', parsedData);
        fs.writeFile(
            `${this.metadataDir}/${this.region}.json`,
            parsedData, "utf-8",
            (err) => {
                err ? console.log(err) : console.log("Data saves successfully!!\n")
            }
        )
    }

    private saveInstancesToExcelFile() {
        const data = this.metadata.instances ? this.metadata.instances?.map(instance => {
            return {
                Produto: instance?.Produto,
                Label: instance?.Label,
                Id: instance?.InstanceId,
                KeyName: instance?.KeyName,
                InstanceType: instance?.InstanceType,
            }
        }) : []

        const worksheet = XLSX.utils.json_to_sheet(data);

        const fileName = `${this.metadataDir}/${this.region}.xlsx`

        const workbook = XLSX.utils.book_new();

        var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };

        XLSX.utils.book_append_sheet(workbook, worksheet, this.region);

        console.log('Saving XLSX file with instances!!\n');
        XLSX.writeFileXLSX(
            workbook,
            fileName,
            wopts
        );
    }

    /**
     * -----------------------------
     * Usable instances arrayfilters 
     * -----------------------------
     * */

    static instanceLabelOrProductContains = (
        instance: InstanceDetails | undefined, name: string
    ) => !!(instance?.Produto?.toLowerCase().includes(name) || instance?.Label?.toLowerCase().includes(name))

}