# Notification Service Architecture

## Overview

This is a production-ready, multi-channel notification microservice built with enterprise-grade architecture principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Admin UI (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Providers │  │Templates │  │  Outbox  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────┴────────────────────────────────────┐
│                    NestJS API Gateway                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth Module (JWT)                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Notifications Module                                 │  │
│  │  ├─ Email Service                                     │  │
│  │  ├─ SMS Service                                       │  │
│  │  └─ Template Engine                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Provider Factory (Strategy Pattern)                  │  │
│  │  ├─ SendGrid Provider                                 │  │
│  │  ├─ Twilio Provider                                   │  │
│  │  ├─ Mock Email Provider                               │  │
│  │  └─ Mock SMS Provider                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Tenants    │  │    Users     │  │  Providers   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Templates   │  │   Headers    │  │   Footers    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │Notifications │  │Delivery Logs │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Strategy Pattern (Provider Abstraction)
Each notification channel (Email, SMS) has multiple provider implementations that conform to a common interface.

```typescript
interface EmailProvider {
  send(config: any, payload: EmailPayload): Promise<EmailProviderResponse>;
}

// Implementations
- SendGridProvider implements EmailProvider
- MockEmailProvider implements EmailProvider
```

### 2. Factory Pattern (Provider Selection)
The `ProviderFactory` selects the appropriate provider based on configuration and environment.

```typescript
class ProviderFactory {
  getEmailProvider(type: ProviderType): EmailProvider {
    // Returns appropriate provider based on type and environment
  }
}
```

### 3. Template Method Pattern (Notification Flow)
Common notification flow with customizable steps:
1. Validate idempotency
2. Render template or raw content
3. Get active provider
4. Send via provider (if production)
5. Log delivery

### 4. Repository Pattern (Data Access)
TypeORM repositories abstract database operations.

## Key Features

### Multi-Tenancy
- Tenant isolation at database level
- Tenant-specific configurations
- Shared infrastructure

### Environment-Aware Behavior
- **Development/Staging**: Messages stored as PREVIEW, not sent externally
- **Production**: Messages sent via real providers

### Idempotency
- Prevents duplicate sends using idempotency keys
- Database constraint ensures uniqueness

### Template Engine
- Supports `{{placeholder}}` syntax
- Nested placeholders: `{{user.firstName}}`
- Configurable missing placeholder handling (KEEP, BLANK, THROW)
- Header/Footer composition for emails

### Security
- JWT authentication
- Encrypted credentials (AES-256-CBC)
- CORS protection
- Rate limiting
- Input validation

### Extensibility
Adding a new provider (e.g., OneSignal for Push):

1. Create provider implementation:
```typescript
class OneSignalProvider implements PushProvider {
  async send(config, payload) { /* ... */ }
}
```

2. Register in ProviderFactory:
```typescript
case ProviderType.ONESIGNAL:
  return this.oneSignalProvider;
```

3. Add to enums and configure via Admin UI

## Database Schema

### Core Tables
- **tenants**: Multi-tenant support
- **users**: Admin authentication
- **provider_configs**: Provider credentials per channel
- **notification_templates**: Reusable templates
- **template_headers/footers**: Email composition
- **notification_requests**: All notification attempts
- **delivery_logs**: Provider responses and retries

### Indexes
- Idempotency key (unique)
- Channel + Status (composite)
- Created date (for time-based queries)
- Tenant ID (for isolation)

## API Design

### Public APIs (for services)
- `POST /v1/notifications/email`
- `POST /v1/notifications/sms`

### Admin APIs (authenticated)
- Provider configs CRUD
- Template management
- Header/Footer management
- Outbox/Preview viewing

### Authentication
- JWT Bearer tokens
- Token includes: userId, email, tenantId, isAdmin

## Scalability Considerations

### Current Architecture
- Single instance deployment
- Synchronous notification sending

### Future Enhancements
1. **Queue-based Processing**
   - Add Redis/RabbitMQ for async processing
   - Worker processes for sending
   - Retry logic with exponential backoff

2. **Caching**
   - Cache active provider configs
   - Cache frequently used templates
   - Redis for distributed caching

3. **Horizontal Scaling**
   - Stateless API design allows multiple instances
   - Load balancer in front of API
   - Shared database and cache

4. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alert on failure rates

## Testing Strategy

### Unit Tests
- Template engine placeholder replacement
- Provider selection logic
- Validation logic

### Integration Tests
- End-to-end notification flow
- Mock provider responses
- Database operations

### E2E Tests
- Admin UI workflows
- API endpoints with authentication

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Production Deployment
1. Build images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Run migrations:
```bash
docker-compose exec api npm run migration:run
```

3. Start services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
- `APP_ENV`: Controls preview vs real sending
- `DB_*`: Database connection
- `JWT_SECRET`: Authentication secret
- `ENCRYPTION_KEY`: Credential encryption
- Provider API keys

## Monitoring & Logging

### Logging
- Winston logger with daily rotation
- Structured JSON logs
- Log levels: error, warn, info, debug
- Context-aware logging

### Metrics (Future)
- Notification send rate
- Success/failure rates per channel
- Provider response times
- Queue depth (when implemented)

## Security Best Practices

1. **Credentials**: Encrypted at rest using AES-256
2. **Authentication**: JWT with expiration
3. **Authorization**: Tenant isolation
4. **Input Validation**: class-validator on all DTOs
5. **Rate Limiting**: Throttler guard on public APIs
6. **CORS**: Configured for admin UI origin
7. **SQL Injection**: Prevented by TypeORM parameterization

## Performance Optimization

1. **Database Indexes**: On frequently queried columns
2. **Connection Pooling**: MySQL connection pool
3. **Lazy Loading**: Relations loaded on demand
4. **Pagination**: Limit results in list endpoints
5. **Compression**: Gzip for API responses (future)

## Maintenance

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Backup Strategy
1. Daily MySQL dumps
2. Retain for 30 days
3. Test restore procedure monthly

### Updates
1. Update dependencies regularly
2. Test in staging first
3. Zero-downtime deployment with rolling updates
