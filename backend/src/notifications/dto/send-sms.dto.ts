import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ example: 'unique-sms-key-456' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 1, required: false, description: 'Template ID to use' })
  @IsNumber()
  @IsOptional()
  templateId?: number;

  @ApiProperty({ example: 'Your OTP is {{otp}}', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: { otp: '123456' }, required: false })
  @IsObject()
  @IsOptional()
  placeholders?: Record<string, any>;
}
