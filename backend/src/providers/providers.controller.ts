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
import { ProvidersService } from './providers.service';
import { CreateProviderConfigDto } from './dto/create-provider-config.dto';
import { UpdateProviderConfigDto } from './dto/update-provider-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/provider-configs')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create provider configuration' })
  @ApiResponse({ status: 201, description: 'Provider config created successfully' })
  create(@Body() createDto: CreateProviderConfigDto, @Request() req) {
    return this.providersService.create(createDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all provider configurations' })
  @ApiResponse({ status: 200, description: 'List of provider configs' })
  findAll(@Request() req) {
    return this.providersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider configuration by ID' })
  @ApiResponse({ status: 200, description: 'Provider config details' })
  @ApiResponse({ status: 404, description: 'Provider config not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.providersService.findOne(+id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider configuration' })
  @ApiResponse({ status: 200, description: 'Provider config updated successfully' })
  @ApiResponse({ status: 404, description: 'Provider config not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProviderConfigDto, @Request() req) {
    return this.providersService.update(+id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete provider configuration' })
  @ApiResponse({ status: 200, description: 'Provider config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Provider config not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.providersService.remove(+id, req.user.tenantId);
  }
}
