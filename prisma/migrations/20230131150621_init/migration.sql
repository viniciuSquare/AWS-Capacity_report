-- CreateTable
CREATE TABLE `Metrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource` ENUM('CPU', 'Memory') NOT NULL,
    `service` ENUM('Application', 'Database') NOT NULL,
    `instanceId` INTEGER NOT NULL,
    `maximumUsage` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instances_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanceId` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `instanceType` VARCHAR(191) NULL,
    `keyName` VARCHAR(191) NULL,
    `monitoring` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `privateDnsName` VARCHAR(191) NULL,
    `privateIpAddress` VARCHAR(191) NULL,
    `publicDnsName` VARCHAR(191) NULL,
    `publicIpAddress` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `platformDetails` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aws_dashboard_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dashboardName` VARCHAR(191) NOT NULL,
    `service` ENUM('Application', 'Database') NOT NULL,
    `resource` ENUM('CPU', 'Memory') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Metrics` ADD CONSTRAINT `Metrics_instancesId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `instances_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
