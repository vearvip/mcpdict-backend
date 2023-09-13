-- CreateTable
CREATE TABLE `FangYan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mingZi` VARCHAR(191) NOT NULL,
    `x` VARCHAR(191) NULL,
    `y` VARCHAR(191) NULL,
    `pianQv` VARCHAR(191) NULL,
    `jiBie` VARCHAR(191) NULL,
    `jieShao` VARCHAR(191) NULL,

    UNIQUE INDEX `FangYan_mingZi_key`(`mingZi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ZiYin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zi` VARCHAR(191) NOT NULL,
    `maDian` VARCHAR(191) NOT NULL,
    `shengMu` VARCHAR(191) NOT NULL,
    `yunMu` VARCHAR(191) NOT NULL,
    `diaoZhi` VARCHAR(191) NULL,
    `shengMu2` VARCHAR(191) NULL,
    `yunMu2` VARCHAR(191) NULL,
    `diaoZhi2` VARCHAR(191) NULL,
    `fangYanId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YongFa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shiyi` VARCHAR(191) NULL,
    `zuCi` VARCHAR(191) NULL,
    `zaoJv` VARCHAR(191) NULL,
    `ziYinId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ZiYin` ADD CONSTRAINT `ZiYin_fangYanId_fkey` FOREIGN KEY (`fangYanId`) REFERENCES `FangYan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YongFa` ADD CONSTRAINT `YongFa_ziYinId_fkey` FOREIGN KEY (`ziYinId`) REFERENCES `ZiYin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
