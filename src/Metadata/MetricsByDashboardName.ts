import { DashboardMetadata } from "../shared/Types";

export const metricsByDashboardName: DashboardMetadata[] = [
    {
        dashboardName: "CPUUtilization_-_SQL_WWW",
        // account: "PG",
        service: "Database",
        resource: "CPU",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "CPUUtilization_-_WEBs",
        // account: "PG",
        service: "Application",
        resource: "CPU",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "Memória_SQL_WWW",
        // account: "PG",
        service: "Database",
        resource: "Memory",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "Memória_Apicação_WEB",
        // account: "PG",
        service: "Application",
        resource: "Memory",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "SQL_SERVER_-_CPU",
        // account: "SP",
        service: "Database",
        resource: "CPU",
        product: "Quiver PRO"
    },
    {
        dashboardName: "Quiver_PRO",
        // account: "SP",
        service: "Application",
        resource: "CPU",
        product: "Quiver PRO"
    },
    {
        dashboardName: "Memória_Banco_QuiverPRO",
        // account: "PG",
        service: "Database",
        resource: "Memory",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "Memória_AppQuiverPRO",
        // account: "PG",
        service: "Application",
        resource: "Memory",
        product: "Quiver PLUS"
    }
]