/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `OrderProduct` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `OrderProduct` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `OrderProduct` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `OrderProduct` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `OrderProduct` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_rejectedById_fkey`;

-- DropForeignKey
ALTER TABLE `OrderProduct` DROP FOREIGN KEY `OrderProduct_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `OrderProduct` DROP FOREIGN KEY `OrderProduct_rejectedById_fkey`;

-- DropIndex
DROP INDEX `Order_approvedById_fkey` ON `Order`;

-- DropIndex
DROP INDEX `Order_rejectedById_fkey` ON `Order`;

-- DropIndex
DROP INDEX `OrderProduct_approvedById_fkey` ON `OrderProduct`;

-- DropIndex
DROP INDEX `OrderProduct_rejectedById_fkey` ON `OrderProduct`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `approvedAt`,
    DROP COLUMN `approvedById`,
    DROP COLUMN `rejectedAt`,
    DROP COLUMN `rejectedById`,
    DROP COLUMN `rejectionReason`;

-- AlterTable
ALTER TABLE `OrderProduct` DROP COLUMN `approvedAt`,
    DROP COLUMN `approvedById`,
    DROP COLUMN `rejectedAt`,
    DROP COLUMN `rejectedById`,
    DROP COLUMN `rejectionReason`;
