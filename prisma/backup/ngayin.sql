-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        11.1.2-MariaDB - mariadb.org binary distribution
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 导出 fangyan 的数据库结构
DROP DATABASE IF EXISTS `fangyan`;
CREATE DATABASE IF NOT EXISTS `fangyan` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `fangyan`;

-- 导出  表 fangyan.duyin 结构
DROP TABLE IF EXISTS `duyin`;
CREATE TABLE IF NOT EXISTS `duyin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shengMu` varchar(191) NOT NULL,
  `yunMu` varchar(191) NOT NULL,
  `diaoZhi` varchar(191) NOT NULL,
  `ziId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DuYin_ziId_fkey` (`ziId`),
  CONSTRAINT `DuYin_ziId_fkey` FOREIGN KEY (`ziId`) REFERENCES `zi` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan.duyin 的数据：~5 rows (大约)
INSERT IGNORE INTO `duyin` (`id`, `shengMu`, `yunMu`, `diaoZhi`, `ziId`) VALUES
	(1, 'h', 'a', '6', 1),
	(2, 'x', 'ia', '5', 2),
	(3, 'n', 'in', '2', 3),
	(4, 'g', 'iao', '5', 4),
	(5, 'j', 'iao', '5', 5);

-- 导出  表 fangyan.fangyan 结构
DROP TABLE IF EXISTS `fangyan`;
CREATE TABLE IF NOT EXISTS `fangyan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mingZi` varchar(191) NOT NULL,
  `x` varchar(191) DEFAULT NULL,
  `y` varchar(191) DEFAULT NULL,
  `pianQv` int(11) DEFAULT NULL,
  `jiBie` varchar(191) DEFAULT NULL,
  `jieShao` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `FangYan_mingZi_key` (`mingZi`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan.fangyan 的数据：~2 rows (大约)
INSERT IGNORE INTO `fangyan` (`id`, `mingZi`, `x`, `y`, `pianQv`, `jiBie`, `jieShao`) VALUES
	(1, '云梦泽', NULL, NULL, NULL, NULL, NULL),
	(2, '酆都', NULL, NULL, NULL, NULL, NULL);

-- 导出  表 fangyan.user 结构
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan.user 的数据：~1 rows (大约)
INSERT IGNORE INTO `user` (`id`, `name`, `email`, `password`, `avatar`, `role`) VALUES
	(1, '张三', '1', '1', NULL, 'user'),
	(2, '李四', '1', '1', NULL, 'user');

-- 导出  表 fangyan.yongfa 结构
DROP TABLE IF EXISTS `yongfa`;
CREATE TABLE IF NOT EXISTS `yongfa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zuCi` varchar(191) DEFAULT NULL,
  `zaoJv` varchar(191) DEFAULT NULL,
  `duYinId` int(11) NOT NULL,
  `shiYi` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `YongFa_duYinId_fkey` (`duYinId`),
  CONSTRAINT `YongFa_duYinId_fkey` FOREIGN KEY (`duYinId`) REFERENCES `duyin` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan.yongfa 的数据：~1 rows (大约)
INSERT IGNORE INTO `yongfa` (`id`, `zuCi`, `zaoJv`, `duYinId`, `shiYi`) VALUES
	(1, '向下', '朝下看看', 1, '下面、和上相对');

-- 导出  表 fangyan.zi 结构
DROP TABLE IF EXISTS `zi`;
CREATE TABLE IF NOT EXISTS `zi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zi` varchar(191) NOT NULL,
  `ziTu` varchar(191) DEFAULT NULL,
  `xinHuaShiYi` varchar(191) DEFAULT NULL,
  `fangYanId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Zi_fangYanId_fkey` (`fangYanId`),
  CONSTRAINT `Zi_fangYanId_fkey` FOREIGN KEY (`fangYanId`) REFERENCES `fangyan` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan.zi 的数据：~5 rows (大约)
INSERT IGNORE INTO `zi` (`id`, `zi`, `ziTu`, `xinHuaShiYi`, `fangYanId`) VALUES
	(1, '下', NULL, NULL, 1),
	(2, '下', NULL, NULL, 2),
	(3, '人', NULL, NULL, 1),
	(4, '叫', NULL, NULL, 1),
	(5, '叫', NULL, NULL, 2);

-- 导出  表 fangyan._fangyantouser 结构
DROP TABLE IF EXISTS `_fangyantouser`;
CREATE TABLE IF NOT EXISTS `_fangyantouser` (
  `A` int(11) NOT NULL,
  `B` int(11) NOT NULL,
  UNIQUE KEY `_FangYanToUser_AB_unique` (`A`,`B`),
  KEY `_FangYanToUser_B_index` (`B`),
  CONSTRAINT `_FangYanToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `fangyan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_FangYanToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan._fangyantouser 的数据：~0 rows (大约)

-- 导出  表 fangyan._prisma_migrations 结构
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 正在导出表  fangyan._prisma_migrations 的数据：~2 rows (大约)
INSERT IGNORE INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('80a0aa2a-5463-443e-add5-6ba51c36e0cf', '8c4592d4d767c88ac318199da7638d5b71f69c7352bb60ac29ae100617cf9e34', '2023-09-05 13:04:39.099', '20230905130438_init', NULL, NULL, '2023-09-05 13:04:38.784', 1),
	('90742758-2f7a-4c22-96f6-4b4f953b1153', '815a84ce08405f68f1a0d6c64cc82ef0ab4e72616553fb7033c55213224a7adc', '2023-09-05 13:04:38.460', '20220817145213_init', NULL, NULL, '2023-09-05 13:04:38.356', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
