# Notification Service

A fully independent, production-ready notification microservice built with NestJS, TypeScript, MySQL, and Docker. Supports Email, SMS, Voice Call, and Push Notifications with a comprehensive Admin UI.

## 🚀 Features

- **Multi-Channel Support**: Email, SMS, Voice Call (stub), Push Notifications (OneSignal - future)
- **Provider Abstraction**: Easy to add new providers (SendGrid, Twilio, Mock for testing)
- **Template Engine**: Support for placeholders (`{{key}}`, `{{nested.key}}`), headers, and footers
- **Admin UI**: Configure providers, manage templates, preview messages in non-production
- **Environment-Aware**: Auto-preview mode in dev/staging, real sending in production
- **Multi-Tenant Ready**: Architecture supports multiple tenants/projects
- **Idempotency**: Prevent duplicate sends with idempotency keys
- **Comprehensive API**: RESTful APIs with Swagger documentation

## 📋 Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, MySQL
- **Frontend**: React, Vite, Chakra UI
- **Infrastructure**: Docker, Docker Compose
- **Security**: JWT authentication, encrypted credentials
- **Quality**: ESLint, Prettier, Jest, class-validator

## 🏗️ Architecture

```
notification-service/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # JWT authentication
│   │   ├── providers/   # Provider abstraction & implementations
│   │   ├── templates/   # Template management
│   │   ├── notifications/ # Core notification logic
│   │   ├── outbox/      # Preview & delivery logs
│   │   └── common/      # Shared utilities
│   └── test/
├── admin-ui/            # React Admin Panel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
└── docker-compose.yml
```

## 🛠️ Setup Instructions

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0+ (if running without Docker)

### Quick Start with Docker

1. **Clone and navigate to the project**
   ```bash
   cd notification
   ```

2. **Copy environment files**
   ```bash
   cp .env.example .env.development
   ```

3. **Configure environment variables**
   Edit `.env.development` with your settings:
   ```env
   APP_ENV=development
   DB_HOST=mysql
   DB_PORT=3306
   DB_USERNAME=notification_user
   DB_PASSWORD=notification_pass
   DB_DATABASE=notification_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # SendGrid (optional for dev)
   SENDGRID_API_KEY=
   
   # Twilio (optional for dev)
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   ```

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec api npm run migration:run
   ```

6. **Seed initial data**
   ```bash
   docker-compose exec api npm run seed
   ```

7. **Access the services**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/docs
   - Admin UI: http://localhost:5173
   - MySQL: localhost:3306

### Default Admin Credentials

```
Email: admin@notification.local
Password: Admin@123
```

## 📡 API Usage

### Authentication

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@notification.local",
    "password": "Admin@123"
  }'
```

### Send Email (with template)

```bash
curl -X POST http://localhost:3000/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idempotencyKey": "unique-key-123",
    "templateId": 1,
    "to": ["user@example.com"],
    "placeholders": {
      "firstName": "John",
      "orderId": "ORD-12345"
    }
  }'
```

### Send Email (raw)

```bash
curl -X POST http://localhost:3000/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idempotencyKey": "unique-key-456",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "body": "<h1>Hello {{firstName}}</h1>",
    "placeholders": {
      "firstName": "Jane"
    }
  }'
```

### Send SMS

```bash
curl -X POST http://localhost:3000/v1/notifications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idempotencyKey": "sms-key-789",
    "to": "+1234567890",
    "message": "Your OTP is {{otp}}",
    "placeholders": {
      "otp": "123456"
    }
  }'
```

## 🔧 Configuration

### Adding a New Provider (e.g., OneSignal for Push)

1. **Create provider implementation**
   ```typescript
   // backend/src/providers/implementations/onesignal.provider.ts
   import { Injectable } from '@nestjs/common';
   import { PushProvider } from '../interfaces/push-provider.interface';
   
   @Injectable()
   export class OneSignalProvider implements PushProvider {
     async send(config: any, payload: any): Promise<any> {
       // Implementation
     }
   }
   ```

2. **Register in ProviderFactory**
   ```typescript
   // backend/src/providers/provider.factory.ts
   case ProviderType.ONESIGNAL:
     return this.oneSignalProvider;
   ```

3. **Add to enums**
   ```typescript
   export enum ProviderType {
     ONESIGNAL = 'ONESIGNAL',
     // ...
   }
   ```

4. **Configure via Admin UI**
   - Navigate to Provider Config
   - Add OneSignal credentials
   - Activate for PUSH channel

## 🧪 Testing

### Run all tests
```bash
cd backend
npm run test
```

### Run integration tests
```bash
npm run test:e2e
```

### Run with coverage
```bash
npm run test:cov
```

## 🌍 Environment Modes

### Development/Staging
- Messages are NOT sent to external providers
- All notifications stored in `notification_requests` with status `PREVIEW`
- View in Admin UI → Outbox

### Production
- Messages sent via configured providers (SendGrid, Twilio)
- Delivery logs tracked
- Errors logged and retryable

## 📊 Database Schema

### Key Tables

- **tenants**: Multi-tenant support
- **users**: Admin authentication
- **provider_configs**: Provider credentials per channel
- **template_headers**: Reusable email headers
- **template_footers**: Reusable email footers
- **notification_templates**: Message templates with placeholders
- **notification_requests**: All notification attempts with rendered content
- **delivery_logs**: Provider responses and retry tracking

## 🔐 Security

- JWT-based authentication
- Credentials encrypted at rest (AES-256)
- CORS configured for admin UI
- Rate limiting on public APIs
- Input validation with class-validator
- SQL injection prevention via TypeORM

## 📈 Monitoring & Logging

- Structured logging with Winston
- Request/response logging
- Error tracking with stack traces
- Performance metrics ready

## 🚢 Deployment

### Production Checklist

1. Update `.env.production`:
   - Set `APP_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure real provider credentials
   - Set secure database credentials

2. Build images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. Run migrations:
   ```bash
   docker-compose exec api npm run migration:run
   ```

4. Start services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🤝 Contributing

1. Follow existing code structure
2. Write tests for new features
3. Run linter: `npm run lint`
4. Format code: `npm run format`

## 📝 License

MIT

## 📧 Support

For issues and questions, please open a GitHub issue.
