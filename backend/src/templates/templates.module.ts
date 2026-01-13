import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate } from '../database/entities/notification-template.entity';
import { TemplateHeader } from '../database/entities/template-header.entity';
import { TemplateFooter } from '../database/entities/template-footer.entity';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { HeadersController } from './headers.controller';
import { FootersController } from './footers.controller';
import { HeadersService } from './headers.service';
import { FootersService } from './footers.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate, TemplateHeader, TemplateFooter])],
  controllers: [TemplatesController, HeadersController, FootersController],
  providers: [TemplatesService, HeadersService, FootersService],
  exports: [TemplatesService, HeadersService, FootersService],
})
export class TemplatesModule {}
