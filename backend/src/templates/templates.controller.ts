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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
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
