/*
  Warnings:

  - You are about to drop the `Metrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Metrics` DROP FOREIGN KEY `Metrics_instanceId_fkey`;

-- DropTable
DROP TABLE `Metrics`;

-- CreateTable
CREATE TABLE `metrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource` ENUM('CPU', 'Memory') NOT NULL,
    `service` ENUM('Application', 'Database') NOT NULL,
    `instanceId` INTEGER NOT NULL,
    `maximumUsage` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `metrics_resource_service_instanceId_date_key`(`resource`, `service`, `instanceId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `instances_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
