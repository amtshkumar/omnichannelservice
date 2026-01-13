import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationRequest } from '../database/entities/notification-request.entity';
import { DeliveryLog } from '../database/entities/delivery-log.entity';
import { ProvidersService } from '../providers/providers.service';
import { ProviderFactory } from '../providers/provider.factory';
import { TemplatesService } from '../templates/templates.service';
import { TemplateEngineService } from '../common/services/template-engine.service';
import { LoggerService } from '../common/services/logger.service';
import { QueueService } from '../queue/queue.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationRequest)
    private notificationRepository: Repository<NotificationRequest>,
    @InjectRepository(DeliveryLog)
    private deliveryLogRepository: Repository<DeliveryLog>,
    private providersService: ProvidersService,
    private providerFactory: ProviderFactory,
    private templatesService: TemplatesService,
    private templateEngine: TemplateEngineService,
    private configService: ConfigService,
    private queueService: QueueService,
    private logger: LoggerService,
  ) {}

  /**
   * Check idempotency - DRY helper method
   * Throws ConflictException if key already exists
   */
  private async checkIdempotency(idempotencyKey: string): Promise<void> {
    const existing = await this.notificationRepository.findOne({
      where: { idempotencyKey },
    });

    if (existing) {
      throw new ConflictException('Notification with this idempotency key already exists');
    }
  }

  /**
   * Render content from template or use raw content - DRY helper method
   */
  private async renderEmailContent(
    dto: { templateId?: number; subject?: string; body?: string; placeholders?: Record<string, any> },
    tenantId?: number,
  ): Promise<{ subject: string; body: string }> {
    if (dto.templateId) {
      const rendered = await this.templatesService.renderTemplate(
        dto.templateId,
        dto.placeholders || {},
        tenantId,
      );
      return { subject: rendered.subject, body: rendered.body };
    }

    if (!dto.subject || !dto.body) {
      throw new BadRequestException('Subject and body are required when not using template');
    }

    return {
      subject: this.templateEngine.render(dto.subject, dto.placeholders || {}),
      body: this.templateEngine.render(dto.body, dto.placeholders || {}),
    };
  }

  /**
   * Render SMS message from template or use raw message - DRY helper method
   */
  private async renderSmsMessage(
    dto: { templateId?: number; message?: string; placeholders?: Record<string, any> },
    tenantId?: number,
  ): Promise<string> {
    if (dto.templateId) {
      const rendered = await this.templatesService.renderTemplate(
        dto.templateId,
        dto.placeholders || {},
        tenantId,
      );
      return rendered.body;
    }

    if (!dto.message) {
      throw new BadRequestException('Message is required when not using template');
    }

    return this.templateEngine.render(dto.message, dto.placeholders || {});
  }

  async sendEmail(dto: SendEmailDto, tenantId?: number) {
    // Check idempotency using helper method
    await this.checkIdempotency(dto.idempotencyKey);

    // Render content using helper method
    const { subject, body } = await this.renderEmailContent(dto, tenantId);

    // Get active provider config
    const providerConfig = await this.providersService.findActiveByChannel(
      NotificationChannel.EMAIL,
      tenantId,
    );

    const appEnv = this.configService.get('APP_ENV');
    const isProduction = appEnv === 'production';

    // Create notification request record
    const notificationRequest = this.notificationRepository.create({
      idempotencyKey: dto.idempotencyKey,
      tenantId,
      channel: NotificationChannel.EMAIL,
      providerType: providerConfig.providerType,
      recipients: {
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
      },
      payload: dto,
      renderedContent: body,
      status: isProduction ? NotificationStatus.QUEUED : NotificationStatus.PREVIEW,
      templateId: dto.templateId,
    });

    const savedRequest = await this.notificationRepository.save(notificationRequest);

    // Queue the notification for processing (both production and non-production)
    await this.queueService.addNotification({
      type: 'email',
      notificationRequestId: savedRequest.id,
      payload: {
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject,
        html: body,
        attachments: dto.attachments,
        replyTo: dto.replyTo,
      },
      providerConfig: {
        providerType: providerConfig.providerType,
        credentials: this.providersService.getDecryptedCredentials(providerConfig),
        metadata: providerConfig.metadata,
      },
    });

    this.logger.log(
      `Email notification ${savedRequest.id} queued for processing`,
      'NotificationsService',
    );

    return {
      requestId: savedRequest.id,
      status: savedRequest.status,
      previewUrl: !isProduction ? `/admin/outbox/${savedRequest.id}` : undefined,
      createdAt: savedRequest.createdAt,
    };
  }

  async sendSms(dto: SendSmsDto, tenantId?: number) {
    // Check idempotency using helper method
    await this.checkIdempotency(dto.idempotencyKey);

    // Render message using helper method
    const message = await this.renderSmsMessage(dto, tenantId);

    // Get active provider config
    const providerConfig = await this.providersService.findActiveByChannel(
      NotificationChannel.SMS,
      tenantId,
    );

    const appEnv = this.configService.get('APP_ENV');
    const isProduction = appEnv === 'production';

    // Create notification request record
    const notificationRequest = this.notificationRepository.create({
      idempotencyKey: dto.idempotencyKey,
      tenantId,
      channel: NotificationChannel.SMS,
      providerType: providerConfig.providerType,
      recipients: { to: dto.to },
      payload: dto,
      renderedContent: message,
      status: isProduction ? NotificationStatus.QUEUED : NotificationStatus.PREVIEW,
      templateId: dto.templateId,
    });

    const savedRequest = await this.notificationRepository.save(notificationRequest);

    // Queue the notification for processing (both production and non-production)
    await this.queueService.addNotification({
      type: 'sms',
      notificationRequestId: savedRequest.id,
      payload: {
        to: dto.to,
        message,
      },
      providerConfig: {
        providerType: providerConfig.providerType,
        credentials: this.providersService.getDecryptedCredentials(providerConfig),
        metadata: providerConfig.metadata,
      },
    });

    this.logger.log(
      `SMS notification ${savedRequest.id} queued for processing`,
      'NotificationsService',
    );

    return {
      requestId: savedRequest.id,
      status: savedRequest.status,
      previewUrl: !isProduction ? `/admin/outbox/${savedRequest.id}` : undefined,
      createdAt: savedRequest.createdAt,
    };
  }

  /**
   * Send bulk email notifications
   */
  async sendBulkEmail(notifications: SendEmailDto[], tenantId?: number) {
    const results = [];
    const errors = [];

    for (const dto of notifications) {
      try {
        const result = await this.sendEmail(dto, tenantId);
        results.push(result);
      } catch (error) {
        errors.push({
          idempotencyKey: dto.idempotencyKey,
          error: error.message,
        });
      }
    }

    return {
      total: notifications.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSms(notifications: SendSmsDto[], tenantId?: number) {
    const results = [];
    const errors = [];

    for (const dto of notifications) {
      try {
        const result = await this.sendSms(dto, tenantId);
        results.push(result);
      } catch (error) {
        errors.push({
          idempotencyKey: dto.idempotencyKey,
          error: error.message,
        });
      }
    }

    return {
      total: notifications.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Schedule email notification for future delivery
   */
  async scheduleEmail(dto: SendEmailDto & { scheduleAt: string }, tenantId?: number) {
    // Check idempotency using helper method
    await this.checkIdempotency(dto.idempotencyKey);

    // Render content using helper method
    const { subject, body } = await this.renderEmailContent(dto, tenantId);

    // Get active provider config
    const providerConfig = await this.providersService.findActiveByChannel(
      NotificationChannel.EMAIL,
      tenantId,
    );

    const appEnv = this.configService.get('APP_ENV');
    const isProduction = appEnv === 'production';

    // Create notification request record
    const notificationRequest = this.notificationRepository.create({
      idempotencyKey: dto.idempotencyKey,
      tenantId,
      channel: NotificationChannel.EMAIL,
      providerType: providerConfig.providerType,
      recipients: {
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
      },
      payload: dto,
      renderedContent: body,
      status: NotificationStatus.QUEUED,
      templateId: dto.templateId,
    });

    const savedRequest = await this.notificationRepository.save(notificationRequest);

    // Schedule the notification for future delivery
    await this.queueService.scheduleNotification({
      type: 'email',
      notificationRequestId: savedRequest.id,
      payload: {
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject,
        html: body,
        attachments: dto.attachments,
        replyTo: dto.replyTo,
      },
      providerConfig: {
        providerType: providerConfig.providerType,
        credentials: this.providersService.getDecryptedCredentials(providerConfig),
        metadata: providerConfig.metadata,
      },
      scheduledFor: new Date(dto.scheduleAt),
    });

    this.logger.log(
      `Email notification ${savedRequest.id} scheduled for ${dto.scheduleAt}`,
      'NotificationsService',
    );

    return {
      requestId: savedRequest.id,
      status: savedRequest.status,
      scheduledFor: dto.scheduleAt,
      createdAt: savedRequest.createdAt,
    };
  }

  /**
   * Schedule SMS notification for future delivery
   */
  async scheduleSms(dto: SendSmsDto & { scheduleAt: string }, tenantId?: number) {
    // Check idempotency using helper method
    await this.checkIdempotency(dto.idempotencyKey);

    // Render message using helper method
    const message = await this.renderSmsMessage(dto, tenantId);

    // Get active provider config
    const providerConfig = await this.providersService.findActiveByChannel(
      NotificationChannel.SMS,
      tenantId,
    );

    // Create notification request record
    const notificationRequest = this.notificationRepository.create({
      idempotencyKey: dto.idempotencyKey,
      tenantId,
      channel: NotificationChannel.SMS,
      providerType: providerConfig.providerType,
      recipients: { to: dto.to },
      payload: dto,
      renderedContent: message,
      status: NotificationStatus.QUEUED,
      templateId: dto.templateId,
    });

    const savedRequest = await this.notificationRepository.save(notificationRequest);

    // Schedule the notification for future delivery
    await this.queueService.scheduleNotification({
      type: 'sms',
      notificationRequestId: savedRequest.id,
      payload: {
        to: dto.to,
        message,
      },
      providerConfig: {
        providerType: providerConfig.providerType,
        credentials: this.providersService.getDecryptedCredentials(providerConfig),
        metadata: providerConfig.metadata,
      },
      scheduledFor: new Date(dto.scheduleAt),
    });

    this.logger.log(
      `SMS notification ${savedRequest.id} scheduled for ${dto.scheduleAt}`,
      'NotificationsService',
    );

    return {
      requestId: savedRequest.id,
      status: savedRequest.status,
      scheduledFor: dto.scheduleAt,
      createdAt: savedRequest.createdAt,
    };
  }

  /**
   * Update a scheduled notification
   */
  async updateScheduled(
    id: number,
    dto: Partial<SendEmailDto & { scheduleAt: string }>,
    tenantId?: number,
  ) {
    const where: any = { id, status: NotificationStatus.QUEUED };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const notification = await this.notificationRepository.findOne({ where });

    if (!notification) {
      throw new NotFoundException('Scheduled notification not found or already processed');
    }

    // Update the notification fields
    if (dto.to) {
      notification.recipients = {
        ...notification.recipients,
        to: dto.to,
      };
    }

    if (dto.subject || dto.body) {
      const payload = notification.payload as any;
      if (dto.subject) payload.subject = dto.subject;
      if (dto.body) payload.body = dto.body;
      notification.payload = payload;
    }

    if (dto.scheduleAt) {
      // Cancel the old scheduled job and create a new one
      await this.queueService.cancelScheduledNotification(id.toString());
      
      // Re-schedule with new time
      const payload = notification.payload as any;
      await this.queueService.scheduleNotification({
        type: notification.channel === NotificationChannel.EMAIL ? 'email' : 'sms',
        notificationRequestId: id,
        payload: payload,
        providerConfig: null, // Will be fetched when processing
        scheduledFor: new Date(dto.scheduleAt),
      });
    }

    await this.notificationRepository.save(notification);

    this.logger.log(`Scheduled notification ${id} updated`, 'NotificationsService');

    return {
      id: notification.id,
      status: notification.status,
      message: 'Scheduled notification updated successfully',
    };
  }

  /**
   * Delete/cancel a scheduled notification
   */
  async deleteScheduled(id: number, tenantId?: number) {
    const where: any = { id, status: NotificationStatus.QUEUED };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const notification = await this.notificationRepository.findOne({ where });

    if (!notification) {
      throw new NotFoundException('Scheduled notification not found or already processed');
    }

    // Cancel the scheduled job in the queue
    await this.queueService.cancelScheduledNotification(id.toString());

    // Update status to cancelled
    notification.status = NotificationStatus.FAILED;
    notification.errorMessage = `Cancelled by user at ${new Date().toISOString()}`;

    await this.notificationRepository.save(notification);

    this.logger.log(`Scheduled notification ${id} cancelled`, 'NotificationsService');

    return {
      id: notification.id,
      status: 'cancelled',
      message: 'Scheduled notification cancelled successfully',
    };
  }
}
