import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from '../../database/entities/notification-template.entity';
import { ProviderConfig } from '../../database/entities/provider-config.entity';
import { Webhook } from '../../database/entities/webhook.entity';
import { TemplateHeader } from '../../database/entities/template-header.entity';
import { TemplateFooter } from '../../database/entities/template-footer.entity';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(ProviderConfig)
    private providerRepository: Repository<ProviderConfig>,
    @InjectRepository(Webhook)
    private webhookRepository: Repository<Webhook>,
    @InjectRepository(TemplateHeader)
    private headerRepository: Repository<TemplateHeader>,
    @InjectRepository(TemplateFooter)
    private footerRepository: Repository<TemplateFooter>,
  ) {}

  /**
   * Create a complete backup of all system data
   */
  async createBackup(tenantId?: number): Promise<any> {
    this.logger.log(`Creating backup for tenant ${tenantId || 'all'}`);

    const where: any = tenantId ? { tenantId } : {};

    const [templates, providers, webhooks, headers, footers] = await Promise.all([
      this.templateRepository.find({ where }),
      this.providerRepository.find({ where }),
      this.webhookRepository.find({ where }),
      this.headerRepository.find({ where }),
      this.footerRepository.find({ where }),
    ]);

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tenantId,
      data: {
        templates: templates.map(t => this.sanitizeEntity(t)),
        providers: providers.map(p => this.sanitizeProvider(p)),
        webhooks: webhooks.map(w => this.sanitizeEntity(w)),
        headers: headers.map(h => this.sanitizeEntity(h)),
        footers: footers.map(f => this.sanitizeEntity(f)),
      },
      stats: {
        templates: templates.length,
        providers: providers.length,
        webhooks: webhooks.length,
        headers: headers.length,
        footers: footers.length,
      },
    };
  }

  /**
   * Restore backup data
   */
  async restoreBackup(backup: any, tenantId?: number): Promise<any> {
    this.logger.log(`Restoring backup for tenant ${tenantId || 'all'}`);

    const results = {
      templates: { imported: 0, failed: 0, errors: [] },
      providers: { imported: 0, failed: 0, errors: [] },
      webhooks: { imported: 0, failed: 0, errors: [] },
      headers: { imported: 0, failed: 0, errors: [] },
      footers: { imported: 0, failed: 0, errors: [] },
    };

    // Validate backup structure
    const validation = this.validateBackup(backup);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Invalid backup file',
        errors: validation.errors,
      };
    }

    const data = backup.data;

    // Import headers first (templates may reference them)
    if (data.headers) {
      for (const headerData of data.headers) {
        try {
          const { id, createdAt, updatedAt, ...cleanData } = headerData;
          const header = this.headerRepository.create({ ...cleanData, tenantId });
          await this.headerRepository.save(header);
          results.headers.imported++;
        } catch (error) {
          results.headers.failed++;
          results.headers.errors.push({ name: headerData.name, error: error.message });
        }
      }
    }

    // Import footers
    if (data.footers) {
      for (const footerData of data.footers) {
        try {
          const { id, createdAt, updatedAt, ...cleanData } = footerData;
          const footer = this.footerRepository.create({ ...cleanData, tenantId });
          await this.footerRepository.save(footer);
          results.footers.imported++;
        } catch (error) {
          results.footers.failed++;
          results.footers.errors.push({ name: footerData.name, error: error.message });
        }
      }
    }

    // Import templates
    if (data.templates) {
      for (const templateData of data.templates) {
        try {
          const { id, createdAt, updatedAt, ...cleanData } = templateData;
          const template = this.templateRepository.create({ ...cleanData, tenantId });
          await this.templateRepository.save(template);
          results.templates.imported++;
        } catch (error) {
          results.templates.failed++;
          results.templates.errors.push({ name: templateData.name, error: error.message });
        }
      }
    }

    // Import providers (skip credentials for security)
    if (data.providers) {
      for (const providerData of data.providers) {
        try {
          const { id, createdAt, updatedAt, credentials, ...cleanData } = providerData;
          // Don't import credentials - they need to be reconfigured
          const provider = this.providerRepository.create({ ...cleanData, tenantId });
          await this.providerRepository.save(provider);
          results.providers.imported++;
        } catch (error) {
          results.providers.failed++;
          results.providers.errors.push({ name: providerData.name, error: error.message });
        }
      }
    }

    // Import webhooks
    if (data.webhooks) {
      for (const webhookData of data.webhooks) {
        try {
          const { id, createdAt, updatedAt, ...cleanData } = webhookData;
          const webhook = this.webhookRepository.create({ ...cleanData, tenantId });
          await this.webhookRepository.save(webhook);
          results.webhooks.imported++;
        } catch (error) {
          results.webhooks.failed++;
          results.webhooks.errors.push({ name: webhookData.name, error: error.message });
        }
      }
    }

    return {
      success: true,
      message: 'Backup restored successfully',
      results,
    };
  }

  /**
   * Validate backup file structure
   */
  validateBackup(backup: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!backup) {
      errors.push('Backup file is empty');
      return { valid: false, errors };
    }

    if (!backup.version) {
      errors.push('Missing version field');
    }

    if (!backup.data) {
      errors.push('Missing data field');
      return { valid: false, errors };
    }

    // Check if at least one data type exists
    const hasData = ['templates', 'providers', 'webhooks', 'headers', 'footers'].some(
      key => backup.data[key] && Array.isArray(backup.data[key]) && backup.data[key].length > 0
    );

    if (!hasData) {
      errors.push('Backup contains no data');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove sensitive/unnecessary fields from entity
   */
  private sanitizeEntity(entity: any): any {
    const { id, createdAt, updatedAt, tenant, ...cleanData } = entity;
    return cleanData;
  }

  /**
   * Sanitize provider config (remove encrypted credentials)
   */
  private sanitizeProvider(provider: any): any {
    const { id, createdAt, updatedAt, tenant, credentials, ...cleanData } = provider;
    return {
      ...cleanData,
      // Mark that credentials need to be reconfigured
      credentialsRequired: true,
    };
  }
}
