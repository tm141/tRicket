/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Users_referralCode_key` ON `Users`(`referralCode`);
