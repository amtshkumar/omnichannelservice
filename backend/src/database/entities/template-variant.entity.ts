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

@Entity('template_variants')
export class TemplateVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: number;

  @ManyToOne(() => NotificationTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: NotificationTemplate;

  @Column({ length: 100 })
  name: string; // e.g., "Variant A", "Variant B"

  @Column({ length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml: string;

  @Column({ type: 'text', nullable: true })
  bodyText: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  trafficPercentage: number; // 0-100

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  openCount: number;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
