/*
  Warnings:

  - You are about to drop the column `fName` on the `Organizers` table. All the data in the column will be lost.
  - You are about to drop the column `lName` on the `Organizers` table. All the data in the column will be lost.
  - Added the required column `name` to the `Organizers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Organizers` DROP COLUMN `fName`,
    DROP COLUMN `lName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
