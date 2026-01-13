import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NotificationRequest } from './notification-request.entity';

@Entity('delivery_logs')
export class DeliveryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  notificationRequestId: number;

  @ManyToOne(() => NotificationRequest)
  @JoinColumn({ name: 'notificationRequestId' })
  notificationRequest: NotificationRequest;

  @Column()
  attemptNumber: number;

  @Column({ length: 50 })
  status: string; // SUCCESS, FAILED, RETRY

  @Column({ type: 'text', nullable: true })
  providerMessageId: string; // ID from provider (SendGrid, Twilio)

  @Column({ type: 'json', nullable: true })
  providerResponse: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
