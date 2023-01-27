import { DashboardMetadata } from "../shared/Types";

export const metricsByDashboardName: DashboardMetadata[] = [
    {
        dashboardName: "CPUUtilization_-_SQL_WWW",
        // account: "PG",
        metricDetails: {
            service: "Database",
            metric: "CPU"
        }
    },
    {
        dashboardName: "CPUUtilization_-_WEBs",
        // account: "PG",
        metricDetails: {
            service: "Application",
            metric: "CPU"
        }
    },
    {
        dashboardName: "Memória_SQL_WWW",
        // account: "PG",
        metricDetails: {
            service: "Database",
            metric: "MEM"
        }
    },
    {
        dashboardName: "Memória_Apicação_WEB",
        // account: "PG",
        metricDetails: {
            service: "Application",
            metric: "MEM"
        }
    },
    {
        dashboardName: "SQL_SERVER_-_CPU",
        // account: "SP",
        metricDetails: {
            service: "Database",
            metric: "CPU"
        }
    },
    {
        dashboardName: "Quiver_PRO",
        // account: "SP",
        metricDetails: {
            service: "Application",
            metric: "CPU"
        }
    },
    {
        dashboardName: "Memória_Banco_QuiverPRO",
        // account: "PG",
        metricDetails: {
            service: "Database",
            metric: "MEM"
        }
    },
    {
        dashboardName: "Memória_AppQuiverPRO",
        // account: "PG",
        metricDetails: {
            service: "Application",
            metric: "MEM"
        }
    }
]