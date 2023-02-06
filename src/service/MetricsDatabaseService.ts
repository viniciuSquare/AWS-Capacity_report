import { Metric } from "../models/Metric";
import { prisma } from "./prisma";

export class MetricsDatabaseService {
  private prisma = prisma;

  async saveMetrics(metrics: Metric[]) {
    let promises = metrics.map(async (metric) => await metric.store() );

    if (promises) {
      return await Promise.all(promises)
    }

    console.log("No promise")
  }
  
  
}