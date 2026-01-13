import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';

export interface NotificationJob {
  type: 'email' | 'sms';
  notificationRequestId: number;
  payload: any;
  providerConfig: any;
}

export interface ScheduledNotificationJob extends NotificationJob {
  scheduledFor: Date;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('scheduled-notifications') private scheduledQueue: Queue,
    @InjectQueue('dead-letter') private deadLetterQueue: Queue,
  ) {}

  /**
   * Add a notification to the queue for immediate processing
   */
  async addNotification(
    job: NotificationJob,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.notificationQueue.add('send-notification', job, {
        priority: options?.priority || 1,
        ...options,
      });
      this.logger.log(
        `Notification queued: ${job.type} for request ${job.notificationRequestId}`,
      );
    } catch (error) {
      this.logger.error('Failed to queue notification', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(
    job: ScheduledNotificationJob,
    options?: JobOptions,
  ): Promise<void> {
    try {
      const delay = job.scheduledFor.getTime() - Date.now();
      
      if (delay <= 0) {
        // If scheduled time is in the past, send immediately
        await this.addNotification(job, options);
        return;
      }

      await this.scheduledQueue.add('send-scheduled', job, {
        delay,
        ...options,
      });

      this.logger.log(
        `Notification scheduled for ${job.scheduledFor.toISOString()}: ${job.type} for request ${job.notificationRequestId}`,
      );
    } catch (error) {
      this.logger.error('Failed to schedule notification', error);
      throw error;
    }
  }

  /**
   * Add bulk notifications to the queue
   */
  async addBulkNotifications(jobs: NotificationJob[]): Promise<void> {
    try {
      const bulkJobs = jobs.map((job) => ({
        name: 'send-notification',
        data: job,
      }));

      await this.notificationQueue.addBulk(bulkJobs);
      this.logger.log(`${jobs.length} notifications queued in bulk`);
    } catch (error) {
      this.logger.error('Failed to queue bulk notifications', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
      this.notificationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get scheduled notifications count
   */
  async getScheduledCount(): Promise<number> {
    return this.scheduledQueue.getDelayedCount();
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(jobId: string): Promise<boolean> {
    try {
      const job = await this.scheduledQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Scheduled notification ${jobId} cancelled`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel scheduled notification ${jobId}`, error);
      return false;
    }
  }

  /**
   * Move failed job to dead letter queue
   */
  async moveToDeadLetter(job: NotificationJob, error: Error): Promise<void> {
    try {
      await this.deadLetterQueue.add('failed-notification', {
        ...job,
        failureReason: error.message,
        failedAt: new Date(),
        originalQueue: 'notifications',
      });
      this.logger.log(`Moved job to dead letter queue: ${job.notificationRequestId}`);
    } catch (err) {
      this.logger.error('Failed to move job to dead letter queue', err);
    }
  }

  /**
   * Get dead letter queue jobs
   */
  async getDeadLetterJobs(limit: number = 100) {
    return this.deadLetterQueue.getJobs(['completed', 'failed'], 0, limit);
  }

  /**
   * Retry job from dead letter queue
   */
  async retryDeadLetterJob(jobId: string): Promise<void> {
    const job = await this.deadLetterQueue.getJob(jobId);
    if (job) {
      await this.addNotification(job.data);
      await job.remove();
      this.logger.log(`Retried job from dead letter queue: ${jobId}`);
    }
  }
}
