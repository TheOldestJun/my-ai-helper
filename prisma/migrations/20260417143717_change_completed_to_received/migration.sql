/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderProduct_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `OrderProduct` MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'PAID', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
