import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

@Entity('user_preferences')
@Index(['userId', 'channel'])
export class UserPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  userId: string; // External user ID from your application

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  categories: {
    marketing: boolean;
    transactional: boolean;
    alerts: boolean;
    newsletters: boolean;
  };

  @Column({ type: 'json', nullable: true })
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };

  @Column({ type: 'json', nullable: true })
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
