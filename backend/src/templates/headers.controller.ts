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
import { HeadersService } from './headers.service';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/headers')
export class HeadersController {
  constructor(private readonly headersService: HeadersService) {}

  @Post()
  @ApiOperation({ summary: 'Create template header' })
  create(@Body() createDto: CreateHeaderDto, @Request() req) {
    return this.headersService.create(createDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all headers' })
  findAll(@Request() req) {
    return this.headersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get header by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.headersService.findOne(+id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update header' })
  update(@Param('id') id: string, @Body() updateDto: UpdateHeaderDto, @Request() req) {
    return this.headersService.update(+id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete header' })
  remove(@Param('id') id: string, @Request() req) {
    return this.headersService.remove(+id, req.user.tenantId);
  }
}
