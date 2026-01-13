import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_tenants_name (name),
        INDEX idx_tenants_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        isAdmin BOOLEAN DEFAULT FALSE,
        tenantId INT NULL,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_users_email (email),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create provider_configs table
    await queryRunner.query(`
      CREATE TABLE provider_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NULL,
        channel ENUM('EMAIL', 'SMS', 'VOICE', 'PUSH') NOT NULL,
        providerType ENUM('SENDGRID', 'TWILIO', 'MOCK', 'ONESIGNAL') NOT NULL,
        credentials TEXT NOT NULL,
        metadata JSON NULL,
        isActive BOOLEAN DEFAULT TRUE,
        environmentScope VARCHAR(50) DEFAULT 'development',
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_provider_configs_channel (channel),
        UNIQUE KEY unique_tenant_channel_provider (tenantId, channel, providerType),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create template_headers table
    await queryRunner.query(`
      CREATE TABLE template_headers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NULL,
        name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create template_footers table
    await queryRunner.query(`
      CREATE TABLE template_footers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NULL,
        name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create notification_templates table
    await queryRunner.query(`
      CREATE TABLE notification_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NULL,
        channel ENUM('EMAIL', 'SMS', 'VOICE', 'PUSH') NOT NULL,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NULL,
        bodyHtml TEXT NULL,
        bodyText TEXT NULL,
        headerId INT NULL,
        footerId INT NULL,
        placeholders JSON NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_notification_templates_channel (channel),
        INDEX idx_notification_templates_name (name),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (headerId) REFERENCES template_headers(id) ON DELETE SET NULL,
        FOREIGN KEY (footerId) REFERENCES template_footers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create notification_requests table
    await queryRunner.query(`
      CREATE TABLE notification_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idempotencyKey VARCHAR(255) NOT NULL UNIQUE,
        tenantId INT NULL,
        channel ENUM('EMAIL', 'SMS', 'VOICE', 'PUSH') NOT NULL,
        providerType ENUM('SENDGRID', 'TWILIO', 'MOCK', 'ONESIGNAL') NOT NULL,
        recipients JSON NOT NULL,
        payload JSON NULL,
        renderedContent TEXT NULL,
        status ENUM('PREVIEW', 'QUEUED', 'SENT', 'FAILED') DEFAULT 'QUEUED',
        errorMessage TEXT NULL,
        providerResponse JSON NULL,
        templateId INT NULL,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_notification_requests_idempotency (idempotencyKey),
        INDEX idx_notification_requests_channel (channel),
        INDEX idx_notification_requests_status (status),
        INDEX idx_notification_requests_created (createdAt),
        FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create delivery_logs table
    await queryRunner.query(`
      CREATE TABLE delivery_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notificationRequestId INT NOT NULL,
        attemptNumber INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        providerMessageId TEXT NULL,
        providerResponse JSON NULL,
        errorMessage TEXT NULL,
        createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        INDEX idx_delivery_logs_notification (notificationRequestId),
        FOREIGN KEY (notificationRequestId) REFERENCES notification_requests(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS delivery_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_requests`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_templates`);
    await queryRunner.query(`DROP TABLE IF EXISTS template_footers`);
    await queryRunner.query(`DROP TABLE IF EXISTS template_headers`);
    await queryRunner.query(`DROP TABLE IF EXISTS provider_configs`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS tenants`);
  }
}
