import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Res,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationChannel } from '../common/enums/notification-channel.enum';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  create(@Body() createDto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(createDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiQuery({ name: 'channel', enum: NotificationChannel, required: false })
  @ApiResponse({ status: 200, description: 'List of templates' })
  findAll(@Request() req, @Query('channel') channel?: NotificationChannel) {
    return this.templatesService.findAll(req.user.tenantId, channel);
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Export all templates as JSON' })
  @ApiResponse({ status: 200, description: 'Templates exported successfully' })
  async exportAll(@Request() req, @Res() res: Response) {
    const templates = await this.templatesService.exportTemplates(req.user.tenantId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="templates-export-${Date.now()}.json"`);
    res.status(HttpStatus.OK).send(templates);
  }

  @Get('export/:id')
  @ApiOperation({ summary: 'Export single template as JSON' })
  @ApiResponse({ status: 200, description: 'Template exported successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async exportOne(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const template = await this.templatesService.exportTemplate(+id, req.user.tenantId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="template-${id}-${Date.now()}.json"`);
    res.status(HttpStatus.OK).send(template);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import templates from JSON file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Templates imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: any, @Request() req) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }

    const templates = JSON.parse(file.buffer.toString('utf-8'));
    return this.templatesService.importTemplates(templates, req.user.tenantId);
  }

  @Post('import/json')
  @ApiOperation({ summary: 'Import templates from JSON body' })
  @ApiResponse({ status: 201, description: 'Templates imported successfully' })
  async importJson(@Body() templates: any[], @Request() req) {
    return this.templatesService.importTemplates(templates, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.templatesService.findOne(+id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTemplateDto, @Request() req) {
    return this.templatesService.update(+id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.templatesService.remove(+id, req.user.tenantId);
  }

  @Post(':id/preview')
  @ApiOperation({ summary: 'Preview template with sample data' })
  @ApiResponse({ status: 200, description: 'Rendered template preview' })
  async preview(
    @Param('id') id: string,
    @Body() placeholders: Record<string, any>,
    @Request() req,
  ) {
    return this.templatesService.renderTemplate(+id, placeholders, req.user.tenantId);
  }
}
