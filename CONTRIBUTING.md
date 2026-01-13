# Contributing to Notification Service

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/notification-service.git
cd notification-service

# Run setup
chmod +x setup.sh
./setup.sh

# Create feature branch
git checkout -b feature/your-feature-name
```

## Project Structure

```
notification-service/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── common/      # Shared utilities
│   │   ├── config/      # Configuration
│   │   ├── database/    # Entities, migrations, seeds
│   │   ├── notifications/ # Core notification logic
│   │   ├── outbox/      # Preview functionality
│   │   ├── providers/   # Provider abstraction
│   │   └── templates/   # Template management
│   └── test/            # Tests
├── admin-ui/            # React Admin Panel
│   └── src/
│       ├── components/  # Reusable components
│       ├── contexts/    # React contexts
│       ├── pages/       # Page components
│       └── services/    # API services
└── docker/              # Docker configs
```

## Coding Standards

### Backend (NestJS/TypeScript)

#### File Organization
- One class per file
- Group related functionality in modules
- Keep files under 200 lines
- Keep functions under 30 lines

#### Naming Conventions
```typescript
// Classes: PascalCase
class NotificationService {}

// Interfaces: PascalCase with descriptive names
interface EmailProvider {}

// Functions/Methods: camelCase
async sendEmail() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Private members: prefix with underscore
private _cache: Map<string, any>;
```

#### Code Style
```typescript
// Use async/await over promises
async function fetchData() {
  const result = await api.get('/data');
  return result;
}

// Use descriptive variable names
const activeProviderConfig = await this.getActiveProvider();

// Add JSDoc comments for public methods
/**
 * Sends an email notification
 * @param dto - Email notification data
 * @param tenantId - Optional tenant identifier
 * @returns Notification request details
 */
async sendEmail(dto: SendEmailDto, tenantId?: number) {}

// Use early returns to reduce nesting
if (!user) {
  throw new NotFoundException('User not found');
}
// Continue with logic...
```

#### Error Handling
```typescript
// Use specific exception types
throw new NotFoundException('Template not found');
throw new BadRequestException('Invalid email format');

// Log errors with context
this.logger.error('Failed to send email', error.stack, 'EmailService');

// Handle errors gracefully
try {
  await this.sendEmail(data);
} catch (error) {
  this.logger.error('Send failed', error);
  throw new InternalServerErrorException('Failed to send notification');
}
```

### Frontend (React/TypeScript)

#### Component Structure
```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <Box>
      <Heading>{title}</Heading>
      {/* Component JSX */}
    </Box>
  );
};

export default MyComponent;
```

#### Hooks
```typescript
// Custom hooks start with 'use'
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  return { notifications };
}
```

#### API Calls
```typescript
// Use try-catch with toast notifications
const handleSubmit = async () => {
  try {
    await api.create(data);
    toast({ title: 'Success', status: 'success' });
  } catch (error) {
    toast({ title: 'Error', status: 'error' });
  }
};
```

## Adding New Features

### Adding a New Notification Channel

Example: Adding WhatsApp support

1. **Create Interface**
```typescript
// backend/src/providers/interfaces/whatsapp-provider.interface.ts
export interface WhatsAppPayload {
  to: string;
  message: string;
}

