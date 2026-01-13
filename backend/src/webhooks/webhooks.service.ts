import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookEvent } from '../database/entities/webhook.entity';
import * as crypto from 'crypto';

export interface WebhookPayload {
  event: WebhookEvent;
  notificationId: number;
  status: string;
  timestamp: Date;
  data: any;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Webhook)
    private webhookRepository: Repository<Webhook>,
  ) {}

  async findAll(tenantId?: number): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: tenantId ? { tenantId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Webhook> {
    return this.webhookRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Webhook>): Promise<Webhook> {
    const webhook = this.webhookRepository.create(data);
    return this.webhookRepository.save(webhook);
  }

  async update(id: number, data: Partial<Webhook>): Promise<Webhook> {
    await this.webhookRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.webhookRepository.delete(id);
  }

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(
    event: WebhookEvent,
    payload: WebhookPayload,
    tenantId?: number,
  ): Promise<void> {
    const webhooks = await this.webhookRepository.find({
      where: {
        isActive: true,
        tenantId: tenantId || null,
      },
    });

    const relevantWebhooks = webhooks.filter((webhook) =>
      webhook.events.includes(event),
    );

    if (relevantWebhooks.length === 0) {
      this.logger.debug(`No webhooks configured for event: ${event}`);
      return;
    }

    this.logger.log(
      `Triggering ${relevantWebhooks.length} webhooks for event: ${event}`,
    );

    // Trigger all webhooks in parallel
    await Promise.allSettled(
      relevantWebhooks.map((webhook) => this.sendWebhook(webhook, payload)),
    );
  }

  /**
   * Send webhook HTTP request
   */
  private async sendWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
  ): Promise<void> {
    try {
      const signature = this.generateSignature(webhook.secret, payload);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        ...webhook.headers,
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update success metrics
      await this.webhookRepository.update(webhook.id, {
        lastTriggeredAt: new Date(),
        failureCount: 0,
      });

      this.logger.log(`Webhook ${webhook.id} triggered successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to trigger webhook ${webhook.id}: ${error.message}`,
      );

      // Update failure metrics
      await this.webhookRepository.update(webhook.id, {
        lastFailedAt: new Date(),
        failureCount: webhook.failureCount + 1,
      });

      // Disable webhook after 10 consecutive failures
      if (webhook.failureCount + 1 >= 10) {
        await this.webhookRepository.update(webhook.id, {
          isActive: false,
        });
        this.logger.warn(
          `Webhook ${webhook.id} disabled after 10 consecutive failures`,
        );
      }
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(secret: string, payload: any): string {
    if (!secret) return '';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(secret: string, payload: any, signature: string): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
