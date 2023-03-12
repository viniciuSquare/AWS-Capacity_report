import { Periods, MetricService, MetricResource, QuiverProducts } from "@prisma/client";
import { prisma } from "../service/prisma";
import { Instance } from "./Instance";

export class Metric {
    id?: number
    instance?: Instance;

    constructor(
        public date: Date,
        public maximumUsage: number,
        public service?: MetricService,
        public resource?: MetricResource,
        public product?: QuiverProducts,
    ) { }

    get dayOfTheWeek() {
        return this.date.getDay()
    }

    get hour() {
        return this.date.getHours()
    }

    get day() {
        return this.date.toLocaleDateString("pt-BR")
    }

    async store() {
        try {
            if (this.resource && this.service && this.date) {
                return await this.verifyDuplication().then(async ()=>{
                    let storedMetric;
                    // Handle instance
                    if (this.instance && !this.instance.id) { // There's instance label from CSV but not is no persisted
                        storedMetric = await prisma.metrics.create({
                            data: {
                                date: this.date,
                                instance: {
                                    create: {
                                        ...this.instance
                                    }
                                },
                                maximumUsage: this.maximumUsage || 0,
                                resource: this.resource,
                                service: this.service,
                                period: this.period,
                                product: this.product,
                            }
                        })
                    } else if (this.instance?.id) {
                        storedMetric = await prisma.metrics.create({
                            data: {
                                date: this.date,
                                instanceId: this.instance.id,
                                maximumUsage: this.maximumUsage || 0,
                                resource: this.resource,
                                service: this.service,
                                period: this.period,
                                product: this.product,
                            }
                        })
                    }
    
    
                    await prisma.$disconnect();
                    return storedMetric
                })
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

    async verifyDuplication() {
        try {
            const duplication = await prisma.metrics.findFirst({
                where: {
                    date: this.date,
                    maximumUsage: this.maximumUsage || 0,
                    resource: this.resource,
                    service: this.service,
                    product: this.product
                }
            })

            if (duplication) {
                await prisma.$disconnect()
                console.log("Duplicated ", duplication);

                return
            }
        } catch (error: any) {
            if (error?.message?.includes("unique constraint")) {
                console.error("Unique constraint error:", error.message);
                // rollback the transaction and continue
            } else {
                console.error("Deu ruim 2 - duplication check", error)
                throw error;
            }
        }
    }

    get isBusinessDay(): boolean {
        const weekendDays = [0, 6];
        return this.dayOfTheWeek ? !weekendDays.includes(this.dayOfTheWeek) : false;
    }

    get isBusinessHour(): boolean {
        const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        return this.hour ? businessHour.includes(this.hour) : false;
    }
    
    get period(): Periods {
        if ((this.hour == 8) || (this.hour >= 12 && this.hour <= 14))
            return "NORMAL"

        if ((this.hour >= 9 && this.hour <= 11) || (this.hour >= 15 && this.hour <= 17))
            return "PICO"

        return "NOTURNO"
    }
}