export interface WhatsAppProvider {
  send(config: any, payload: WhatsAppPayload): Promise<ProviderResponse>;
}
```

2. **Implement Provider**
```typescript
// backend/src/providers/implementations/twilio-whatsapp.provider.ts
@Injectable()
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  async send(config: any, payload: WhatsAppPayload) {
    // Implementation
  }
}
```

3. **Update Enums**
```typescript
// backend/src/common/enums/notification-channel.enum.ts
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP', // Add this
}
```

4. **Update Factory**
```typescript
// backend/src/providers/provider.factory.ts
getWhatsAppProvider(providerType: ProviderType): WhatsAppProvider {
  // Implementation
}
```

5. **Add Service Method**
```typescript
// backend/src/notifications/notifications.service.ts
async sendWhatsApp(dto: SendWhatsAppDto, tenantId?: number) {
  // Implementation following email/SMS pattern
}
```

6. **Create DTOs**
```typescript
// backend/src/notifications/dto/send-whatsapp.dto.ts
export class SendWhatsAppDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
  
  @IsString()
  @IsNotEmpty()
  to: string;
  
  // ... other fields
}
```

7. **Add Controller Endpoint**
```typescript
// backend/src/notifications/notifications.controller.ts
@Post('whatsapp')
sendWhatsApp(@Body() dto: SendWhatsAppDto, @Request() req) {
  return this.notificationsService.sendWhatsApp(dto, req.user.tenantId);
}
```

8. **Update Migration**
```typescript
// Add WHATSAPP to channel enum in migration
channel ENUM('EMAIL', 'SMS', 'VOICE', 'PUSH', 'WHATSAPP')
```

9. **Update Admin UI**
- Add WhatsApp option in provider config form
- Add WhatsApp filter in templates
- Update outbox to display WhatsApp notifications

### Adding a New Provider

Example: Adding Mailgun for email

1. **Install SDK**
```bash
npm install mailgun.js
```

2. **Create Provider**
```typescript
// backend/src/providers/implementations/mailgun.provider.ts
@Injectable()
export class MailgunProvider implements EmailProvider {
  async send(config: any, payload: EmailPayload) {
    // Mailgun implementation
  }
}
```

3. **Update Enum**
```typescript
export enum ProviderType {
  SENDGRID = 'SENDGRID',
  MAILGUN = 'MAILGUN', // Add this
}
```

4. **Register in Factory**
```typescript
case ProviderType.MAILGUN:
  return this.mailgunProvider;
```

5. **Register in Module**
```typescript
providers: [
  // ... existing providers
  MailgunProvider,
]
```

## Testing

### Writing Unit Tests

```typescript
// backend/src/services/my-service.spec.ts
describe('MyService', () => {
  let service: MyService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();
    
    service = module.get<MyService>(MyService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should process data correctly', () => {
    const result = service.processData('input');
    expect(result).toBe('expected');
  });
});
```

### Writing E2E Tests

```typescript
// backend/test/feature.e2e-spec.ts
describe('Feature (e2e)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/endpoint (POST)', () => {
    return request(app.getHttpServer())
      .post('/endpoint')
      .send({ data: 'test' })
      .expect(201);
  });
});
```

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Database Migrations

### Creating Migrations

```bash
# Generate from entity changes
npm run migration:generate -- src/database/migrations/AddNewField

# Create empty migration
npm run migration:create -- src/database/migrations/CustomMigration
```

### Migration Best Practices

1. **Always test migrations**
```bash
# Test up
npm run migration:run

# Test down
npm run migration:revert
```

2. **Make migrations reversible**
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE users ADD COLUMN newField VARCHAR(255)`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE users DROP COLUMN newField`);
}
```

3. **Use transactions for data migrations**
```typescript
await queryRunner.startTransaction();
try {
  // Migration queries
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
}
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if adding features
   - Add JSDoc comments
   - Update API documentation

2. **Write Tests**
   - Unit tests for new functions
   - Integration tests for new endpoints
   - Maintain >80% coverage

3. **Run Linter**
```bash
npm run lint
npm run format
```

4. **Test Locally**
```bash
# Run all tests
npm test
npm run test:e2e

# Test in Docker
docker-compose down -v
docker-compose up -d
./setup.sh
```

5. **Commit Messages**
```bash
# Format: type(scope): description

feat(notifications): add WhatsApp channel support
fix(templates): resolve placeholder rendering issue
docs(readme): update installation instructions
test(providers): add unit tests for SendGrid provider
refactor(auth): simplify JWT validation logic
```

6. **Create Pull Request**
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - List breaking changes

## Code Review Guidelines

### For Authors
- Keep PRs focused and small
- Respond to feedback promptly
- Be open to suggestions
- Update based on feedback

### For Reviewers
- Be constructive and respectful
- Explain reasoning
- Approve when satisfied
- Test changes locally if needed

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Build Docker images
5. Deploy to staging
6. Test thoroughly
7. Deploy to production

## Questions?

- Check existing issues
- Read documentation
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
