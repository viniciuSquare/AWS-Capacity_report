/*
  Warnings:

  - The values [NORTURNO] on the enum `metrics_period` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `metrics` MODIFY `period` ENUM('DIA', 'NORMAL', 'PICO', 'NOTURNO') NOT NULL;
