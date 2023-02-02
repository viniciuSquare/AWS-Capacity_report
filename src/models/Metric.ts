import { Prisma } from "@prisma/client";
import { prisma } from "../service/prisma";
import { Instance } from "./Instance";

export class Metric {
    id?          : number
    instance?    : Instance;
    date?        : Date
    resource?    : "CPU" | "Memory"
    service?     : "Application" | "Database"
    maximumUsage?: number

    get day() {
        return this.date?.getDay()
    }

    get hour() {
        return this.date?.getHours()
    }

    async storeTransaction(transaction: Prisma.TransactionClient) {
        if(this.instance?.id && this.maximumUsage && this.resource && this.service && this.date) {
            const storedMetric = await transaction.metrics.create({
                data: {
                    id: this.id,
                    date:this.date,
                    instanceId: this.instance?.id,
                    maximumUsage: this.maximumUsage,
                    resource: this.resource,
                    service: this.service,
                }
            })
    
            return storedMetric
        }
    }

    // Verify unique metric before store
    async safeStore() {
        const store = this.storeTransaction.bind(this)
        try {

            await store

            console.log("\n\nIncomplete data!! \n\n")

        } catch (error) {
            console.log(error)
        }

    }

    get isBusinessDay(): boolean {
        const weekendDays = [0, 6];
        return this.day ? !weekendDays.includes(this.day) : false;
    }

    get isBusinessHour(): boolean {
        const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        return this.hour ? businessHour.includes(this.hour) : false;
    }
}