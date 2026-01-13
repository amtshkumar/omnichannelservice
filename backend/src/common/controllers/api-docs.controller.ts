import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('api-docs')
@Controller('api-docs')
export class ApiDocsController {
  @Get('examples')
  @ApiOperation({ summary: 'Get API examples and documentation' })
  getApiExamples() {
    return {
      authentication: {
        title: '🔐 Authentication',
        description: 'Get JWT token for API access',
        endpoint: '/api/auth/login',
        method: 'POST',
        example: {
          request: {
            email: 'admin@notification.local',
            password: 'Admin@123',
          },
          response: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 1,
              email: 'admin@notification.local',
              tenantId: 1,
            },
          },
        },
        curl: `curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@notification.local",
    "password": "Admin@123"
  }'`,
        notes: 'Save the accessToken and use it as "Bearer YOUR_TOKEN" in all API requests',
      },

      sendEmail: {
        title: '📧 Send Email',
        description: 'Send an email notification immediately',
        endpoint: '/api/v1/notifications/email',
        method: 'POST',
        requiresAuth: true,
        example: {
          request: {
            idempotencyKey: 'unique-key-123',
            to: ['user@example.com'],
            subject: 'Welcome {{firstName}}!',
            body: '<h1>Hello {{firstName}}!</h1>',
            placeholders: { firstName: 'John' },
          },
          response: {
            requestId: 42,
            status: 'QUEUED',
            createdAt: '2026-01-13T12:00:00.000Z',
          },
        },
        curl: `curl -X POST http://localhost:3000/api/v1/notifications/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "idempotencyKey": "unique-key-123",
    "to": ["user@example.com"],
    "subject": "Welcome {{firstName}}!",
    "body": "<h1>Hello {{firstName}}!</h1>",
    "placeholders": {"firstName": "John"}
  }'`,
        attributes: {
          idempotencyKey: {
            type: 'string',
            required: true,
            description: 'Unique identifier to prevent duplicate sends',
          },
          to: {
            type: 'string[]',
            required: true,
            description: 'Array of recipient email addresses',
          },
          subject: {
            type: 'string',
            required: true,
            description: 'Email subject line, supports {{placeholders}}',
          },
          body: {
            type: 'string',
            required: true,
            description: 'Email body HTML content, supports {{placeholders}}',
          },
          cc: {
            type: 'string[]',
            required: false,
            description: 'Array of CC email addresses',
          },
          bcc: {
            type: 'string[]',
            required: false,
            description: 'Array of BCC email addresses',
          },
          replyTo: {
            type: 'string',
            required: false,
            description: 'Reply-to email address',
          },
          templateId: {
            type: 'number',
            required: false,
            description: 'Use existing template instead of body',
          },
          placeholders: {
            type: 'object',
            required: false,
            description: 'Object with key-value pairs for template variables',
          },
          attachments: {
            type: 'array',
            required: false,
            description: 'Array of file attachments (base64 encoded)',
          },
        },
      },

      scheduleEmail: {
        title: '⏰ Schedule Email',
        description: 'Schedule an email for future delivery',
        endpoint: '/api/v1/notifications/schedule/email',
        method: 'POST',
        requiresAuth: true,
        example: {
          request: {
            idempotencyKey: 'scheduled-email-123',
            to: ['user@example.com'],
            subject: 'Reminder: Meeting Tomorrow',
            body: '<h1>Hi {{name}}!</h1><p>Your meeting is tomorrow.</p>',
            placeholders: { name: 'John' },
            scheduleAt: '2026-01-14T10:00:00.000Z',
            timezone: 'America/New_York',
          },
          response: {
            requestId: 43,
            status: 'QUEUED',
            scheduledFor: '2026-01-14T10:00:00.000Z',
            createdAt: '2026-01-13T12:00:00.000Z',
          },
        },
        curl: `curl -X POST http://localhost:3000/api/v1/notifications/schedule/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "idempotencyKey": "scheduled-email-123",
    "to": ["user@example.com"],
    "subject": "Reminder: Meeting Tomorrow",
    "body": "<h1>Hi {{name}}!</h1><p>Your meeting is tomorrow.</p>",
    "placeholders": {"name": "John"},
    "scheduleAt": "2026-01-14T10:00:00.000Z",
    "timezone": "America/New_York"
  }'`,
        attributes: {
          scheduleAt: {
            type: 'string',
            required: true,
            description: 'ISO 8601 datetime when email should be sent (must be in future)',
          },
          timezone: {
            type: 'string',
            required: false,
            description: 'Timezone for scheduling (default: UTC)',
          },
        },
        notes: 'Jobs appear in Bull Board under "scheduled-notifications" queue',
      },

