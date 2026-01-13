# API Examples

Complete examples for using the Notification Service API.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` require JWT authentication.

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@notification.local",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@notification.local",
    "firstName": "Admin",
    "lastName": "User",
    "isAdmin": true,
    "tenantId": 1
  }
}
```

**Save the token for subsequent requests:**
```bash
export TOKEN="your-access-token-here"
```

## Sending Notifications

### Send Email with Template

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "welcome-email-user-123",
    "templateId": 1,
    "to": ["user@example.com"],
    "placeholders": {
      "firstName": "John",
      "lastName": "Doe",
      "companyName": "Acme Corporation",
      "loginUrl": "https://app.example.com/login"
    }
  }'
```

**Response:**
```json
{
  "requestId": 42,
  "status": "PREVIEW",
  "previewUrl": "/admin/outbox/42",
  "createdAt": "2024-01-12T10:30:00.000Z"
}
```

### Send Email with Raw Content

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "custom-email-456",
    "to": ["customer@example.com"],
    "cc": ["manager@example.com"],
    "subject": "Order Confirmation - {{orderId}}",
    "body": "<h1>Thank you {{customerName}}!</h1><p>Your order {{orderId}} has been confirmed.</p>",
    "placeholders": {
      "customerName": "Jane Smith",
      "orderId": "ORD-12345"
    },
    "replyTo": "support@example.com"
  }'
```

### Send Email with Attachments

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "invoice-email-789",
    "to": ["customer@example.com"],
    "subject": "Your Invoice",
    "body": "<p>Please find your invoice attached.</p>",
    "attachments": [
      {
        "filename": "invoice.pdf",
        "content": "base64-encoded-content-here",
        "type": "application/pdf"
      }
    ]
  }'
```

### Send SMS with Template

```bash
curl -X POST http://localhost:3000/api/v1/notifications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "otp-sms-user-123",
    "templateId": 2,
    "to": "+1234567890",
    "placeholders": {
      "serviceName": "MyApp",
      "otp": "847392",
      "validityMinutes": "10"
    }
  }'
```

### Send SMS with Raw Message

```bash
curl -X POST http://localhost:3000/api/v1/notifications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "alert-sms-456",
    "to": "+1234567890",
    "message": "Alert: Your account balance is {{balance}}. Please top up.",
    "placeholders": {
      "balance": "$5.00"
    }
  }'
```

## Provider Configuration

### List All Providers

```bash
curl -X GET http://localhost:3000/api/admin/provider-configs \
  -H "Authorization: Bearer $TOKEN"
```

### Get Provider by ID

```bash
curl -X GET http://localhost:3000/api/admin/provider-configs/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Email Provider (SendGrid)

```bash
curl -X POST http://localhost:3000/api/admin/provider-configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "EMAIL",
    "providerType": "SENDGRID",
    "credentials": {
      "apiKey": "SG.your-sendgrid-api-key"
    },
    "metadata": {
      "fromEmail": "noreply@yourdomain.com",
      "fromName": "Your Service Name",
      "replyTo": "support@yourdomain.com"
    },
    "isActive": true,
    "environmentScope": "production"
  }'
```

### Create SMS Provider (Twilio)

```bash
curl -X POST http://localhost:3000/api/admin/provider-configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "SMS",
    "providerType": "TWILIO",
    "credentials": {
      "accountSid": "ACxxxxxxxxxxxxxxxxxxxxx",
      "authToken": "your-twilio-auth-token"
    },
    "metadata": {
      "fromNumber": "+1234567890"
    },
    "isActive": true,
    "environmentScope": "production"
  }'
```

### Update Provider

```bash
curl -X PATCH http://localhost:3000/api/admin/provider-configs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "isActive": false
  }'
```

### Delete Provider

```bash
curl -X DELETE http://localhost:3000/api/admin/provider-configs/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Template Management

### List All Templates

```bash
curl -X GET http://localhost:3000/api/admin/templates \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Templates by Channel

```bash
curl -X GET "http://localhost:3000/api/admin/templates?channel=EMAIL" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Template by ID

```bash
curl -X GET http://localhost:3000/api/admin/templates/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Email Template

```bash
curl -X POST http://localhost:3000/api/admin/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "EMAIL",
    "name": "Password Reset",
    "subject": "Reset your password for {{appName}}",
    "bodyHtml": "<h2>Hello {{firstName}}!</h2><p>Click the link below to reset your password:</p><a href=\"{{resetUrl}}\">Reset Password</a><p>This link expires in {{expiryHours}} hours.</p>",
    "headerId": 1,
    "footerId": 1,
    "placeholders": ["firstName", "appName", "resetUrl", "expiryHours"],
    "isActive": true
  }'
```

### Create SMS Template

```bash
curl -X POST http://localhost:3000/api/admin/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "SMS",
    "name": "Delivery Notification",
    "bodyText": "Hi {{customerName}}, your order {{orderId}} is out for delivery. Track: {{trackingUrl}}",
    "placeholders": ["customerName", "orderId", "trackingUrl"],
    "isActive": true
  }'
```

### Update Template

```bash
curl -X PATCH http://localhost:3000/api/admin/templates/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "subject": "Updated subject line",
    "isActive": true
  }'
```

### Delete Template

```bash
curl -X DELETE http://localhost:3000/api/admin/templates/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Headers & Footers

### Create Header

```bash
curl -X POST http://localhost:3000/api/admin/headers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Corporate Header",
    "content": "<div style=\"background:#4F46E5;padding:20px;text-align:center;\"><img src=\"https://example.com/logo.png\" alt=\"Logo\" /><h1 style=\"color:white;\">{{companyName}}</h1></div>",
    "isActive": true
  }'
