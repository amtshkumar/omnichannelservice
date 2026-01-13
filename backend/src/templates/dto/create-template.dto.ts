import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

export class CreateTemplateDto {
  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @ApiProperty({ example: 'Welcome Email' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Welcome to {{companyName}}!', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    example: '<h1>Hello {{firstName}}</h1><p>Welcome to our platform!</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @ApiProperty({ example: 'Hello {{firstName}}, your OTP is {{otp}}', required: false })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  headerId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  footerId?: number;

  @ApiProperty({ example: ['firstName', 'companyName'], required: false })
  @IsArray()
  @IsOptional()
  placeholders?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
