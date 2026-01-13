import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
  ) {}

  async findAll(
    tenantId?: number,
    channel?: NotificationChannel,
    status?: NotificationStatus,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<NotificationRequest[]> {
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom && dateTo) {
      where.createdAt = Between(dateFrom, dateTo);
    } else if (dateFrom) {
      where.createdAt = Between(dateFrom, new Date());
    }

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100, // Limit results
    });
  }

  async findOne(id: number, tenantId?: number): Promise<NotificationRequest> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const notification = await this.notificationRepository.findOne({ where });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }
}
