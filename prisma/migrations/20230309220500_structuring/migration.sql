-- AlterTable
ALTER TABLE `metrics` MODIFY `resource` ENUM('CPU', 'Memory') NULL,
    MODIFY `service` ENUM('Application', 'Database') NULL,
    MODIFY `period` ENUM('DIA', 'NORMAL', 'PICO', 'NOTURNO') NULL;
