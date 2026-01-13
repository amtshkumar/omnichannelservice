import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

@Entity('analytics')
@Index(['date', 'channel'])
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ default: 0 })
  totalSent: number;

  @Column({ default: 0 })
  totalFailed: number;

  @Column({ default: 0 })
  totalDelivered: number;

  @Column({ default: 0 })
  totalBounced: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgDeliveryTime: number; // in seconds

  @CreateDateColumn()
  createdAt: Date;
}
