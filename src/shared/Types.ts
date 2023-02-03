import { Instance } from "../models/Instance"

export interface DashboardMetadata {
    dashboardName: string,
    product?: "Quiver PRO" | "Quiver PLUS"
    service?: "Application" | "Database",
    resource?: "CPU" | "Memory",
}

export interface MetricDetails {
    // account: "PG" | "SP",
    service?: "Application" | "Database",
    resource?: "CPU" | "Memory",
}

export interface AWSDetails {
    region: string,
    instances?: Instance[],
}

export interface MetricsReportMetadata {
    period: string[],
    metricDetails: MetricDetails,
    aws: AWSDetails,
}