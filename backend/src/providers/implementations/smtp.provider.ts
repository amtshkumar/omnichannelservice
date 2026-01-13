import { Injectable, Logger } from '@nestjs/common';
import {
  EmailProvider,
  EmailPayload,
  EmailProviderResponse,
} from '../interfaces/email-provider.interface';

// Using dynamic import for nodemailer to avoid build issues
const nodemailer = require('nodemailer');

interface SmtpCredentials {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SmtpMetadata {
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
}

@Injectable()
export class SmtpProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpProvider.name);
  private transporter: any;
  private credentials: SmtpCredentials;
  private metadata: SmtpMetadata;

  constructor(credentials: SmtpCredentials, metadata: SmtpMetadata) {
    this.credentials = credentials;
    this.metadata = metadata;
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.credentials.host,
        port: this.credentials.port,
        secure: this.credentials.secure,
        auth: {
          user: this.credentials.auth.user,
          pass: this.credentials.auth.pass,
        },
      });

      this.logger.log(
        `SMTP transporter initialized for ${this.credentials.host}:${this.credentials.port}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter', error);
      throw error;
    }
  }

  async send(config: any, payload: EmailPayload): Promise<EmailProviderResponse> {
    try {
      const mailOptions = {
        from: this.metadata.fromName
          ? `"${this.metadata.fromName}" <${this.metadata.fromEmail}>`
          : this.metadata.fromEmail,
        to: payload.to.join(', '),
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        cc: payload.cc?.join(', '),
        bcc: payload.bcc?.join(', '),
        replyTo: payload.replyTo || this.metadata.replyTo,
        attachments: payload.attachments,
      };

      this.logger.log(
        `Sending email via SMTP to ${payload.to.join(', ')} with subject: ${payload.subject}`,
      );

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully via SMTP. MessageId: ${result.messageId}`,
      );

      return {
        success: true,
        messageId: result.messageId,
        providerResponse: {
          response: result.response,
          accepted: result.accepted,
          rejected: result.rejected,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send email via SMTP', error);
      return {
        success: false,
        error: error.message || 'Failed to send email via SMTP',
        providerResponse: error,
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed', error);
      return false;
    }
  }
}
