import { QuiverProducts } from "@prisma/client";
import { metricsByDashboardName } from "../src/Metadata/MetricsByDashboardName";
import { prisma } from "../src/service/prisma";


metricsByDashboardName.forEach(async ({ dashboardName, service, resource, product }) => {
    const existingRecord = await prisma.aWSDashboardDetails.findFirst({
        where: {
            dashboardName
        }
    })

    if (!existingRecord && product && service && resource) {
        // To match Enum class
        const formattedProduct: QuiverProducts = product.replace(' ','_') as QuiverProducts;

        await prisma.aWSDashboardDetails.create({
            data: {
                dashboardName,
                service,
                resource,
                product: formattedProduct
            }
        }).then(() => {
            console.log(dashboardName, " dashboard saved")
        })
    }
});