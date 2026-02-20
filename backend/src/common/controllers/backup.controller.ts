import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BackupService } from '../services/backup.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export complete system backup' })
  @ApiResponse({ status: 200, description: 'Backup exported successfully' })
  async exportBackup(@Request() req, @Res() res: Response) {
    const backup = await this.backupService.createBackup(req.user.tenantId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${Date.now()}.json"`);
    res.status(HttpStatus.OK).send(backup);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import system backup from JSON file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Backup imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importBackup(@UploadedFile() file: any, @Request() req) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }

    const backup = JSON.parse(file.buffer.toString('utf-8'));
    return this.backupService.restoreBackup(backup, req.user.tenantId);
  }

  @Post('import/json')
  @ApiOperation({ summary: 'Import system backup from JSON body' })
  @ApiResponse({ status: 201, description: 'Backup imported successfully' })
  async importBackupJson(@Body() backup: any, @Request() req) {
    return this.backupService.restoreBackup(backup, req.user.tenantId);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate backup file structure' })
  @ApiResponse({ status: 200, description: 'Backup validation result' })
  async validateBackup(@Body() backup: any) {
    return this.backupService.validateBackup(backup);
  }
}
