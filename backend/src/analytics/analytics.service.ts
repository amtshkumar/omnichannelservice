import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Analytics } from '../database/entities/analytics.entity';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { DeliveryLog } from '../database/entities/delivery-log.entity';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
    @InjectRepository(DeliveryLog)
    private deliveryLogRepository: Repository<DeliveryLog>,
  ) {}

  /**
   * Get analytics for a date range
   */
  async getAnalytics(startDate: Date, endDate: Date, channel?: NotificationChannel) {
    const query = this.analyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (channel) {
      query.andWhere('analytics.channel = :channel', { channel });
    }

    return query.orderBy('analytics.date', 'DESC').getMany();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalNotifications,
      todayNotifications,
      emailsSent,
      smsSent,
      failedNotifications,
    ] = await Promise.all([
      this.notificationRepository.count(),
      this.notificationRepository.count({
        where: { createdAt: Between(today, new Date()) },
      }),
      this.notificationRepository.count({
        where: { channel: NotificationChannel.EMAIL },
      }),
      this.notificationRepository.count({
        where: { channel: NotificationChannel.SMS },
      }),
      this.notificationRepository.count({
        where: { status: NotificationStatus.FAILED },
      }),
    ]);

    const successRate = totalNotifications > 0
      ? ((totalNotifications - failedNotifications) / totalNotifications) * 100
      : 0;

    return {
      totalNotifications,
      todayNotifications,
      emailsSent,
      smsSent,
      failedNotifications,
      successRate: parseFloat(successRate.toFixed(2)),
    };
  }

  /**
   * Get channel breakdown
   */
  async getChannelBreakdown() {
    const result = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.channel')
      .getRawMany();

    return result.map((item) => ({
      channel: item.channel,
      count: parseInt(item.count),
    }));
  }

  /**
   * Get hourly statistics for today
   */
  async getHourlyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('HOUR(notification.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('notification.createdAt >= :today', { today })
      .groupBy('HOUR(notification.createdAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      hour: parseInt(item.hour),
      count: parseInt(item.count),
    }));
  }

  /**
   * Get provider performance
   */
  async getProviderPerformance() {
    const result = await this.deliveryLogRepository
      .createQueryBuilder('log')
      .select('log.providerType', 'provider')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN log.success = 1 THEN 1 ELSE 0 END)', 'successful')
      .groupBy('log.providerType')
      .getRawMany();

    return result.map((item) => ({
      provider: item.provider,
      total: parseInt(item.total),
      successful: parseInt(item.successful),
      successRate: ((parseInt(item.successful) / parseInt(item.total)) * 100).toFixed(2),
    }));
  }

  /**
   * Get daily trend for last N days
   */
  async getDailyTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('DATE(notification.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('notification.status', 'status')
      .where('notification.createdAt >= :startDate', { startDate })
      .groupBy('DATE(notification.createdAt)')
      .addGroupBy('notification.status')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      date: item.date,
      status: item.status,
      count: parseInt(item.count),
    }));
  }
}
