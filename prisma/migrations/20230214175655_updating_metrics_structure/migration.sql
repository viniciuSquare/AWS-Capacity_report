/*
  Warnings:

  - Added the required column `product` to the `metrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `metrics` ADD COLUMN `product` ENUM('Quiver_PRO', 'Quiver_PLUS') NOT NULL;
