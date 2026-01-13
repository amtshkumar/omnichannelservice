import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum WebhookEvent {
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_FAILED = 'notification.failed',
  NOTIFICATION_DELIVERED = 'notification.delivered',
  NOTIFICATION_BOUNCED = 'notification.bounced',
}

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tenantId: number;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({
    type: 'simple-array',
  })
  events: WebhookEvent[];

  @Column({ type: 'json', nullable: true })
  headers: Record<string, string>;

  @Column({ length: 255, nullable: true })
  secret: string; // For HMAC signature verification

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failureCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastTriggeredAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastFailedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
