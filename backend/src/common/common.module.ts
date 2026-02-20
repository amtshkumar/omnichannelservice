import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './services/logger.service';
import { EncryptionService } from './services/encryption.service';
import { TemplateEngineService } from './services/template-engine.service';
import { BackupService } from './services/backup.service';
import { ApiDocsController } from './controllers/api-docs.controller';
import { BackupController } from './controllers/backup.controller';
import { NotificationTemplate } from '../database/entities/notification-template.entity';
import { ProviderConfig } from '../database/entities/provider-config.entity';
import { Webhook } from '../database/entities/webhook.entity';
import { TemplateHeader } from '../database/entities/template-header.entity';
import { TemplateFooter } from '../database/entities/template-footer.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationTemplate,
      ProviderConfig,
      Webhook,
      TemplateHeader,
      TemplateFooter,
    ]),
  ],
  controllers: [ApiDocsController, BackupController],
  providers: [LoggerService, EncryptionService, TemplateEngineService, BackupService],
  exports: [LoggerService, EncryptionService, TemplateEngineService, BackupService],
})
export class CommonModule {}
