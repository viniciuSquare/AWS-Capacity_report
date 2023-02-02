/*
  Warnings:

  - A unique constraint covering the columns `[resource,service,instanceId,date]` on the table `Metrics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Metrics` DROP FOREIGN KEY `Metrics_instancesId_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `Metrics_resource_service_instanceId_date_key` ON `Metrics`(`resource`, `service`, `instanceId`, `date`);

-- AddForeignKey
ALTER TABLE `Metrics` ADD CONSTRAINT `Metrics_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `instances_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
