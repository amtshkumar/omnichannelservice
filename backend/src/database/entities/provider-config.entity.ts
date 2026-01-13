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

@Entity('provider_configs')
@Index(['tenantId', 'channel', 'providerType'], { unique: true })
export class ProviderConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tenantId: number;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100, nullable: true })
  name: string; // User-friendly name for the provider config

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

  @Column({ type: 'text' })
  credentials: string; // Encrypted JSON

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional config like from_email, from_name, etc.

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 50, default: 'development' })
  environmentScope: string; // dev, staging, prod

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
