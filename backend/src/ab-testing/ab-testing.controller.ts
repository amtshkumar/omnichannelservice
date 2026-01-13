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
import { ABTestingService } from './ab-testing.service';
import { CreateABTestDto } from './dto/create-ab-test.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@ApiTags('A/B Testing')
@ApiBearerAuth()
@Controller('admin/ab-tests')
@UseGuards(JwtAuthGuard)
export class ABTestingController {
  constructor(private readonly abTestingService: ABTestingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all A/B tests' })
  getAllTests() {
    return this.abTestingService.getAllTests();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get A/B test by ID' })
  getTest(@Param('id') id: string) {
    return this.abTestingService.getTest(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new A/B test' })
  createTest(@Body() createDto: CreateABTestDto) {
    return this.abTestingService.createTest(createDto);
  }

  @Post('variants')
  @ApiOperation({ summary: 'Create template variant' })
  createVariant(@Body() createDto: CreateVariantDto) {
    return this.abTestingService.createVariant(createDto);
  }

  @Get('template/:templateId/variants')
  @ApiOperation({ summary: 'Get variants for template' })
  getVariants(@Param('templateId') templateId: string) {
    return this.abTestingService.getVariants(+templateId);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start A/B test' })
  startTest(@Param('id') id: string) {
    return this.abTestingService.startTest(+id);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause A/B test' })
  pauseTest(@Param('id') id: string) {
    return this.abTestingService.pauseTest(+id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete A/B test' })
  completeTest(@Param('id') id: string, @Body() body: { winnerVariantId: number }) {
    return this.abTestingService.completeTest(+id, body.winnerVariantId);
  }

  @Patch(':id/metrics')
  @ApiOperation({ summary: 'Update test metrics' })
  updateMetrics(@Param('id') id: string) {
    return this.abTestingService.updateTestMetrics(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete A/B test' })
  async deleteTest(@Param('id') id: string) {
    await this.abTestingService.deleteTest(+id);
    return { message: 'A/B test deleted successfully' };
  }

  @Delete('variants/:id')
  @ApiOperation({ summary: 'Delete variant' })
  async deleteVariant(@Param('id') id: string) {
    await this.abTestingService.deleteVariant(+id);
    return { message: 'Variant deleted successfully' };
  }
}
