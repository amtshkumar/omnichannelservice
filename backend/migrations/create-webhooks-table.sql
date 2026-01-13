-- Create webhooks table
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenantId` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `events` text NOT NULL COMMENT 'Comma-separated list of webhook events',
  `headers` json DEFAULT NULL,
  `secret` varchar(255) DEFAULT NULL COMMENT 'Secret for HMAC signature verification',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `failureCount` int NOT NULL DEFAULT '0',
  `lastTriggeredAt` datetime DEFAULT NULL,
  `lastFailedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_webhooks_tenantId` (`tenantId`),
  KEY `IDX_webhooks_isActive` (`isActive`),
  CONSTRAINT `FK_webhooks_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
