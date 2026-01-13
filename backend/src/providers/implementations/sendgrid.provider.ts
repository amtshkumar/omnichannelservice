import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import {
  EmailProvider,
  EmailPayload,
  EmailProviderResponse,
} from '../interfaces/email-provider.interface';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class SendGridProvider implements EmailProvider {
  constructor(private logger: LoggerService) {}

  async send(config: any, payload: EmailPayload): Promise<EmailProviderResponse> {
    try {
      const { apiKey } = config;

      if (!apiKey) {
        throw new Error('SendGrid API key is required');
      }

      sgMail.setApiKey(apiKey);

      const msg: any = {
        to: payload.to,
        from: config.fromEmail || payload.to[0],
        subject: payload.subject,
        html: payload.html,
      };

      if (payload.cc && payload.cc.length > 0) {
        msg.cc = payload.cc;
      }

      if (payload.bcc && payload.bcc.length > 0) {
        msg.bcc = payload.bcc;
      }

      if (payload.text) {
        msg.text = payload.text;
      }

      if (payload.replyTo || config.replyTo) {
        msg.replyTo = payload.replyTo || config.replyTo;
      }

      if (payload.attachments && payload.attachments.length > 0) {
        msg.attachments = payload.attachments;
      }

      const response = await sgMail.send(msg);

      this.logger.log(
        `Email sent via SendGrid to ${payload.to.join(', ')}`,
        'SendGridProvider',
      );

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'],
        providerResponse: response,
      };
    } catch (error) {
      this.logger.error(
        `SendGrid error: ${error.message}`,
        error.stack,
        'SendGridProvider',
      );

      return {
        success: false,
        error: error.message,
        providerResponse: error.response?.body,
      };
    }
  }
}
