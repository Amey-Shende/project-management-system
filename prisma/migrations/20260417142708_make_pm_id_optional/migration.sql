-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_pmId_fkey`;

-- DropIndex
DROP INDEX `projects_pmId_fkey` ON `projects`;

-- AlterTable
ALTER TABLE `projects` MODIFY `pmId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_pmId_fkey` FOREIGN KEY (`pmId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
