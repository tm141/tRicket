/*
  Warnings:

  - Made the column `usePoints` on table `TransactionsTickets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Transactions` MODIFY `total` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `TransactionsTickets` ADD COLUMN `referralCode` VARCHAR(191) NULL,
    MODIFY `usePoints` BOOLEAN NOT NULL DEFAULT false;
