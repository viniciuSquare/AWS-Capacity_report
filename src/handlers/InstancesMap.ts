import fs from 'fs';
import XLSX from 'xlsx';


import AWS, { AppIntegrations, CloudFormation } from 'aws-sdk'
import { CSVFile as handler } from './CSVFile';
require('dotenv').config();

interface InstanceDetails {
    InstanceId: string | undefined,
    Region: string | undefined,
    Produto: string | undefined,
    Label: string | undefined,
    State: string | undefined,
    InstanceType: string | undefined,
    KeyName: string | undefined,
    Monitoring: string | undefined,
    Platform: string | undefined,
    PrivateDnsName: string | undefined,
    PrivateIpAddress: string | undefined,
    PublicDnsName: string | undefined,
    PublicIpAddress: string | undefined,
    Tags: AWS.EC2.TagList | undefined,
    PlatformDetails: string | undefined,
}

interface Metadata {
    region: string,
    instances?: (InstanceDetails | undefined)[] | undefined
}

export class InstancesMetadataHelper {

    static projectDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
    private metadataDir: string = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + '/Metadata';

    private ec2: AWS.EC2 | null = null;
    private credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID ? process.env.ACCESS_KEY_ID : "EMPTY",
        secretAccessKey: process.env.SECRET_ACCESS_KEY ? process.env.SECRET_ACCESS_KEY : "EMPTY"
    }

    public metadata: Metadata;

    constructor(
        private region: string
    ) {
        this.metadata = { region: this.region };
    }

    setRegion(region: string) {
        this.metadata.region = region;
    }

    getMetadata() {
        return this.metadata
    }

    async feedInstancesData() {

        if(await !this.regionInstancesAreMapped()) {

            this.ec2 = new AWS.EC2({
                region: this.metadata.region,
                credentials: new AWS.Credentials(this.credentials)
            });
    
            console.log('Fetching instances descriptions to map services instances...\n');
            
            this.ec2.describeInstances((err, data) => {
                console.log('Feeding instances\n');
                this.metadata.instances = data.Reservations?.map(this.mapInstanceData).flat()                
            })
            
            // Saving data
            // this.saveInstancesToExcelFile();
            this.saveInstancesToJSONFile();
        };


    }

    private async regionInstancesAreMapped(): Promise<boolean> {
        const data = await fs.readdirSync(this.metadataDir, 'utf-8')

        console.log('Instances metadata saved: ', data);

        return data.indexOf(this.region+'.json') < 0 || data.indexOf(this.region+'.xlsx') < 0
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
        console.log('Saving JSON file with instances!!\n');
        fs.writeFile(
            `${this.metadataDir}/${this.region}.json`,
            JSON.stringify(this.metadata, null, 2),
            (err) => err ? console.log(err) : console.log("Data saves successfully!!\n")
        )
    }

    private saveInstancesToExcelFile() {
        const data = this.metadata.instances ? this.metadata.instances?.map( instance => {
            return {
                Produto: instance?.Produto,
                Label: instance?.Label,
                Id: instance?.InstanceId,
                KeyName: instance?.KeyName,
                InstanceType: instance?.InstanceType,                
            }
        } ) : []

        const worksheet = XLSX.utils.json_to_sheet( data );

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