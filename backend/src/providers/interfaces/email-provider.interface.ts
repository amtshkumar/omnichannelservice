export interface EmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type?: string;
    disposition?: string;
  }>;
  replyTo?: string;
}

export interface EmailProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  providerResponse?: any;
}

export interface EmailProvider {
  send(config: any, payload: EmailPayload): Promise<EmailProviderResponse>;
}
