import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsBoolean, IsString } from 'class-validator';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';
import { ProviderType } from '../../common/enums/provider-type.enum';

export class CreateProviderConfigDto {
  @ApiProperty({ example: 'My Gmail SMTP', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @ApiProperty({ enum: ProviderType, example: ProviderType.SENDGRID })
  @IsEnum(ProviderType)
  @IsNotEmpty()
  providerType: ProviderType;

  @ApiProperty({
    example: { apiKey: 'SG.xxx' },
    description: 'Provider credentials (will be encrypted)',
  })
  @IsObject()
  @IsNotEmpty()
  credentials: any;

  @ApiProperty({
    example: { fromEmail: 'noreply@example.com', fromName: 'Notifications' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'development', required: false })
  @IsString()
  @IsOptional()
  environmentScope?: string;
}
