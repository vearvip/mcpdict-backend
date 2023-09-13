/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `yinBiao` to the `DuYin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `duyin` ADD COLUMN `yinBiao` VARCHAR(191) NOT NULL,
    MODIFY `shengMu` VARCHAR(191) NULL,
    MODIFY `yunMu` VARCHAR(191) NULL,
    MODIFY `diaoZhi` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
