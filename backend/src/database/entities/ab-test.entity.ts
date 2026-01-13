import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationTemplate } from './notification-template.entity';

export enum ABTestStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

@Entity('ab_tests')
export class ABTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: number;

  @ManyToOne(() => NotificationTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: NotificationTemplate;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ABTestStatus,
    default: ABTestStatus.DRAFT,
  })
  status: ABTestStatus;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  winnerVariantId: number;

  @Column({ type: 'json', nullable: true })
  metrics: {
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    variantPerformance: Array<{
      variantId: number;
      name: string;
      sent: number;
      opens: number;
      clicks: number;
      openRate: number;
      clickRate: number;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
