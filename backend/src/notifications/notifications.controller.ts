import { Controller, Post, Body, UseGuards, Request, Delete, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({ status: 201, description: 'Email notification created' })
  @ApiResponse({ status: 409, description: 'Duplicate idempotency key' })
  sendEmail(@Body() dto: SendEmailDto, @Request() req) {
    return this.notificationsService.sendEmail(dto, req.user.tenantId);
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS notification' })
  @ApiResponse({ status: 201, description: 'SMS notification created' })
  @ApiResponse({ status: 409, description: 'Duplicate idempotency key' })
  sendSms(@Body() dto: SendSmsDto, @Request() req) {
    return this.notificationsService.sendSms(dto, req.user.tenantId);
  }

  @Post('bulk/email')
  @ApiOperation({ summary: 'Send bulk email notifications' })
  @ApiResponse({ status: 201, description: 'Bulk emails queued successfully' })
  async sendBulkEmail(@Body() dto: { notifications: SendEmailDto[] }, @Request() req) {
    return this.notificationsService.sendBulkEmail(dto.notifications, req.user.tenantId);
  }

  @Post('bulk/sms')
  @ApiOperation({ summary: 'Send bulk SMS notifications' })
  @ApiResponse({ status: 201, description: 'Bulk SMS queued successfully' })
  async sendBulkSms(@Body() dto: { notifications: SendSmsDto[] }, @Request() req) {
    return this.notificationsService.sendBulkSms(dto.notifications, req.user.tenantId);
  }

  @Post('schedule/email')
  @ApiOperation({ summary: 'Schedule email notification for future delivery' })
  @ApiResponse({ status: 201, description: 'Email scheduled successfully' })
  async scheduleEmail(@Body() dto: SendEmailDto & { scheduleAt: string }, @Request() req) {
    return this.notificationsService.scheduleEmail(dto, req.user.tenantId);
  }

  @Post('schedule/sms')
  @ApiOperation({ summary: 'Schedule SMS notification for future delivery' })
  @ApiResponse({ status: 201, description: 'SMS scheduled successfully' })
  async scheduleSms(@Body() dto: SendSmsDto & { scheduleAt: string }, @Request() req) {
    return this.notificationsService.scheduleSms(dto, req.user.tenantId);
  }

  @Patch('schedule/:id')
  @ApiOperation({ summary: 'Update scheduled notification' })
  @ApiResponse({ status: 200, description: 'Scheduled notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateScheduled(
    @Param('id') id: string,
    @Body() dto: Partial<SendEmailDto & { scheduleAt: string }>,
    @Request() req,
  ) {
    return this.notificationsService.updateScheduled(+id, dto, req.user.tenantId);
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: 'Cancel/delete scheduled notification' })
  @ApiResponse({ status: 200, description: 'Scheduled notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteScheduled(@Param('id') id: string, @Request() req) {
    return this.notificationsService.deleteScheduled(+id, req.user.tenantId);
  }
}
