import { Injectable } from '@nestjs/common';
import {
  EmailProvider,
  EmailPayload,
  EmailProviderResponse,
} from '../interfaces/email-provider.interface';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class MockEmailProvider implements EmailProvider {
  constructor(private logger: LoggerService) {}

  async send(config: any, payload: EmailPayload): Promise<EmailProviderResponse> {
    // Mock provider - logs email instead of sending
    this.logger.log(
      `[MOCK EMAIL] Would send email to: ${payload.to.join(', ')}`,
      'MockEmailProvider',
    );
    this.logger.debug(
      `[MOCK EMAIL] Subject: ${payload.subject}`,
      'MockEmailProvider',
    );
    this.logger.debug(
      `[MOCK EMAIL] Body preview: ${payload.html.substring(0, 100)}...`,
      'MockEmailProvider',
    );

    // Simulate successful send
    return {
      success: true,
      messageId: `mock-email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      providerResponse: {
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: payload.subject,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
