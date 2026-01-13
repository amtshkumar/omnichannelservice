import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationTemplate } from './notification-template.entity';

@Entity('template_versions')
export class TemplateVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: number;

  @ManyToOne(() => NotificationTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: NotificationTemplate;

  @Column()
  version: number;

  @Column({ length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml: string;

  @Column({ type: 'text', nullable: true })
  bodyText: string;

  @Column({ type: 'json', nullable: true })
  placeholders: string[];

  @Column({ type: 'text', nullable: true })
  changeLog: string;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
