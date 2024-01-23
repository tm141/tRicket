-- AlterTable
ALTER TABLE `Events` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Feedbacks` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Organizers` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PaymentTypes` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PromosDate` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PromosReferral` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Roles` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Tickets` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Transactions` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `TransactionsTickets` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UsersRoles` MODIFY `updatedAt` DATETIME(3) NULL;
