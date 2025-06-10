-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: wabotresto
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `daftar_menu`
--

DROP TABLE IF EXISTS `daftar_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daftar_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url_gambar` text,
  `varian_menu` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daftar_menu`
--

LOCK TABLES `daftar_menu` WRITE;
/*!40000 ALTER TABLE `daftar_menu` DISABLE KEYS */;
INSERT INTO `daftar_menu` VALUES (1,'https://raw.githubusercontent.com/adialfatih/wabot-resto2/refs/heads/main/public/menu1.png','var1'),(2,'https://raw.githubusercontent.com/adialfatih/wabot-resto2/refs/heads/main/public/menu2.png','seafood');
/*!40000 ALTER TABLE `daftar_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gambar_qris`
--

DROP TABLE IF EXISTS `gambar_qris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gambar_qris` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url_gambar` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gambar_qris`
--

LOCK TABLES `gambar_qris` WRITE;
/*!40000 ALTER TABLE `gambar_qris` DISABLE KEYS */;
INSERT INTO `gambar_qris` VALUES (1,'https://raw.githubusercontent.com/adialfatih/wabot-resto2/refs/heads/main/public/qr.png');
/*!40000 ALTER TABLE `gambar_qris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembayaran_kodeunik`
--

DROP TABLE IF EXISTS `pembayaran_kodeunik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pembayaran_kodeunik` (
  `kode_pesanan` varchar(35) NOT NULL,
  `total_asli` int NOT NULL,
  `kode_unik` int NOT NULL,
  `total_tagihan` int NOT NULL,
  `status` enum('Menunggu Pembayaran','Dibayar') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembayaran_kodeunik`
--

