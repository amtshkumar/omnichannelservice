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

  async exportTemplates(tenantId?: number): Promise<any> {
    const templates = await this.findAll(tenantId);
    
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      tenantId,
      templates: templates.map(t => this.sanitizeTemplateForExport(t)),
    };
  }

  /**
   * Export a single template
   */
  async exportTemplate(id: number, tenantId?: number): Promise<any> {
    const template = await this.findOne(id, tenantId);
    
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      tenantId,
      template: this.sanitizeTemplateForExport(template),
    };
  }

  /**
   * Import templates from JSON
   */
  async importTemplates(data: any, tenantId?: number): Promise<any> {
    const imported = [];
    const errors = [];
    
    // Handle both single template and array of templates
    const templates = Array.isArray(data) 
      ? data 
      : data.templates || [data.template];

    for (const templateData of templates) {
      try {
        // Remove ID and timestamps to create new records
        const { id, createdAt, updatedAt, header, footer, ...cleanData } = templateData;
        
        const template = this.templateRepository.create({
          ...cleanData,
          tenantId,
        });

        const saved = await this.templateRepository.save(template);
        imported.push(saved);
      } catch (error) {
        errors.push({
          template: templateData.name,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      imported: imported.length,
      failed: errors.length,
      templates: imported,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Sanitize template for export (remove sensitive/unnecessary fields)
   */
  private sanitizeTemplateForExport(template: NotificationTemplate): any {
    const { id, createdAt, updatedAt, tenant, header, footer, ...exportData } = template as any;
    
    return {
      ...exportData,
      // Include header/footer content if present
      headerContent: header?.content,
      footerContent: footer?.content,
    };
  }
}
