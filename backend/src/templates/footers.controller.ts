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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FootersService } from './footers.service';
import { CreateFooterDto } from './dto/create-footer.dto';
import { UpdateFooterDto } from './dto/update-footer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/footers')
export class FootersController {
  constructor(private readonly footersService: FootersService) {}

  @Post()
  @ApiOperation({ summary: 'Create template footer' })
  create(@Body() createDto: CreateFooterDto, @Request() req) {
    return this.footersService.create(createDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all footers' })
  findAll(@Request() req) {
    return this.footersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get footer by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.footersService.findOne(+id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update footer' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFooterDto, @Request() req) {
    return this.footersService.update(+id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete footer' })
  remove(@Param('id') id: string, @Request() req) {
    return this.footersService.remove(+id, req.user.tenantId);
  }
}
