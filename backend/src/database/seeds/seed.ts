import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/typeorm.config';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('🌱 Starting database seeding...');

  try {
    // Create default tenant
    const tenantResult = await dataSource.query(
      `INSERT INTO tenants (name, slug, description, isActive) 
       VALUES ('Default Tenant', 'default', 'Default tenant for notification service', true)
       ON DUPLICATE KEY UPDATE id=id`,
    );
    const tenantId = tenantResult.insertId || 1;
    console.log('✅ Default tenant created');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await dataSource.query(
      `INSERT INTO users (email, password, firstName, lastName, isActive, isAdmin, tenantId) 
       VALUES ('admin@notification.local', ?, 'Admin', 'User', true, true, ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password)`,
      [hashedPassword, tenantId],
    );
    console.log('✅ Admin user created (email: admin@notification.local, password: Admin@123)');

    // Create mock provider configs for development
    const encryptionKey = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-bytes!!';
    const crypto = require('crypto');

    const encryptCredentials = (obj: any): string => {
      const iv = crypto.randomBytes(16);
      // Ensure key is exactly 32 bytes for AES-256
      const key = crypto.createHash('sha256').update(encryptionKey).digest();
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    };

    // Email provider config (Mock for development)
    const emailCredentials = encryptCredentials({ apiKey: 'mock-sendgrid-key' });
    await dataSource.query(
      `INSERT INTO provider_configs (tenantId, channel, providerType, credentials, metadata, isActive, environmentScope)
       VALUES (?, 'EMAIL', 'MOCK', ?, ?, true, 'development')
       ON DUPLICATE KEY UPDATE credentials=VALUES(credentials)`,
      [
        tenantId,
        emailCredentials,
        JSON.stringify({
          fromEmail: 'noreply@notification.local',
          fromName: 'Notification Service',
          replyTo: 'support@notification.local',
        }),
      ],
    );
    console.log('✅ Mock email provider config created');

    // SMS provider config (Mock for development)
    const smsCredentials = encryptCredentials({
      accountSid: 'mock-twilio-sid',
      authToken: 'mock-twilio-token',
    });
    await dataSource.query(
      `INSERT INTO provider_configs (tenantId, channel, providerType, credentials, metadata, isActive, environmentScope)
       VALUES (?, 'SMS', 'MOCK', ?, ?, true, 'development')
       ON DUPLICATE KEY UPDATE credentials=VALUES(credentials)`,
      [tenantId, smsCredentials, JSON.stringify({ fromNumber: '+1234567890' })],
    );
    console.log('✅ Mock SMS provider config created');

    // Create sample email header
    await dataSource.query(
      `INSERT INTO template_headers (tenantId, name, content, isActive)
       VALUES (?, 'Default Email Header', ?, true)
       ON DUPLICATE KEY UPDATE content=VALUES(content)`,
      [
        tenantId,
        `<div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Notification Service</h1>
        </div>`,
      ],
    );
    console.log('✅ Sample email header created');

    // Create sample email footer
    await dataSource.query(
      `INSERT INTO template_footers (tenantId, name, content, isActive)
       VALUES (?, 'Default Email Footer', ?, true)
       ON DUPLICATE KEY UPDATE content=VALUES(content)`,
      [
        tenantId,
        `<div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            © 2024 Notification Service. All rights reserved.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin: 5px 0 0 0;">
            You received this email because you are a user of our service.
          </p>
        </div>`,
      ],
    );
    console.log('✅ Sample email footer created');

    // Create sample email template
    await dataSource.query(
      `INSERT INTO notification_templates (tenantId, channel, name, subject, bodyHtml, headerId, footerId, placeholders, isActive)
       VALUES (?, 'EMAIL', 'Welcome Email', 'Welcome to {{companyName}}, {{firstName}}!', ?, 1, 1, ?, true)
       ON DUPLICATE KEY UPDATE bodyHtml=VALUES(bodyHtml)`,
      [
        tenantId,
        `<div style="padding: 30px; font-family: Arial, sans-serif;">
          <h2 style="color: #1F2937;">Hello {{firstName}} {{lastName}}!</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Welcome to <strong>{{companyName}}</strong>! We're excited to have you on board.
          </p>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Your account has been successfully created. You can now access all our features.
          </p>
          <div style="margin: 30px 0;">
            <a href="{{loginUrl}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>`,
        JSON.stringify(['firstName', 'lastName', 'companyName', 'loginUrl']),
      ],
    );
    console.log('✅ Sample welcome email template created');

    // Create sample SMS template
    await dataSource.query(
      `INSERT INTO notification_templates (tenantId, channel, name, bodyText, placeholders, isActive)
       VALUES (?, 'SMS', 'OTP Verification', 'Your OTP for {{serviceName}} is {{otp}}. Valid for {{validityMinutes}} minutes.', ?, true)
       ON DUPLICATE KEY UPDATE bodyText=VALUES(bodyText)`,
      [tenantId, JSON.stringify(['serviceName', 'otp', 'validityMinutes'])],
    );
    console.log('✅ Sample OTP SMS template created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@notification.local');
    console.log('   Password: Admin@123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
