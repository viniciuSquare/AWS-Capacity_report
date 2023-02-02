import fs from 'fs';

import { Credentials, EC2 } from 'aws-sdk'
import { prisma } from '../service/prisma';

import { AWSDetails } from '../shared/Types';
import { Instance } from '../models/Instance';

require('dotenv').config();

export class InstancesMetadataHelper {

    static projectDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
    private metadataDir: string = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/') + '/Metadata';

    private ec2: AWS.EC2 | null = null;
    private credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID ? process.env.ACCESS_KEY_ID : "EMPTY",
        secretAccessKey: process.env.SECRET_ACCESS_KEY ? process.env.SECRET_ACCESS_KEY : "EMPTY"
    }

    constructor(
        private metadata: AWSDetails
    ) {   }

    async getMetadata() {

        this.metadata.instances = await this.getInstances();

        if (!this.metadata.instances?.length) {
            console.log('Fetching instances descriptions from AWS to map services instances...\n');
            await this.feedInstancesData();

            this.metadata.instances = await this.getInstances();
        }

        console.log("Instances are mapped");

        return this.metadata;
    }

    private async getInstances() {
        try {
            const prismaInstances = await prisma.instances.findMany({
                where: {
                    region: {
                        contains: this.metadata.region
                    }
                }
            });    

            return prismaInstances.map( instance => {
                return new Instance().fromPrisma(instance)
            } )       

        } catch (error) {
            console.log(error);
        }        
    }

    private async feedInstancesData() {
        // Instances data 
        this.ec2 = new EC2({
            region: this.metadata.region,
            credentials: new Credentials(this.credentials)
        });

        let ec2InstancesDescriptionPromise = this.ec2.describeInstances().promise();

        return ec2InstancesDescriptionPromise.then(async instancesDescriptions => {
            console.log('Feeding instances\n');

            let persistencePromises: any = []

            instancesDescriptions.Reservations?.forEach(reservation => {
                return this.convertAWSReservationsToInstances(reservation)?.forEach(
                    instance => {
                        persistencePromises.push(this.persistInstancesData(instance))
                    }
                )
            });

            return persistencePromises ? await Promise.all(persistencePromises) : undefined
        })
    }

    private convertAWSReservationsToInstances(reservations: AWS.EC2.Reservation) {
        if (reservations.Instances)
            return reservations.Instances?.map(awsInstance => new Instance().fromAWS(awsInstance))

    }

    private async persistInstancesData(instance: Instance | undefined) {
        if (instance) {
            try {
                const storedInstances = await prisma.instances.create({
                    data: instance
                })

                return storedInstances

            } catch (error) {
                console.log(error)
            }
        }
    }
    
    // ------------
    // Save to file
    // ------------
    private saveInstancesToJSONFile() {
        const parsedData = JSON.stringify(this.metadata, null, 2)
        console.log('Saving JSON file with instances!!\n', parsedData);
        fs.writeFile(
            `${this.metadataDir}/${this.metadata.region}.json`,
            parsedData, "utf-8",
            (err) => {
                err ? console.log(err) : console.log("Data saves successfully!!\n")
            }
        )
    }

    // private saveInstancesToExcelFile() {
    //     const data = this.metadata.instances ? this.metadata.instances?.map(instance => {
    //         return {
    //             Produto: instance?.Produto,
    //             Label: instance?.Label,
    //             Id: instance?.InstanceId,
    //             KeyName: instance?.KeyName,
    //             InstanceType: instance?.InstanceType,
    //         }
    //     }) : []

    //     const worksheet = XLSX.utils.json_to_sheet(data);

    //     const fileName = `${this.metadataDir}/${this.region}.xlsx`

    //     const workbook = XLSX.utils.book_new();

    //     var wopts: XLSX.WritingOptions = { bookType: 'xlsx', bookSST: false, type: 'binary' };

    //     XLSX.utils.book_append_sheet(workbook, worksheet, this.region);

    //     console.log('Saving XLSX file with instances!!\n');
    //     XLSX.writeFileXLSX(
    //         workbook,
    //         fileName,
    //         wopts
    //     );
    // }

}