      sendSms: {
        title: '📱 Send SMS',
        description: 'Send an SMS notification',
        endpoint: '/api/v1/notifications/sms',
        method: 'POST',
        requiresAuth: true,
        example: {
          request: {
            idempotencyKey: 'sms-otp-456',
            to: '+1234567890',
            message: 'Your OTP is {{code}}. Valid for {{minutes}} min.',
            placeholders: { code: '123456', minutes: '5' },
          },
          response: {
            requestId: 44,
            status: 'QUEUED',
            createdAt: '2026-01-13T12:00:00.000Z',
          },
        },
        curl: `curl -X POST http://localhost:3000/api/v1/notifications/sms \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "idempotencyKey": "sms-otp-456",
    "to": "+1234567890",
    "message": "Your OTP is {{code}}. Valid for {{minutes}} min.",
    "placeholders": {"code": "123456", "minutes": "5"}
  }'`,
        attributes: {
          idempotencyKey: {
            type: 'string',
            required: true,
            description: 'Unique identifier',
          },
          to: {
            type: 'string',
            required: true,
            description: 'Phone number with country code (e.g., +1234567890)',
          },
          message: {
            type: 'string',
            required: true,
            description: 'SMS text content, supports {{placeholders}}',
          },
          templateId: {
            type: 'number',
            required: false,
            description: 'Use existing SMS template',
          },
          placeholders: {
            type: 'object',
            required: false,
            description: 'Variables for message',
          },
        },
      },

      bulkEmail: {
        title: '📬 Send Bulk Email',
        description: 'Send multiple emails at once',
        endpoint: '/api/v1/notifications/bulk/email',
        method: 'POST',
        requiresAuth: true,
        example: {
          request: {
            notifications: [
              {
                idempotencyKey: 'bulk-1',
                to: ['user1@example.com'],
                templateId: 1,
                placeholders: { name: 'John' },
              },
              {
                idempotencyKey: 'bulk-2',
                to: ['user2@example.com'],
                templateId: 1,
                placeholders: { name: 'Jane' },
              },
            ],
          },
          response: {
            total: 2,
            successful: 2,
            failed: 0,
            results: [],
            errors: [],
          },
        },
        curl: `curl -X POST http://localhost:3000/api/v1/notifications/bulk/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "notifications": [
      {
        "idempotencyKey": "bulk-1",
        "to": ["user1@example.com"],
        "templateId": 1,
        "placeholders": {"name": "John"}
      },
      {
        "idempotencyKey": "bulk-2",
        "to": ["user2@example.com"],
        "templateId": 1,
        "placeholders": {"name": "Jane"}
      }
    ]
  }'`,
        attributes: {
          notifications: {
            type: 'array',
            required: true,
            description: 'Array of email objects, each with same structure as single email',
          },
        },
        notes: 'Each email in the array is queued separately. Use unique idempotencyKey for each.',
      },

      responseFormats: {
        title: '✅ API Response Formats',
        success: {
          statusCode: 201,
          example: {
            requestId: 42,
            status: 'QUEUED',
            createdAt: '2026-01-13T12:00:00.000Z',
            scheduledFor: '2026-01-14T10:00:00.000Z',
          },
          attributes: {
            requestId: 'Database ID of the notification request',
            status: 'Current status: QUEUED, SENT, FAILED, PREVIEW',
            createdAt: 'Timestamp when request was created',
            scheduledFor: 'When scheduled email will be sent (scheduled only)',
            previewUrl: 'URL to preview email (development mode only)',
          },
        },
        error: {
          statusCode: 409,
          example: {
            statusCode: 409,
            message: 'Notification with this idempotency key already exists',
          },
        },
      },

      quickReference: {
        baseUrl: 'http://localhost:3000/api',
        swaggerDocs: 'http://localhost:3000/docs',
        bullBoard: 'http://localhost:3000/admin/queues',
        defaultCredentials: {
          email: 'admin@notification.local',
          password: 'Admin@123',
        },
        tips: [
          'Always use unique idempotencyKey to prevent duplicates',
          'Check Bull Board to see jobs processing in real-time',
          'Use templates for consistent messaging',
          'Monitor /admin/outbox for sent notifications',
          'Scheduled emails appear in "scheduled-notifications" queue',
        ],
      },
    };
  }

  @Get('timezones')
  @ApiOperation({ summary: 'Get list of supported timezones' })
  getTimezones() {
    return {
      timezones: [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
        { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
        { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
        { value: 'Europe/London', label: 'London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
        { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
        { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
        { value: 'Asia/Dubai', label: 'Dubai (GST)' },
        { value: 'Asia/Kolkata', label: 'India (IST)' },
        { value: 'Asia/Shanghai', label: 'China (CST)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
        { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
      ],
    };
  }
}
