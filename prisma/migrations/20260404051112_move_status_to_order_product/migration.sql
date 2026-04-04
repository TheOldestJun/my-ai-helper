/*
  Warnings:

  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `OrderProduct` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'PAID', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
