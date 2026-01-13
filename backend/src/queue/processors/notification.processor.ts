import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRequest } from '../../database/entities/notification-request.entity';
import { DeliveryLog } from '../../database/entities/delivery-log.entity';
import { ProviderFactory } from '../../providers/provider.factory';
import { NotificationStatus } from '../../common/enums/notification-status.enum';
import { NotificationJob } from '../queue.service';
import { WebhooksService } from '../../webhooks/webhooks.service';
import { WebhookEvent } from '../../database/entities/webhook.entity';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
    @InjectRepository(DeliveryLog)
    private deliveryLogRepository: Repository<DeliveryLog>,
    private providerFactory: ProviderFactory,
    @Inject(forwardRef(() => WebhooksService))
    private webhooksService: WebhooksService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJob>) {
    const { type, notificationRequestId, payload, providerConfig } = job.data;

    this.logger.log(
      `Processing ${type} notification for request ${notificationRequestId} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      // Get notification request
      const notificationRequest = await this.notificationRepository.findOne({
        where: { id: notificationRequestId },
      });

      if (!notificationRequest) {
        throw new Error(`Notification request ${notificationRequestId} not found`);
      }

      // Update status to sending
      notificationRequest.status = NotificationStatus.SENT;
      await this.notificationRepository.save(notificationRequest);

      // Get provider based on type
      const provider = type === 'email'
        ? this.providerFactory.getEmailProvider(
            providerConfig.providerType,
            providerConfig.credentials,
            providerConfig.metadata,
          )
        : this.providerFactory.getSmsProvider(providerConfig.providerType);

      // Send notification
      const result = await provider.send(
        { ...providerConfig.credentials, ...providerConfig.metadata },
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
        `Successfully sent ${type} notification for request ${notificationRequestId}`,
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
            provider: providerConfig.providerType,
            messageId: result.messageId,
          },
        },
        notificationRequest.tenantId,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send ${type} notification for request ${notificationRequestId}`,
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
      if (job.attemptsMade >= job.opts.attempts) {
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
                provider: providerConfig.providerType,
                error: error.message,
                attempts: job.attemptsMade,
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
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
