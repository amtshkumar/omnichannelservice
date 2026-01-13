import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderConfig } from '../database/entities/provider-config.entity';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderFactory } from './provider.factory';
import { SendGridProvider } from './implementations/sendgrid.provider';
import { TwilioProvider } from './implementations/twilio.provider';
import { MockEmailProvider } from './implementations/mock-email.provider';
import { MockSmsProvider } from './implementations/mock-sms.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderConfig])],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderFactory,
    SendGridProvider,
    TwilioProvider,
    MockEmailProvider,
    MockSmsProvider,
  ],
  exports: [ProvidersService, ProviderFactory],
})
export class ProvidersModule {}
