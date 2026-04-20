-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderProductId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'PAID', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') NOT NULL,
    `newStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'PAID', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') NOT NULL,
    `changedById` VARCHAR(191) NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderProductId_idx`(`orderProductId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderProductId_fkey` FOREIGN KEY (`orderProductId`) REFERENCES `OrderProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
