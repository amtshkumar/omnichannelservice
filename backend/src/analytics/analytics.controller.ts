import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { NotificationChannel } from '../common/enums/notification-channel.enum';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('channel-breakdown')
  @ApiOperation({ summary: 'Get notification breakdown by channel' })
  getChannelBreakdown() {
    return this.analyticsService.getChannelBreakdown();
  }

  @Get('hourly')
  @ApiOperation({ summary: 'Get hourly statistics for today' })
  getHourlyStats() {
    return this.analyticsService.getHourlyStats();
  }

  @Get('provider-performance')
  @ApiOperation({ summary: 'Get provider performance metrics' })
  getProviderPerformance() {
    return this.analyticsService.getProviderPerformance();
  }

  @Get('daily-trend')
  @ApiOperation({ summary: 'Get daily trend for last N days' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getDailyTrend(@Query('days') days?: string) {
    return this.analyticsService.getDailyTrend(days ? parseInt(days) : 7);
  }

  @Get()
  @ApiOperation({ summary: 'Get analytics for date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannel })
  getAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('channel') channel?: NotificationChannel,
  ) {
    return this.analyticsService.getAnalytics(
      new Date(startDate),
      new Date(endDate),
      channel,
    );
  }
}
