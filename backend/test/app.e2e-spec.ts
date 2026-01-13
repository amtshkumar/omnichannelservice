import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Notification Service (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - success', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@notification.local',
          password: 'Admin@123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.accessToken;
        });
    });

    it('/auth/login (POST) - invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@notification.local',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Notifications', () => {
    it('/v1/notifications/email (POST) - send email with template', () => {
      return request(app.getHttpServer())
        .post('/api/v1/notifications/email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idempotencyKey: `test-email-${Date.now()}`,
          templateId: 1,
          to: ['test@example.com'],
          placeholders: {
            firstName: 'John',
            lastName: 'Doe',
            companyName: 'Test Corp',
            loginUrl: 'https://example.com',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('requestId');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/v1/notifications/sms (POST) - send SMS with template', () => {
      return request(app.getHttpServer())
        .post('/api/v1/notifications/sms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idempotencyKey: `test-sms-${Date.now()}`,
          templateId: 2,
          to: '+1234567890',
          placeholders: {
            serviceName: 'TestApp',
            otp: '123456',
            validityMinutes: '10',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('requestId');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/v1/notifications/email (POST) - duplicate idempotency key', async () => {
      const idempotencyKey = `duplicate-test-${Date.now()}`;

      // First request
      await request(app.getHttpServer())
        .post('/api/v1/notifications/email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idempotencyKey,
          templateId: 1,
          to: ['test@example.com'],
          placeholders: { firstName: 'John' },
        })
        .expect(201);

      // Duplicate request
      return request(app.getHttpServer())
        .post('/api/v1/notifications/email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idempotencyKey,
          templateId: 1,
          to: ['test@example.com'],
          placeholders: { firstName: 'John' },
        })
        .expect(409);
    });
  });

  describe('Admin - Provider Configs', () => {
    it('/admin/provider-configs (GET) - list all providers', () => {
      return request(app.getHttpServer())
        .get('/api/admin/provider-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Admin - Templates', () => {
    it('/admin/templates (GET) - list all templates', () => {
      return request(app.getHttpServer())
        .get('/api/admin/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Admin - Outbox', () => {
    it('/admin/outbox (GET) - list notifications', () => {
      return request(app.getHttpServer())
        .get('/api/admin/outbox')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
