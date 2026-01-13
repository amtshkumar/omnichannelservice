import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderConfig } from '../database/entities/provider-config.entity';
import { EncryptionService } from '../common/services/encryption.service';
import { CreateProviderConfigDto } from './dto/create-provider-config.dto';
import { UpdateProviderConfigDto } from './dto/update-provider-config.dto';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { ProviderType } from '../common/enums/provider-type.enum';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(ProviderConfig)
    private providerConfigRepository: Repository<ProviderConfig>,
    private encryptionService: EncryptionService,
  ) {}

  async create(createDto: CreateProviderConfigDto, tenantId?: number): Promise<ProviderConfig> {
    const encryptedCredentials = this.encryptionService.encryptObject(createDto.credentials);

    const providerConfig = this.providerConfigRepository.create({
      ...createDto,
      credentials: encryptedCredentials,
      tenantId,
    });

    return this.providerConfigRepository.save(providerConfig);
  }

  async findAll(tenantId?: number): Promise<ProviderConfig[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.providerConfigRepository.find({ where });
  }

  async findOne(id: number, tenantId?: number): Promise<ProviderConfig> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const config = await this.providerConfigRepository.findOne({ where });
    if (!config) {
      throw new NotFoundException(`Provider config with ID ${id} not found`);
    }

    return config;
  }

  async findActiveByChannel(
    channel: NotificationChannel,
    tenantId?: number,
  ): Promise<ProviderConfig> {
    const where: any = { channel, isActive: true };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const config = await this.providerConfigRepository.findOne({ where });
    if (!config) {
      throw new NotFoundException(`No active provider config found for channel ${channel}`);
    }

    return config;
  }

  async update(
    id: number,
    updateDto: UpdateProviderConfigDto,
    tenantId?: number,
  ): Promise<ProviderConfig> {
    const config = await this.findOne(id, tenantId);

    if (updateDto.credentials) {
      updateDto.credentials = this.encryptionService.encryptObject(updateDto.credentials) as any;
    }

    Object.assign(config, updateDto);
    return this.providerConfigRepository.save(config);
  }

  async remove(id: number, tenantId?: number): Promise<void> {
    const config = await this.findOne(id, tenantId);
    await this.providerConfigRepository.remove(config);
  }

  getDecryptedCredentials(config: ProviderConfig): any {
    return this.encryptionService.decryptObject(config.credentials);
  }

  async findByChannelAndProvider(
    channel: NotificationChannel,
    providerType: ProviderType,
    tenantId?: number,
  ): Promise<ProviderConfig | null> {
    const where: any = { channel, providerType };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.providerConfigRepository.findOne({ where });
  }
}
