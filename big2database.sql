-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.1.2-MariaDB - MariaDB Server
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for myproject
CREATE DATABASE IF NOT EXISTS `myproject` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `myproject`;

-- Dumping structure for table myproject.card
CREATE TABLE IF NOT EXISTS `card` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `suit` enum('SPADES','HEARTS','CLUBS','DIAMOND') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table myproject.card: ~52 rows (approximately)
INSERT INTO `card` (`id`, `number`, `suit`) VALUES
	(1, 2, 'DIAMOND'),
	(2, 2, 'CLUBS'),
	(3, 2, 'HEARTS'),
	(4, 2, 'SPADES'),
	(5, 14, 'DIAMOND'),
	(6, 14, 'CLUBS'),
	(7, 14, 'HEARTS'),
	(8, 14, 'SPADES'),
	(9, 13, 'DIAMOND'),
	(10, 13, 'CLUBS'),
	(11, 13, 'HEARTS'),
	(12, 13, 'SPADES'),
	(13, 12, 'DIAMOND'),
	(14, 12, 'CLUBS'),
	(15, 12, 'HEARTS'),
	(16, 12, 'SPADES'),
	(17, 11, 'DIAMOND'),
	(18, 11, 'CLUBS'),
	(19, 11, 'HEARTS'),
	(20, 11, 'SPADES'),
	(21, 10, 'DIAMOND'),
	(22, 10, 'CLUBS'),
	(23, 10, 'HEARTS'),
	(24, 10, 'SPADES'),
	(25, 9, 'DIAMOND'),
	(26, 9, 'CLUBS'),
	(27, 9, 'HEARTS'),
	(28, 9, 'SPADES'),
	(29, 8, 'DIAMOND'),
	(30, 8, 'CLUBS'),
	(31, 8, 'HEARTS'),
	(32, 8, 'SPADES'),
	(33, 7, 'DIAMOND'),
	(34, 7, 'CLUBS'),
	(35, 7, 'HEARTS'),
	(36, 7, 'SPADES'),
	(37, 6, 'DIAMOND'),
	(38, 6, 'CLUBS'),
	(39, 6, 'HEARTS'),
	(40, 6, 'SPADES'),
	(41, 5, 'DIAMOND'),
	(42, 5, 'CLUBS'),
	(43, 5, 'HEARTS'),
	(44, 5, 'SPADES'),
	(45, 4, 'DIAMOND'),
	(46, 4, 'CLUBS'),
	(47, 4, 'HEARTS'),
	(48, 4, 'SPADES'),
	(49, 3, 'DIAMOND'),
	(50, 3, 'CLUBS'),
	(51, 3, 'HEARTS'),
	(52, 3, 'SPADES');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
