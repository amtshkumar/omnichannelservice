import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsObject,
  IsEmail,
} from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ example: 'unique-email-key-123' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: ['user@example.com'] })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  to: string[];

  @ApiProperty({ example: ['cc@example.com'], required: false })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @ApiProperty({ example: ['bcc@example.com'], required: false })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];

  @ApiProperty({ example: 1, required: false, description: 'Template ID to use' })
  @IsNumber()
  @IsOptional()
  templateId?: number;

  @ApiProperty({ example: 'Welcome to our platform', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: '<h1>Hello {{name}}</h1>', required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ example: { name: 'John', orderId: '12345' }, required: false })
  @IsObject()
  @IsOptional()
  placeholders?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    content: string;
    type?: string;
    disposition?: string;
  }>;

  @ApiProperty({ example: 'reply@example.com', required: false })
  @IsEmail()
  @IsOptional()
  replyTo?: string;

  @ApiProperty({ example: 'UTC', required: false, description: 'Timezone for scheduled emails' })
  @IsString()
  @IsOptional()
  timezone?: string;
}
