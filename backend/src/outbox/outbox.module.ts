import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { OutboxController } from './outbox.controller';
import { OutboxService } from './outbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRequest])],
  controllers: [OutboxController],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
