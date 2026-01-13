import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('admin/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all webhooks' })
  findAll() {
    return this.webhooksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new webhook' })
  create(@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhooksService.create(createWebhookDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update webhook' })
  update(@Param('id') id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(+id, updateWebhookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook' })
  async delete(@Param('id') id: string) {
    await this.webhooksService.delete(+id);
    return { message: 'Webhook deleted successfully' };
  }
}
