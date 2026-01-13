import { Injectable } from '@nestjs/common';
import {
  SmsProvider,
  SmsPayload,
  SmsProviderResponse,
} from '../interfaces/sms-provider.interface';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  constructor(private logger: LoggerService) {}

  async send(config: any, payload: SmsPayload): Promise<SmsProviderResponse> {
    // Mock provider - logs SMS instead of sending
    this.logger.log(
      `[MOCK SMS] Would send SMS to: ${payload.to}`,
      'MockSmsProvider',
    );
    this.logger.debug(
      `[MOCK SMS] Message: ${payload.message}`,
      'MockSmsProvider',
    );

    // Simulate successful send
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      providerResponse: {
        to: payload.to,
        message: payload.message,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
