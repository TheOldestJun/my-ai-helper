-- CreateIndex
CREATE INDEX `Order_archivedAt_idx` ON `Order`(`archivedAt`);

-- CreateIndex
CREATE INDEX `OrderProduct_status_idx` ON `OrderProduct`(`status`);
