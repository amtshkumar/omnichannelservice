import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OutboxService } from './outbox.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/outbox')
export class OutboxController {
  constructor(private readonly outboxService: OutboxService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification previews/outbox' })
  @ApiQuery({ name: 'channel', enum: NotificationChannel, required: false })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false })
  @ApiQuery({ name: 'dateFrom', type: Date, required: false })
  @ApiQuery({ name: 'dateTo', type: Date, required: false })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  findAll(
    @Request() req,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: NotificationStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.outboxService.findAll(
      req.user.tenantId,
      channel,
      status,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification preview by ID' })
  @ApiResponse({ status: 200, description: 'Notification details' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.outboxService.findOne(+id, req.user.tenantId);
  }
}
