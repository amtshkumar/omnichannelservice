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
import { TemplateHeader } from './template-header.entity';
import { TemplateFooter } from './template-footer.entity';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ length: 255, nullable: true })
  subject: string; // For email

  @Column({ type: 'text', nullable: true })
  bodyHtml: string; // For email

  @Column({ type: 'text', nullable: true })
  bodyText: string; // For SMS/Voice

  @Column({ nullable: true })
  headerId: number;

  @ManyToOne(() => TemplateHeader, { nullable: true })
  @JoinColumn({ name: 'headerId' })
  header: TemplateHeader;

  @Column({ nullable: true })
  footerId: number;

  @ManyToOne(() => TemplateFooter, { nullable: true })
  @JoinColumn({ name: 'footerId' })
  footer: TemplateFooter;

  @Column({ type: 'json', nullable: true })
  placeholders: string[]; // List of expected placeholders

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
