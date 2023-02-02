/*
  Warnings:

  - Added the required column `product` to the `aws_dashboard_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `aws_dashboard_details` ADD COLUMN `product` ENUM('Quiver_PRO', 'Quiver_PLUS') NOT NULL;
