-- DropForeignKey
ALTER TABLE `TransactionsTickets` DROP FOREIGN KEY `TransactionsTickets_promosDateId_fkey`;

-- DropForeignKey
ALTER TABLE `TransactionsTickets` DROP FOREIGN KEY `TransactionsTickets_promosReferralId_fkey`;

-- AlterTable
ALTER TABLE `TransactionsTickets` MODIFY `promosDateId` INTEGER NULL,
    MODIFY `promosReferralId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TransactionsTickets` ADD CONSTRAINT `TransactionsTickets_promosDateId_fkey` FOREIGN KEY (`promosDateId`) REFERENCES `PromosDate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionsTickets` ADD CONSTRAINT `TransactionsTickets_promosReferralId_fkey` FOREIGN KEY (`promosReferralId`) REFERENCES `PromosReferral`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
