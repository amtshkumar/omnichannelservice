import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ABTest } from '../database/entities/ab-test.entity';
import { TemplateVariant } from '../database/entities/template-variant.entity';
import { ABTestingController } from './ab-testing.controller';
import { ABTestingService } from './ab-testing.service';

@Module({
  imports: [TypeOrmModule.forFeature([ABTest, TemplateVariant])],
  controllers: [ABTestingController],
  providers: [ABTestingService],
  exports: [ABTestingService],
})
export class ABTestingModule {}
