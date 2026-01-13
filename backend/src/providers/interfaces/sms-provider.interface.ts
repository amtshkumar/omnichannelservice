export interface SmsPayload {
  to: string;
  message: string;
  from?: string;
}

export interface SmsProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  providerResponse?: any;
}

export interface SmsProvider {
  send(config: any, payload: SmsPayload): Promise<SmsProviderResponse>;
}
