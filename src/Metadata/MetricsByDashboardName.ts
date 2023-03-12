import { DashboardMetadata } from "../shared/Types";

// Dashboards metrics will be feed with this metadata
export const metricsByDashboardName: DashboardMetadata[] = [
    {
        dashboardName: "CPUUtilization_-_SQL_WWW",
        // account: "PG",
        service: "Database",
        resource: "CPU",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "Memoria_SQL_WWW",
        // account: "PG",
        service: "Database",
        resource: "Memory",
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
        dashboardName: "Memoria_Aplicacao_WEB",
        // account: "PG",
        service: "Application",
        resource: "Memory",
        product: "Quiver PLUS"
    },
    {
        dashboardName: "Quiver_PRO",
        // account: "SP",
        service: "Application",
        resource: "CPU",
        product: "Quiver PRO"
    }, 
    {
        dashboardName: "Memoria_AppQuiverPRO",
        // account: "PG",
        service: "Application",
        resource: "Memory",
        product: "Quiver PRO"
    },
    {
        dashboardName: "SQL_SERVER_-_CPU",
        // account: "SP",
        service: "Database",
        resource: "CPU",
        product: "Quiver PRO"
    },
    {
        dashboardName: "Memoria_Banco_QuiverPRO",
        // account: "PG",
        service: "Database",
        resource: "Memory",
        product: "Quiver PRO"
    },
   
]