```

### Create Footer

```bash
curl -X POST http://localhost:3000/api/admin/footers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Standard Footer",
    "content": "<div style=\"background:#f3f4f6;padding:20px;text-align:center;\"><p style=\"color:#6b7280;font-size:12px;\">© 2024 {{companyName}}. All rights reserved.</p><p style=\"color:#6b7280;font-size:12px;\">{{address}}</p></div>",
    "isActive": true
  }'
```

### List Headers

```bash
curl -X GET http://localhost:3000/api/admin/headers \
  -H "Authorization: Bearer $TOKEN"
```

### List Footers

```bash
curl -X GET http://localhost:3000/api/admin/footers \
  -H "Authorization: Bearer $TOKEN"
```

## Outbox / Preview

### List All Notifications

```bash
curl -X GET http://localhost:3000/api/admin/outbox \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Channel

```bash
curl -X GET "http://localhost:3000/api/admin/outbox?channel=EMAIL" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Status

```bash
curl -X GET "http://localhost:3000/api/admin/outbox?status=PREVIEW" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Date Range

```bash
curl -X GET "http://localhost:3000/api/admin/outbox?dateFrom=2024-01-01&dateTo=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Combined Filters

```bash
curl -X GET "http://localhost:3000/api/admin/outbox?channel=EMAIL&status=SENT&dateFrom=2024-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Notification Details

```bash
curl -X GET http://localhost:3000/api/admin/outbox/42 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "id": 42,
  "idempotencyKey": "welcome-email-user-123",
  "channel": "EMAIL",
  "providerType": "MOCK",
  "recipients": {
    "to": ["user@example.com"],
    "cc": [],
    "bcc": []
  },
  "payload": {
    "templateId": 1,
    "placeholders": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "renderedContent": "<html>...</html>",
  "status": "PREVIEW",
  "templateId": 1,
  "createdAt": "2024-01-12T10:30:00.000Z",
  "updatedAt": "2024-01-12T10:30:00.000Z"
}
```

## Advanced Examples

### Bulk Email Sending

```bash
# Send to multiple recipients
for email in user1@example.com user2@example.com user3@example.com; do
  curl -X POST http://localhost:3000/api/v1/notifications/email \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"idempotencyKey\": \"bulk-$(date +%s)-$email\",
      \"templateId\": 1,
      \"to\": [\"$email\"],
      \"placeholders\": {
        \"firstName\": \"User\"
      }
    }"
  sleep 0.5
done
```

### Transactional Email (Order Confirmation)

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "order-confirmation-ORD-12345",
    "to": ["customer@example.com"],
    "subject": "Order Confirmation - {{orderId}}",
    "body": "<h1>Thank you for your order!</h1><p>Order ID: {{orderId}}</p><p>Total: {{total}}</p><h2>Items:</h2><ul>{{#items}}<li>{{name}} - {{price}}</li>{{/items}}</ul>",
    "placeholders": {
      "orderId": "ORD-12345",
      "total": "$99.99",
      "items": [
        {"name": "Product 1", "price": "$49.99"},
        {"name": "Product 2", "price": "$50.00"}
      ]
    }
  }'
```

### Two-Factor Authentication SMS

```bash
curl -X POST http://localhost:3000/api/v1/notifications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "2fa-user-123-'$(date +%s)'",
    "to": "+1234567890",
    "message": "Your {{appName}} verification code is {{code}}. Valid for {{minutes}} minutes. Do not share this code.",
    "placeholders": {
      "appName": "MyApp",
      "code": "847392",
      "minutes": "5"
    }
  }'
```

### Marketing Email with Unsubscribe

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "newsletter-2024-01-user-123",
    "to": ["subscriber@example.com"],
    "subject": "{{monthName}} Newsletter - {{companyName}}",
    "body": "<h1>{{monthName}} Updates</h1><p>Dear {{firstName}},</p><p>Here are this month'\''s highlights...</p><hr><p><small><a href=\"{{unsubscribeUrl}}\">Unsubscribe</a></small></p>",
    "placeholders": {
      "firstName": "John",
      "monthName": "January",
      "companyName": "Acme Corp",
      "unsubscribeUrl": "https://example.com/unsubscribe?token=xyz"
    }
  }'
```

## Error Handling

### Invalid Credentials (401)

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{...}'
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Duplicate Idempotency Key (409)

```bash
# Send same request twice
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idempotencyKey": "duplicate-key",
    "to": ["user@example.com"],
    "subject": "Test",
    "body": "Test"
  }'
```

**Response:**
```json
{
  "statusCode": 409,
  "message": "Notification with this idempotency key already exists"
}
```

### Validation Error (400)

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": ["invalid-email"],
    "subject": "Test"
  }'
```

**Response:**
```json
{
  "statusCode": 400,
  "message": [
    "idempotencyKey should not be empty",
    "each value in to must be an email"
  ],
  "error": "Bad Request"
}
```

## Rate Limiting

The API has rate limiting enabled. Default: 100 requests per 60 seconds.

**Response when rate limit exceeded:**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication support
- Example values

## Tips

1. **Always use unique idempotency keys** to prevent duplicate sends
2. **Test in development first** - messages will be previewed, not sent
3. **Use templates** for consistent messaging
4. **Monitor the outbox** for failed notifications
5. **Set appropriate rate limits** for your use case
6. **Use meaningful idempotency keys** like `order-confirmation-{orderId}`
7. **Include all required placeholders** when using templates
8. **Handle errors gracefully** in your application

## Next Steps

- Import the Postman collection for easier testing
- Explore the Swagger documentation
- Create custom templates for your use cases
- Configure production providers
- Integrate with your application
