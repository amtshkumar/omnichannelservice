# Quick Start Guide

Get the Notification Service up and running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Ports 3000, 3306, and 5173 available

## Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

This will:
- Start all Docker containers
- Install dependencies
- Run database migrations
- Seed initial data
- Start all services

## Option 2: Manual Setup

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

### Step 2: Wait for MySQL

```bash
# Wait about 15 seconds for MySQL to initialize
sleep 15
```

### Step 3: Install Dependencies

```bash
# Backend
docker-compose exec api npm install

# Frontend
docker-compose exec admin-ui npm install
```

### Step 4: Database Setup

```bash
# Run migrations
docker-compose exec api npm run migration:run

# Seed data
docker-compose exec api npm run seed
```

## Access the Services

Once setup is complete:

| Service | URL | Description |
|---------|-----|-------------|
| **Admin UI** | http://localhost:5173 | Web interface for management |
| **API** | http://localhost:3000 | REST API endpoint |
| **Swagger Docs** | http://localhost:3000/docs | Interactive API documentation |
| **MySQL** | localhost:3306 | Database (use any MySQL client) |

## Default Credentials

```
Email:    admin@notification.local
Password: Admin@123
```

## Quick Test

### 1. Login to Admin UI

1. Open http://localhost:5173
2. Login with default credentials
3. Explore the dashboard

### 2. Send Your First Email

Using curl:

```bash
# First, get auth token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@notification.local","password":"Admin@123"}' \
  | jq -r '.accessToken')

# Send email using template
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "test-email-1",
    "templateId": 1,
    "to": ["user@example.com"],
    "placeholders": {
      "firstName": "John",
      "lastName": "Doe",
      "companyName": "Acme Corp",
      "loginUrl": "https://example.com/login"
    }
  }'
```

### 3. View in Outbox

Since you're in development mode, the email won't be sent externally. Instead:

1. Go to Admin UI → Outbox
2. You'll see your email with status "PREVIEW"
3. Click "View" to see the rendered content

### 4. Send SMS

```bash
curl -X POST http://localhost:3000/api/v1/notifications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "test-sms-1",
    "templateId": 2,
    "to": "+1234567890",
    "placeholders": {
      "serviceName": "MyApp",
      "otp": "123456",
      "validityMinutes": "10"
    }
  }'
```

## Next Steps

### Configure Real Providers (for Production)

#### SendGrid (Email)

1. Get API key from SendGrid
2. Go to Admin UI → Providers
3. Edit the Email provider
4. Update credentials:
```json
{
  "apiKey": "SG.your-actual-api-key"
}
```
5. Update metadata:
```json
{
  "fromEmail": "noreply@yourdomain.com",
  "fromName": "Your Service Name",
  "replyTo": "support@yourdomain.com"
}
```
6. Set environment scope to "production"

#### Twilio (SMS)

1. Get credentials from Twilio
2. Go to Admin UI → Providers
3. Edit the SMS provider
4. Update credentials:
```json
{
  "accountSid": "ACxxxxxxxxxxxxx",
  "authToken": "your-auth-token"
}
```
5. Update metadata:
```json
{
  "fromNumber": "+1234567890"
}
```

### Create Custom Templates

1. Go to Admin UI → Templates
2. Click "Add Template"
3. Fill in details:
   - **Name**: Order Confirmation
   - **Channel**: Email
   - **Subject**: Your order #{{orderId}} is confirmed
   - **Body**: Use HTML with placeholders
   - **Placeholders**: List all placeholders used

### Switch to Production Mode

1. Update `.env.production`:
```bash
APP_ENV=production
JWT_SECRET=your-secure-random-secret
ENCRYPTION_KEY=your-32-character-encryption-key
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

2. Restart with production config:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f admin-ui
docker-compose logs -f mysql
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
sleep 15
docker-compose exec api npm run migration:run
docker-compose exec api npm run seed
```

### Run Tests

```bash
# Unit tests
docker-compose exec api npm test

# E2E tests
docker-compose exec api npm run test:e2e

# With coverage
docker-compose exec api npm run test:cov
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3306
lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

### MySQL Connection Issues

```bash
# Check if MySQL is running
docker-compose ps

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### API Not Starting

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. MySQL not ready - wait longer
# 2. Dependencies not installed - run npm install
# 3. Migration errors - check migration logs
```

### Admin UI Not Loading

```bash
# Check logs
docker-compose logs admin-ui

# Rebuild frontend
docker-compose exec admin-ui npm run build
```

## Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman-collection.json`
4. Collection includes all API endpoints
5. Login first to get auth token (automatically saved)

## Development Workflow

### Backend Development

```bash
# Watch mode (auto-reload)
docker-compose exec api npm run start:dev

# Run linter
docker-compose exec api npm run lint

# Format code
docker-compose exec api npm run format
```

### Frontend Development

```bash
# Already in watch mode by default
# Edit files in admin-ui/src and see changes live
```

### Database Changes

```bash
# Create new migration
docker-compose exec api npm run migration:create -- src/database/migrations/YourMigrationName

# Generate migration from entity changes
docker-compose exec api npm run migration:generate -- src/database/migrations/YourMigrationName

# Run migrations
docker-compose exec api npm run migration:run

# Revert last migration
docker-compose exec api npm run migration:revert
```

## Performance Tips

1. **Use Templates**: Pre-create templates instead of raw content
2. **Idempotency Keys**: Always use unique keys to prevent duplicates
3. **Batch Operations**: Group notifications when possible
4. **Monitor Outbox**: Regularly check for failed notifications

## Security Checklist for Production

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Update ENCRYPTION_KEY (32 characters)
- [ ] Configure real provider credentials
- [ ] Set APP_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review and update security headers

## Support

- **Documentation**: See README.md and ARCHITECTURE.md
- **API Docs**: http://localhost:3000/docs
- **Issues**: Check logs first, then create GitHub issue

## What's Next?

- Explore the Admin UI
- Create custom templates
- Integrate with your application
- Set up monitoring
- Configure production providers
- Add more notification channels

Happy notifying! 🔔
