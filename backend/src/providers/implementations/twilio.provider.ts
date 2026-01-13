import { Injectable } from '@nestjs/common';
import twilio from 'twilio';
import {
  SmsProvider,
  SmsPayload,
  SmsProviderResponse,
} from '../interfaces/sms-provider.interface';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class TwilioProvider implements SmsProvider {
  constructor(private logger: LoggerService) {}

  async send(config: any, payload: SmsPayload): Promise<SmsProviderResponse> {
    try {
      const { accountSid, authToken, fromNumber } = config;

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials are required');
      }

      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: payload.message,
        from: payload.from || fromNumber,
        to: payload.to,
      });

      this.logger.log(`SMS sent via Twilio to ${payload.to}`, 'TwilioProvider');

      return {
        success: true,
        messageId: message.sid,
        providerResponse: message,
      };
    } catch (error) {
      this.logger.error(`Twilio error: ${error.message}`, error.stack, 'TwilioProvider');

      return {
        success: false,
        error: error.message,
        providerResponse: error,
      };
    }
  }
}
