import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateFooter } from '../database/entities/template-footer.entity';
import { CreateFooterDto } from './dto/create-footer.dto';
import { UpdateFooterDto } from './dto/update-footer.dto';

@Injectable()
export class FootersService {
  constructor(
    @InjectRepository(TemplateFooter)
    private footerRepository: Repository<TemplateFooter>,
  ) {}

  async create(createDto: CreateFooterDto, tenantId?: number): Promise<TemplateFooter> {
    const footer = this.footerRepository.create({ ...createDto, tenantId });
    return this.footerRepository.save(footer);
  }

  async findAll(tenantId?: number): Promise<TemplateFooter[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.footerRepository.find({ where });
  }

  async findOne(id: number, tenantId?: number): Promise<TemplateFooter> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    const footer = await this.footerRepository.findOne({ where });
    if (!footer) {
      throw new NotFoundException(`Footer with ID ${id} not found`);
    }
    return footer;
  }

  async update(id: number, updateDto: UpdateFooterDto, tenantId?: number): Promise<TemplateFooter> {
    const footer = await this.findOne(id, tenantId);
    Object.assign(footer, updateDto);
    return this.footerRepository.save(footer);
  }

  async remove(id: number, tenantId?: number): Promise<void> {
    const footer = await this.findOne(id, tenantId);
    await this.footerRepository.remove(footer);
  }
}
