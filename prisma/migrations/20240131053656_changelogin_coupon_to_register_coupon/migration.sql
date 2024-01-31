/*
  Warnings:

  - You are about to drop the column `loginCoupon` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `loginCoupon`,
    ADD COLUMN `registerCoupon` BOOLEAN NULL DEFAULT false;
