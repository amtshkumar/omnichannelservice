import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum BounceType {
  HARD = 'HARD',
  SOFT = 'SOFT',
  COMPLAINT = 'COMPLAINT',
}

@Entity('bounces')
@Index(['email', 'bounceType'])
export class Bounce {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  email: string;

  @Column({
    type: 'enum',
    enum: BounceType,
  })
  bounceType: BounceType;

  @Column({ nullable: true })
  notificationRequestId: number;

  @Column({ type: 'text', nullable: true })
  bounceReason: string;

  @Column({ type: 'text', nullable: true })
  diagnosticCode: string;

  @Column({ length: 100, nullable: true })
  provider: string;

  @Column({ length: 255, nullable: true })
  providerMessageId: string;

  @Column({ type: 'json', nullable: true })
  rawData: any;

  @Column({ default: 1 })
  bounceCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastBounceAt: Date;

  @Column({ default: false })
  isSuppressed: boolean; // Auto-suppress after threshold

  @CreateDateColumn()
  createdAt: Date;
}
