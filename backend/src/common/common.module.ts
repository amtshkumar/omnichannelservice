import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { EncryptionService } from './services/encryption.service';
import { TemplateEngineService } from './services/template-engine.service';

@Global()
@Module({
  providers: [LoggerService, EncryptionService, TemplateEngineService],
  exports: [LoggerService, EncryptionService, TemplateEngineService],
})
export class CommonModule {}
