-- AlterTable
ALTER TABLE `OrderProduct` ADD COLUMN `statusChangedAt` DATETIME(3) NULL,
    ADD COLUMN `statusChangedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderProduct` ADD CONSTRAINT `OrderProduct_statusChangedById_fkey` FOREIGN KEY (`statusChangedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
