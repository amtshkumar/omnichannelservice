import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { ProviderType } from '../common/enums/provider-type.enum';
import { EmailProvider } from './interfaces/email-provider.interface';
import { SmsProvider } from './interfaces/sms-provider.interface';
import { SendGridProvider } from './implementations/sendgrid.provider';
import { TwilioProvider } from './implementations/twilio.provider';
import { MockEmailProvider } from './implementations/mock-email.provider';
import { MockSmsProvider } from './implementations/mock-sms.provider';
import { SmtpProvider } from './implementations/smtp.provider';

@Injectable()
export class ProviderFactory {
  constructor(
    private configService: ConfigService,
    private sendGridProvider: SendGridProvider,
    private twilioProvider: TwilioProvider,
    private mockEmailProvider: MockEmailProvider,
    private mockSmsProvider: MockSmsProvider,
  ) {}

  getEmailProvider(providerType: ProviderType, credentials?: any, metadata?: any): EmailProvider {
    // Use real provider if configured, regardless of environment
    // Only use MOCK if explicitly requested
    switch (providerType) {
      case ProviderType.SMTP:
        if (!credentials || !metadata) {
          throw new BadRequestException('SMTP provider requires credentials and metadata');
        }
        return new SmtpProvider(credentials, metadata);
      case ProviderType.SENDGRID:
        return this.sendGridProvider;
      case ProviderType.MOCK:
        return this.mockEmailProvider;
      default:
        throw new BadRequestException(`Unsupported email provider: ${providerType}`);
    }
  }

  getSmsProvider(providerType: ProviderType): SmsProvider {
    // Use real provider if configured, regardless of environment
    // Only use MOCK if explicitly requested
    switch (providerType) {
      case ProviderType.TWILIO:
        return this.twilioProvider;
      case ProviderType.MOCK:
        return this.mockSmsProvider;
      default:
        throw new BadRequestException(`Unsupported SMS provider: ${providerType}`);
    }
  }

  getProvider(channel: NotificationChannel, providerType: ProviderType): any {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return this.getEmailProvider(providerType);
      case NotificationChannel.SMS:
        return this.getSmsProvider(providerType);
      default:
        throw new BadRequestException(`Unsupported channel: ${channel}`);
    }
  }
}
