import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ProvidersModule } from './providers/providers.module';
import { TemplatesModule } from './templates/templates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OutboxModule } from './outbox/outbox.module';
import { CommonModule } from './common/common.module';
import { QueueModule } from './queue/queue.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ABTestingModule } from './ab-testing/ab-testing.module';
import { WebSocketModule } from './websocket/websocket.module';
import { typeOrmConfig } from './config/typeorm.config';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        ttl: configService.get('RATE_LIMIT_TTL') || 60000,
        limit: configService.get('RATE_LIMIT_MAX') || 100,
      }]),
      inject: [ConfigService],
    }),
    CommonModule,
    QueueModule,
    WebhooksModule,
    AnalyticsModule,
    ABTestingModule,
    WebSocketModule,
    AuthModule,
    ProvidersModule,
    TemplatesModule,
    NotificationsModule,
    OutboxModule,
  ],
})
export class AppModule {}
