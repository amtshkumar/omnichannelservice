import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

@Entity('unsubscribes')
@Index(['email', 'channel'])
export class Unsubscribe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  email: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    nullable: true,
  })
  channel: NotificationChannel; // null means unsubscribed from all

  @Column({ length: 100, nullable: true })
  category: string; // e.g., 'marketing', 'newsletters'

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ length: 255, nullable: true })
  token: string; // Unique token for resubscribe

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
