import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './processors/notification.processor';
import { ScheduledNotificationProcessor } from './processors/scheduled.processor';
import { QueueService } from './queue.service';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { DeliveryLog } from '../database/entities/delivery-log.entity';
import { ProvidersModule } from '../providers/providers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationRequest, DeliveryLog]),
    ProvidersModule,
    forwardRef(() => WebhooksModule),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs
      },
    }),
    BullModule.registerQueue({
      name: 'scheduled-notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    BullModule.registerQueue({
      name: 'dead-letter',
      defaultJobOptions: {
        removeOnComplete: false, // Keep all dead letter jobs
        removeOnFail: false,
      },
    }),
  ],
  providers: [NotificationProcessor, ScheduledNotificationProcessor, QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
