/*
  Warnings:

  - Made the column `role` on table `projectmember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `projectmember` MODIFY `role` ENUM('CEO', 'PM', 'TL', 'TM') NOT NULL;
