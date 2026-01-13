import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';
import { ProviderType } from '../../common/enums/provider-type.enum';
import { NotificationStatus } from '../../common/enums/notification-status.enum';

@Entity('notification_requests')
export class NotificationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  @Index()
  idempotencyKey: string;

  @Column({ nullable: true })
  tenantId: number;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  @Index()
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: ProviderType,
  })
  providerType: ProviderType;

  @Column({ type: 'json' })
  recipients: any; // { to, cc, bcc } for email or { to } for SMS

  @Column({ type: 'json', nullable: true })
  payload: any; // Original request payload

  @Column({ type: 'text', nullable: true })
  renderedContent: string; // Final rendered content

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.QUEUED,
  })
  @Index()
  status: NotificationStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  providerResponse: any; // Response from provider

  @Column({ nullable: true })
  templateId: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
