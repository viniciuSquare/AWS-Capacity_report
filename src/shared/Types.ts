export interface DashboardMetadata {
    dashboardName: string,
    metricDetails: MetricDetails
}

export interface MetricDetails {
    // account: "PG" | "SP",
    service: "Application" | "Database",
    metric: "CPU" | "MEM",
}

export interface InstanceDetails {
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

export interface AWSDetails {
    region: string,
    instances?: (InstanceDetails | undefined)[] | undefined,
}

export interface MetricsReportMetadata {
    period: string[],
    metricDetails: MetricDetails,
    aws: AWSDetails,
}