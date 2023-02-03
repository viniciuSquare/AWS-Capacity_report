import { prisma } from "../service/prisma";
import { Instance } from "./Instance";

export class Metric {
    id?: number
    instance?: Instance;
    date?: Date
    resource?: "CPU" | "Memory"
    service?: "Application" | "Database"
    maximumUsage?: number

    get day() {
        return this.date?.getDay()
    }

    get hour() {
        return this.date?.getHours()
    }

    async store() {
        try {
            if (this.instance?.id && this.resource && this.service && this.date) {
                const duplication = await prisma.metrics.findFirst({
                    where: {
                        date: this.date,
                        instanceId: this.instance.id,
                        maximumUsage: this.maximumUsage || 0,
                        resource: this.resource,
                        service: this.service
                    }
                })

                if (duplication) {
                    await prisma.$disconnect()
                    console.log("Duplicated ", duplication);

                    return
                }

                const storedMetric = await prisma.metrics.create({
                    data: {
                        id: this.id,
                        date: this.date,
                        instanceId: this.instance?.id,
                        maximumUsage: this.maximumUsage || 0,
                        resource: this.resource,
                        service: this.service,
                    }
                })

                await prisma.$disconnect();
                return storedMetric
            }
            throw new Error(`\nIncomplete data!!\t ${this.instance?.id} ${this.maximumUsage} ${this.resource} ${this.service} ${this.date}`)

        } catch (error: any) {
            if (error?.message?.includes("unique constraint")) {
                console.error("Unique constraint error:", error.message);
                // rollback the transaction and continue
            } else {
                console.error("Deu ruim", error)
                throw error;
            }
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