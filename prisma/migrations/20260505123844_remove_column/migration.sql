/*
  Warnings:

  - You are about to drop the column `pmId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `tlId` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_pmId_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_tlId_fkey`;

-- DropIndex
DROP INDEX `projects_pmId_fkey` ON `projects`;

-- DropIndex
DROP INDEX `projects_tlId_fkey` ON `projects`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `pmId`,
    DROP COLUMN `tlId`;
