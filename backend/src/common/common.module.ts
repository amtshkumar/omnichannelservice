import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { EncryptionService } from './services/encryption.service';
import { TemplateEngineService } from './services/template-engine.service';
import { ApiDocsController } from './controllers/api-docs.controller';

@Global()
@Module({
  controllers: [ApiDocsController],
  providers: [LoggerService, EncryptionService, TemplateEngineService],
  exports: [LoggerService, EncryptionService, TemplateEngineService],
})
export class CommonModule {}
