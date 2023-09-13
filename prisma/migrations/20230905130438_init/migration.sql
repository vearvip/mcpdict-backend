/*
  Warnings:

  - You are about to alter the column `pianQv` on the `fangyan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `shiyi` on the `yongfa` table. All the data in the column will be lost.
  - You are about to drop the column `ziYinId` on the `yongfa` table. All the data in the column will be lost.
  - You are about to drop the `ziyin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duYinId` to the `YongFa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shiYi` to the `YongFa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `yongfa` DROP FOREIGN KEY `YongFa_ziYinId_fkey`;

-- DropForeignKey
ALTER TABLE `ziyin` DROP FOREIGN KEY `ZiYin_fangYanId_fkey`;

-- AlterTable
ALTER TABLE `fangyan` MODIFY `pianQv` INTEGER NULL;

-- AlterTable
ALTER TABLE `yongfa` DROP COLUMN `shiyi`,
    DROP COLUMN `ziYinId`,
    ADD COLUMN `duYinId` INTEGER NOT NULL,
    ADD COLUMN `shiYi` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ziyin`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `role` ENUM('user', 'admin') NULL DEFAULT 'user',

    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zi` VARCHAR(191) NOT NULL,
    `ziTu` VARCHAR(191) NULL,
    `xinHuaShiYi` VARCHAR(191) NULL,
    `fangYanId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DuYin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shengMu` VARCHAR(191) NOT NULL,
    `yunMu` VARCHAR(191) NOT NULL,
    `diaoZhi` VARCHAR(191) NOT NULL,
    `ziId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FangYanToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FangYanToUser_AB_unique`(`A`, `B`),
    INDEX `_FangYanToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Zi` ADD CONSTRAINT `Zi_fangYanId_fkey` FOREIGN KEY (`fangYanId`) REFERENCES `FangYan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DuYin` ADD CONSTRAINT `DuYin_ziId_fkey` FOREIGN KEY (`ziId`) REFERENCES `Zi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YongFa` ADD CONSTRAINT `YongFa_duYinId_fkey` FOREIGN KEY (`duYinId`) REFERENCES `DuYin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FangYanToUser` ADD CONSTRAINT `_FangYanToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `FangYan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FangYanToUser` ADD CONSTRAINT `_FangYanToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
