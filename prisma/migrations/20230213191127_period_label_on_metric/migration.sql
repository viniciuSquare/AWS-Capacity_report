/*
  Warnings:

  - Added the required column `period` to the `metrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `metrics` ADD COLUMN `period` ENUM('DIA', 'NORMAL', 'PICO', 'NORTURNO') NOT NULL;
