import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRequest } from '../../database/entities/notification-request.entity';
import { DeliveryLog } from '../../database/entities/delivery-log.entity';
import { ProviderFactory } from '../../providers/provider.factory';
import { ProvidersService } from '../../providers/providers.service';
import { NotificationStatus } from '../../common/enums/notification-status.enum';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';
import { ScheduledNotificationJob } from '../queue.service';
import { WebhooksService } from '../../webhooks/webhooks.service';
import { WebhookEvent } from '../../database/entities/webhook.entity';

/**
 * Processor for scheduled notifications queue
 * Handles delayed notification delivery
 */
@Processor('scheduled-notifications')
export class ScheduledNotificationProcessor {
  private readonly logger = new Logger(ScheduledNotificationProcessor.name);

  constructor(
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
    @InjectRepository(DeliveryLog)
    private deliveryLogRepository: Repository<DeliveryLog>,
    private providerFactory: ProviderFactory,
    private providersService: ProvidersService,
    @Inject(forwardRef(() => WebhooksService))
    private webhooksService: WebhooksService,
  ) {}

  @Process('send-scheduled')
  async handleScheduledNotification(job: Job<ScheduledNotificationJob>) {
    this.logger.log(`Full job data received: ${JSON.stringify(job.data, null, 2)}`);
    
    const { type, notificationRequestId, payload, providerConfig } = job.data;

    this.logger.log(
      `Processing scheduled ${type} notification for request ${notificationRequestId} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    // Declare outside try block for proper scope in catch block
    let actualProviderConfig = providerConfig;

    try {
      // Get notification request
      const notificationRequest = await this.notificationRepository.findOne({
        where: { id: notificationRequestId },
      });

      if (!notificationRequest) {
        throw new Error(`Notification request ${notificationRequestId} not found`);
      }

      // Get provider config - fetch from database if not in job data
      actualProviderConfig = providerConfig;
      
      if (!actualProviderConfig || !actualProviderConfig.providerType) {
        this.logger.warn(`Provider config missing from job data, fetching from database for notification ${notificationRequestId}`);
        
        // Determine channel from notification request
        const channel = notificationRequest.channel || (type === 'email' ? NotificationChannel.EMAIL : NotificationChannel.SMS);
        
        // Fetch active provider config from database
        const dbProviderConfig = await this.providersService.findActiveByChannel(
          channel,
          notificationRequest.tenantId,
        );
        
        if (!dbProviderConfig) {
          throw new Error(`No active provider found for channel ${channel}`);
        }
        
        actualProviderConfig = {
          providerType: dbProviderConfig.providerType,
          credentials: this.providersService.getDecryptedCredentials(dbProviderConfig),
          metadata: dbProviderConfig.metadata,
        };
        
        this.logger.log(`Fetched provider config from database: ${dbProviderConfig.providerType}`);
      }

      // Update status to sending
      notificationRequest.status = NotificationStatus.SENT;
      await this.notificationRepository.save(notificationRequest);

      // Get provider based on type
      const provider = type === 'email'
        ? this.providerFactory.getEmailProvider(
            actualProviderConfig.providerType,
            actualProviderConfig.credentials,
            actualProviderConfig.metadata,
          )
        : this.providerFactory.getSmsProvider(actualProviderConfig.providerType);

      // Send notification
      const result = await provider.send(
        { ...actualProviderConfig.credentials, ...actualProviderConfig.metadata },
        payload,
      );

      // Log successful delivery
      await this.deliveryLogRepository.save({
        notificationRequestId,
        attemptNumber: job.attemptsMade + 1,
        status: result.success ? 'SUCCESS' : 'FAILED',
        providerMessageId: result.messageId,
        providerResponse: result.providerResponse,
        errorMessage: result.error,
      });

      if (!result.success) {
        throw new Error(result.error || 'Provider returned unsuccessful status');
      }

      this.logger.log(
        `Successfully sent scheduled ${type} notification for request ${notificationRequestId}`,
      );

      // Trigger webhook for successful delivery
      await this.webhooksService.triggerWebhooks(
        WebhookEvent.NOTIFICATION_SENT,
        {
          event: WebhookEvent.NOTIFICATION_SENT,
          notificationId: notificationRequestId,
          status: 'sent',
          timestamp: new Date(),
          data: {
            type,
            provider: actualProviderConfig.providerType,
            messageId: result.messageId,
            scheduled: true,
          },
        },
        notificationRequest.tenantId,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send scheduled ${type} notification for request ${notificationRequestId}`,
        error,
      );

      // Log failed delivery
      await this.deliveryLogRepository.save({
        notificationRequestId,
        attemptNumber: job.attemptsMade + 1,
        status: 'FAILED',
        errorMessage: error.message,
      });

      // Update notification status to failed if all retries exhausted
      if (job.attemptsMade >= job.opts.attempts - 1) {
        const notificationRequest = await this.notificationRepository.findOne({
          where: { id: notificationRequestId },
        });
        if (notificationRequest) {
          notificationRequest.status = NotificationStatus.FAILED;
          await this.notificationRepository.save(notificationRequest);

          // Trigger webhook for failed delivery
          await this.webhooksService.triggerWebhooks(
            WebhookEvent.NOTIFICATION_FAILED,
            {
              event: WebhookEvent.NOTIFICATION_FAILED,
              notificationId: notificationRequestId,
              status: 'failed',
              timestamp: new Date(),
              data: {
                type,
                provider: actualProviderConfig.providerType,
                error: error.message,
                attempts: job.attemptsMade + 1,
                scheduled: true,
              },
            },
            notificationRequest.tenantId,
          );
        }
      }

      throw error; // Re-throw to trigger retry
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing scheduled job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Scheduled job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Scheduled job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
