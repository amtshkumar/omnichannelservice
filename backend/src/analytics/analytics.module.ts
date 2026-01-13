import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from '../database/entities/analytics.entity';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { DeliveryLog } from '../database/entities/delivery-log.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics, NotificationRequest, DeliveryLog]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
