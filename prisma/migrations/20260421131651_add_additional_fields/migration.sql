-- AlterTable
ALTER TABLE `projectmember` ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `role` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN `progress` TINYINT NOT NULL DEFAULT 0,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `techstack` JSON NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar` VARCHAR(255) NULL,
    ADD COLUMN `department` VARCHAR(50) NULL,
    ADD COLUMN `designation` VARCHAR(50) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `skills` JSON NULL;
