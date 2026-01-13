import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateHeader } from '../database/entities/template-header.entity';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';

@Injectable()
export class HeadersService {
  constructor(
    @InjectRepository(TemplateHeader)
    private headerRepository: Repository<TemplateHeader>,
  ) {}

  async create(createDto: CreateHeaderDto, tenantId?: number): Promise<TemplateHeader> {
    const header = this.headerRepository.create({ ...createDto, tenantId });
    return this.headerRepository.save(header);
  }

  async findAll(tenantId?: number): Promise<TemplateHeader[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.headerRepository.find({ where });
  }

  async findOne(id: number, tenantId?: number): Promise<TemplateHeader> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    const header = await this.headerRepository.findOne({ where });
    if (!header) {
      throw new NotFoundException(`Header with ID ${id} not found`);
    }
    return header;
  }

  async update(id: number, updateDto: UpdateHeaderDto, tenantId?: number): Promise<TemplateHeader> {
    const header = await this.findOne(id, tenantId);
    Object.assign(header, updateDto);
    return this.headerRepository.save(header);
  }

  async remove(id: number, tenantId?: number): Promise<void> {
    const header = await this.findOne(id, tenantId);
    await this.headerRepository.remove(header);
  }
}