LOCK TABLES `pembayaran_kodeunik` WRITE;
/*!40000 ALTER TABLE `pembayaran_kodeunik` DISABLE KEYS */;
INSERT INTO `pembayaran_kodeunik` VALUES ('OR001',225000,827,225827,'Menunggu Pembayaran'),('OR002',65000,122,65122,'Menunggu Pembayaran');
/*!40000 ALTER TABLE `pembayaran_kodeunik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pesan_masuk`
--

DROP TABLE IF EXISTS `pesan_masuk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pesan_masuk` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomor_wa` varchar(20) DEFAULT NULL,
  `isi_pesan` text,
  `tanggal_jam` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pesan_masuk`
--

LOCK TABLES `pesan_masuk` WRITE;
/*!40000 ALTER TABLE `pesan_masuk` DISABLE KEYS */;
INSERT INTO `pesan_masuk` VALUES (1,'6289651253545@c.us','tes','2025-06-04 13:57:41'),(2,'6289651253545@c.us','hai','2025-06-04 13:57:50'),(3,'6289651253545@c.us','halo','2025-06-04 13:57:59'),(4,'6289651253545@c.us','hai','2025-06-04 13:59:14'),(5,'6289651253545@c.us','halo','2025-06-04 13:59:19'),(6,'6289651253545@c.us','daftar','2025-06-04 13:59:27'),(7,'6289651253545@c.us','Ronaldo','2025-06-04 13:59:36'),(8,'6289651253545@c.us','menu','2025-06-04 13:59:41'),(9,'6289651253545@c.us','help','2025-06-04 13:59:58'),(10,'6289651253545@c.us','pesan','2025-06-04 14:00:08'),(11,'6289651253545@c.us','#1','2025-06-04 14:00:13'),(12,'6289651253545@c.us','#2 x2','2025-06-04 14:00:20'),(13,'6289651253545@c.us','es teh','2025-06-04 14:00:27'),(14,'6289651253545@c.us','teh hangat x2','2025-06-04 14:00:36'),(15,'6289651253545@c.us','selesai','2025-06-04 14:00:41'),(16,'6289651253545@c.us','ya','2025-06-04 14:00:46'),(17,'6289651253545@c.us','delivery','2025-06-04 14:00:53'),(18,'6289651253545@c.us','Jl. Hos Cokroaminoto Gg.2 Kuripan Kidul No.312','2025-06-04 14:01:13'),(19,'6289651253545@c.us','qris','2025-06-04 14:01:17'),(20,'6289651253545@c.us','status','2025-06-04 14:32:59'),(21,'6289651253545@c.us','hai','2025-06-04 14:33:15'),(22,'6289651253545@c.us','batal','2025-06-04 14:33:37'),(23,'6289651253545@c.us','tidak','2025-06-04 14:33:40'),(24,'6289651253545@c.us','pesan','2025-06-04 14:34:44'),(25,'6287713614538@c.us','','2025-06-04 14:39:53'),(26,'6287713614538@c.us','','2025-06-04 14:39:53'),(27,'6287713614538@c.us','Ciken','2025-06-04 14:39:53'),(28,'6287713614538@c.us','Menu','2025-06-04 14:40:06'),(29,'6287713614538@c.us','Daftar','2025-06-04 14:40:18'),(30,'6287713614538@c.us','Husein','2025-06-04 14:40:24'),(31,'6287713614538@c.us','Menu','2025-06-04 14:40:30'),(32,'6287713614538@c.us','Ciken','2025-06-04 14:40:45'),(33,'6287713614538@c.us','13','2025-06-04 14:40:54'),(34,'6287713614538@c.us','Menu','2025-06-04 14:41:04'),(35,'6287713614538@c.us','Chicken','2025-06-04 14:41:15'),(36,'6287713614538@c.us','Pay','2025-06-04 14:41:24'),(37,'6289651253545@c.us','tes','2025-06-04 14:50:08'),(38,'6287713614538@c.us','Pesan','2025-06-04 14:50:38'),(39,'6289651253545@c.us','status','2025-06-04 14:50:48'),(40,'6287713614538@c.us','Selesai','2025-06-04 14:51:03'),(41,'6287713614538@c.us','Menu','2025-06-04 14:51:13'),(42,'6287713614538@c.us','Sea scallop','2025-06-04 14:51:30'),(43,'6287713614538@c.us','Hot tea','2025-06-04 14:51:43'),(44,'6287713614538@c.us','Total','2025-06-04 14:51:51'),(45,'6287713614538@c.us','Total','2025-06-04 14:52:01'),(46,'6289651253545@c.us','cara pesan','2025-06-04 15:51:10'),(47,'6289651253545@c.us','pesan bagaimana','2025-06-04 15:52:11'),(48,'6289651253545@c.us','batal','2025-06-04 15:53:03'),(49,'6289651253545@c.us','ya','2025-06-04 15:53:07'),(50,'6289651253545@c.us','pesan','2025-06-04 15:53:11'),(51,'6289651253545@c.us','ciken','2025-06-04 15:53:18'),(52,'6289651253545@c.us','beef','2025-06-04 15:53:23'),(53,'6289651253545@c.us','list','2025-06-04 15:53:26'),(54,'6289651253545@c.us','esteh x2','2025-06-04 15:53:41'),(55,'6289651253545@c.us','coret grilled beef','2025-06-04 15:53:51'),(56,'6289651253545@c.us','list','2025-06-04 15:53:54'),(57,'6289651253545@c.us','selesai','2025-06-04 15:54:00'),(58,'6289651253545@c.us','udah','2025-06-04 15:54:05'),(59,'6289651253545@c.us','y','2025-06-04 15:54:21'),(60,'6289651253545@c.us','help','2025-06-04 15:56:02'),(61,'6289651253545@c.us','h','2025-06-04 15:56:05'),(62,'6289651253545@c.us','cara pesan','2025-06-04 15:56:18'),(63,'6289651253545@c.us','help','2025-06-04 15:56:31'),(64,'6289651253545@c.us','status','2025-06-04 15:56:42'),(65,'6287713614538@c.us','Totalnya','2025-06-04 18:46:21'),(66,'6289651253545@c.us','status','2025-06-04 23:40:01'),(67,'6289651253545@c.us','hai','2025-06-04 23:45:05'),(68,'6289651253545@c.us','info','2025-06-04 23:45:20'),(69,'6289651253545@c.us','cara pesan','2025-06-04 23:45:28'),(70,'6289651253545@c.us','bisa banget pak, 😁','2025-06-05 08:35:27'),(71,'6289651253545@c.us','bisa buat pemesanan batik berbasis AI smart customer care','2025-06-05 08:35:52'),(72,'6289651253545@c.us','hai','2025-06-05 12:50:50'),(73,'6285201127759@c.us','Status','2025-06-05 22:02:27'),(74,'6285201127759@c.us','Daftar','2025-06-05 22:04:06'),(75,'6285201127759@c.us','Fatimah','2025-06-05 22:04:10'),(76,'6287713614538@c.us','Menu','2025-06-06 04:45:53'),(77,'6287713614538@c.us','#1','2025-06-06 04:46:14'),(78,'6287713614538@c.us','Cara','2025-06-06 04:46:23'),(79,'6287713614538@c.us','Cara pesan','2025-06-06 04:46:26'),(80,'6287713614538@c.us','#1','2025-06-06 04:46:52'),(81,'6287713614538@c.us','Help','2025-06-06 04:47:02'),(82,'6287713614538@c.us','#pesan','2025-06-06 04:47:15'),(83,'6287713614538@c.us','Menu','2025-06-06 04:47:22'),(84,'6287713614538@c.us','#20','2025-06-06 04:47:33'),(85,'6287713614538@c.us','Pesan #20','2025-06-06 04:47:41'),(86,'6287713614538@c.us','Pembayaran','2025-06-06 04:48:01'),(87,'6287713614538@c.us','Cara pesan','2025-06-06 09:33:25'),(88,'6287713614538@c.us','Menu','2025-06-06 09:33:51'),(89,'6287713614538@c.us','#1','2025-06-06 09:34:15'),(90,'6287713614538@c.us','1','2025-06-06 09:34:20'),(91,'6287713614538@c.us','2','2025-06-06 09:34:24'),(92,'6287713614538@c.us','#4','2025-06-06 09:34:28'),(93,'6287713614538@c.us','Menu','2025-06-06 09:34:50'),(94,'6287713614538@c.us','Pesan 12','2025-06-06 09:34:57'),(95,'6287713614538@c.us','Menu','2025-06-06 09:51:33'),(96,'6287713614538@c.us','Spicy crab','2025-06-06 09:51:47'),(97,'6287713614538@c.us','Pesan dulu','2025-06-06 10:20:47'),(98,'6287713614538@c.us','Cara pesan','2025-06-06 10:21:05'),(99,'6287713614538@c.us','Menu','2025-06-06 10:21:23'),(100,'6287713614538@c.us','Pesan #20','2025-06-06 10:21:34'),(101,'6287713614538@c.us','Pesan','2025-06-06 10:22:41'),(102,'6287713614538@c.us','#1','2025-06-06 10:24:31'),(103,'6287713614538@c.us','#es teh','2025-06-06 10:24:42'),(104,'6287713614538@c.us','Jumlah','2025-06-06 10:24:53'),(105,'6287713614538@c.us','Selesai','2025-06-06 10:24:58'),(106,'6287713614538@c.us','Sudah','2025-06-06 10:25:09'),(107,'6287713614538@c.us','Dine in','2025-06-06 10:25:16'),(108,'6287713614538@c.us','02','2025-06-06 10:25:22'),(109,'6287713614538@c.us','Qris','2025-06-06 10:25:26'),(110,'6289651253545@c.us','help','2025-06-06 14:22:12'),(111,'6289651253545@c.us','pesan','2025-06-06 14:23:37'),(112,'6289651253545@c.us','#1','2025-06-06 14:23:46'),(113,'6289651253545@c.us','#2x2','2025-06-06 14:23:57'),(114,'6289651253545@c.us','#3x1','2025-06-06 14:24:05'),(115,'6289651253545@c.us','Ice tea','2025-06-06 14:24:17'),(116,'6289651253545@c.us','teh hanget x 3','2025-06-06 14:24:57'),(117,'6289651253545@c.us','list','2025-06-06 14:25:01'),(118,'6289651253545@c.us','coret hot tea','2025-06-06 14:26:26'),(119,'6289651253545@c.us','list','2025-06-06 14:26:31'),(120,'6289651253545@c.us','hot tea x2','2025-06-06 14:26:39'),(121,'6289651253545@c.us','selesai','2025-06-06 14:26:44'),(122,'6289651253545@c.us','ya','2025-06-06 14:26:52'),(123,'6289651253545@c.us','take away','2025-06-06 14:30:18'),(124,'6289651253545@c.us','cash','2025-06-06 14:30:22'),(125,'6289651253545@c.us','status','2025-06-06 14:30:33'),(126,'6289651253545@c.us','tes','2025-06-07 11:34:58'),(127,'6289651253545@c.us','hai','2025-06-07 11:35:02'),(128,'6289651253545@c.us','halo','2025-06-07 13:03:47'),(129,'6289651253545@c.us','hi','2025-06-07 13:03:51'),(130,'6285643130806@c.us','Hay','2025-06-07 13:04:00'),(131,'6285643130806@c.us','Daftar','2025-06-07 13:04:16'),(132,'6285643130806@c.us','Rembo','2025-06-07 13:04:38'),(133,'6285643130806@c.us','Menu','2025-06-07 13:05:57'),(134,'6285643130806@c.us','Help','2025-06-07 13:06:33'),(135,'6285643130806@c.us','Pesan','2025-06-07 13:06:46'),(136,'6285643130806@c.us','#1','2025-06-07 13:06:57'),(137,'6285643130806@c.us','#2x','2025-06-07 13:07:11'),(138,'6285643130806@c.us','#2x2','2025-06-07 13:07:28'),(139,'6285643130806@c.us','Es teh','2025-06-07 13:07:40'),(140,'6285643130806@c.us','Teh anget','2025-06-07 13:08:02'),(141,'6285643130806@c.us','List','2025-06-07 13:08:13'),(142,'6285643130806@c.us','Beef','2025-06-07 13:08:31'),(143,'6285643130806@c.us','List','2025-06-07 13:08:41'),(144,'6285643130806@c.us','Coret','2025-06-07 13:08:56'),(145,'6285643130806@c.us','Coret grilled beef','2025-06-07 13:09:11'),(146,'6285643130806@c.us','Liat','2025-06-07 13:09:25'),(147,'6285643130806@c.us','List','2025-06-07 13:09:38'),(148,'6285643130806@c.us','Selesai','2025-06-07 13:09:46'),(149,'6285643130806@c.us','Ya','2025-06-07 13:09:55'),(150,'6285643130806@c.us','Dine in','2025-06-07 13:10:10'),(151,'6285643130806@c.us','7','2025-06-07 13:10:14'),(152,'6285643130806@c.us','Cash','2025-06-07 13:10:27'),(153,'6285643130806@c.us','Status','2025-06-07 13:10:56'),(154,'6285643130806@c.us','Pesan','2025-06-07 13:11:05'),(155,'6285643130806@c.us','Batal','2025-06-07 13:11:30'),(156,'6285643130806@c.us','Ya','2025-06-07 13:11:39');
/*!40000 ALTER TABLE `pesan_masuk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pesanan`
--

DROP TABLE IF EXISTS `pesanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pesanan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode_pesanan` varchar(10) DEFAULT NULL,
  `nomor_wa` varchar(20) DEFAULT NULL,
  `daftar_kode_menu` text,
  `total_harga` int DEFAULT NULL,
  `metode_pengambilan` enum('Dine In','Take Away','Delivery') DEFAULT NULL,
  `alamat` text,
  `no_meja` varchar(10) DEFAULT NULL,
  `metode_pembayaran` enum('Cash','QRIS') DEFAULT NULL,
  `status` enum('Menunggu Pembayaran','Dibayar','Sedang dibuat','Selesai','Dibatalkan') DEFAULT NULL,
  `tanggal` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_pesanan` (`kode_pesanan`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pesanan`
--

LOCK TABLES `pesanan` WRITE;
/*!40000 ALTER TABLE `pesanan` DISABLE KEYS */;
INSERT INTO `pesanan` VALUES (1,'OR001','6289651253545@c.us','1x1,2x2,9x1,10x2',225000,'Delivery','Jl. Hos Cokroaminoto Gg.2 Kuripan Kidul No.312',NULL,'QRIS','Dibatalkan','2025-06-04 14:01:17','2025-06-04 14:01:17'),(2,'OR002','6287713614538@c.us','1x1,9x1',65000,'Dine In',NULL,'02','QRIS','Menunggu Pembayaran','2025-06-06 10:25:26','2025-06-06 10:25:26'),(3,'OR003','6289651253545@c.us','1x1,2x2,3x1,9x1,10x2',295000,'Take Away',NULL,NULL,'Cash','Menunggu Pembayaran','2025-06-06 14:30:22','2025-06-06 14:30:22'),(4,'OR004','6285643130806@c.us','1x1,2x2,9x1,10x1,21x1',315000,'Dine In',NULL,'7','Cash','Dibatalkan','2025-06-07 13:10:27','2025-06-07 13:10:27');
/*!40000 ALTER TABLE `pesanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_menu`
--

DROP TABLE IF EXISTS `table_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_menu` (
  `kode_menu` varchar(10) NOT NULL,
  `nama_menu` varchar(100) DEFAULT NULL,
  `alias` varchar(235) NOT NULL DEFAULT '',
  `harga` int DEFAULT NULL,
  `kategori` varchar(45) NOT NULL DEFAULT 'null',
  `varians` varchar(55) NOT NULL DEFAULT 'null',
  PRIMARY KEY (`kode_menu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_menu`
--

LOCK TABLES `table_menu` WRITE;
/*!40000 ALTER TABLE `table_menu` DISABLE KEYS */;
INSERT INTO `table_menu` VALUES ('1','CHICKEN STEAK MEDIUM','',50000,'FOOD','CHICKEN'),('10','HOT TEA','teh anget,teh hangat,teh panas',20000,'DRINK','TEA'),('11','HOT LEMON','',20000,'DRINK','LEMON'),('12','ICE LEMON','',25000,'DRINK','LEMON'),('13','SEA SCALLOP','',200000,'FOOD','SEA FOOD'),('14','SPICY CRAB','',210000,'FOOD','SEA FOOD'),('15','SPINY LOBSTER','',220000,'FOOD','SEA FOOD'),('16','GRILLED LOBSTER','',230000,'FOOD','SEA FOOD'),('17','OYSTER','',240000,'FOOD','SEA FOOD'),('18','PRAWN SOUP','',250000,'FOOD','SEA FOOD'),('19','GRILLED SQUID','',260000,'FOOD','SEA FOOD'),('2','CHICKEN TERIYAKI','',60000,'FOOD','CHICKEN'),('20','SPICY PRAWN CRISP','',100000,'SNACK','SNACK'),('21','SALTED OYSTER CRISP','',110000,'SNACK','SNACK'),('22','CRABS CHIPS','',120000,'SNACK','SNACK'),('23','SQUID TAKOYAKI','',130000,'SNACK','SNACK'),('24','PRAWN DIM SUM','',150000,'SNACK','SNACK'),('3','FRIED CHICKEN TALIWANG','',70000,'FOOD','CHICKEN'),('4','SPICY STEAK MANADO','',120000,'FOOD','CHICKEN'),('5','BEEF STEAK MEDIUM','',65000,'FOOD','BEEF'),('6','BLACK PEPPER BEEF','',75000,'FOOD','BEEF'),('7','GRILLED BEEF','',80000,'FOOD','BEEF'),('8','OXTAIL SOUP','',100000,'FOOD','BEEF'),('9','ICE TEA','esteh,es teh,s teh,teh es es',15000,'DRINK','TEA');
/*!40000 ALTER TABLE `table_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomor_wa` varchar(20) DEFAULT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `tanggal_daftar` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_wa` (`nomor_wa`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'6289651253545@c.us','RONALDO','2025-06-04 13:59:36'),(2,'6287713614538@c.us','HUSEIN','2025-06-04 14:40:24'),(3,'6285201127759@c.us','FATIMAH','2025-06-05 22:04:10'),(4,'6285643130806@c.us','REMBO','2025-06-07 13:04:38');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-07 14:35:42
