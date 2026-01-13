import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from '../database/entities/notification-template.entity';
import { TemplateEngineService } from '../common/services/template-engine.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { HeadersService } from './headers.service';
import { FootersService } from './footers.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private templateEngine: TemplateEngineService,
    private headersService: HeadersService,
    private footersService: FootersService,
  ) {}

  async create(createDto: CreateTemplateDto, tenantId?: number): Promise<NotificationTemplate> {
    const template = this.templateRepository.create({
      ...createDto,
      tenantId,
    });

    return this.templateRepository.save(template);
  }

  async findAll(tenantId?: number, channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (channel) {
      where.channel = channel;
    }

    return this.templateRepository.find({
      where,
      relations: ['header', 'footer'],
    });
  }

  async findOne(id: number, tenantId?: number): Promise<NotificationTemplate> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const template = await this.templateRepository.findOne({
      where,
      relations: ['header', 'footer'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(
    id: number,
    updateDto: UpdateTemplateDto,
    tenantId?: number,
  ): Promise<NotificationTemplate> {
    const template = await this.findOne(id, tenantId);
    Object.assign(template, updateDto);
    return this.templateRepository.save(template);
  }

  async remove(id: number, tenantId?: number): Promise<void> {
    const template = await this.findOne(id, tenantId);
    await this.templateRepository.remove(template);
  }

  async renderTemplate(
    templateId: number,
    placeholders: Record<string, any>,
    tenantId?: number,
  ): Promise<{ subject?: string; body: string }> {
    const template = await this.findOne(templateId, tenantId);

    let body = '';

    // For email, compose header + body + footer
    if (template.channel === NotificationChannel.EMAIL) {
      if (template.headerId) {
        const header = await this.headersService.findOne(template.headerId, tenantId);
        body += this.templateEngine.render(header.content, placeholders);
      }

      body += this.templateEngine.render(template.bodyHtml, placeholders);

      if (template.footerId) {
        const footer = await this.footersService.findOne(template.footerId, tenantId);
        body += this.templateEngine.render(footer.content, placeholders);
      }

      const subject = this.templateEngine.render(template.subject, placeholders);

      return { subject, body };
    }

    // For SMS/Voice, just render the text
    body = this.templateEngine.render(template.bodyText, placeholders);

    return { body };
  }
}
