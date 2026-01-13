import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsArray, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { WebhookEvent } from '../../database/entities/webhook.entity';

export class CreateWebhookDto {
  @ApiProperty({ example: 'Production Webhook' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://api.example.com/webhooks/notifications' })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: ['notification.sent', 'notification.failed'],
    enum: WebhookEvent,
    isArray: true,
  })
  @IsArray()
  events: WebhookEvent[];

  @ApiProperty({
    example: { 'Authorization': 'Bearer token123' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiProperty({ example: 'your-secret-key', required: false })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
