import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTest, ABTestStatus } from '../database/entities/ab-test.entity';
import { TemplateVariant } from '../database/entities/template-variant.entity';

@Injectable()
export class ABTestingService {
  constructor(
    @InjectRepository(ABTest)
    private abTestRepository: Repository<ABTest>,
    @InjectRepository(TemplateVariant)
    private variantRepository: Repository<TemplateVariant>,
  ) {}

  async createTest(data: Partial<ABTest>): Promise<ABTest> {
    const test = this.abTestRepository.create(data);
    return this.abTestRepository.save(test);
  }

  async createVariant(data: Partial<TemplateVariant>): Promise<TemplateVariant> {
    const variant = this.variantRepository.create(data);
    return this.variantRepository.save(variant);
  }

  async getTest(id: number): Promise<ABTest> {
    const test = await this.abTestRepository.findOne({
      where: { id },
      relations: ['template'],
    });
    if (!test) {
      throw new NotFoundException('A/B test not found');
    }
    return test;
  }

  async getVariants(templateId: number): Promise<TemplateVariant[]> {
    return this.variantRepository.find({
      where: { templateId, isActive: true },
      order: { trafficPercentage: 'DESC' },
    });
  }

  async getAllTests(): Promise<ABTest[]> {
    return this.abTestRepository.find({
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async startTest(id: number): Promise<ABTest> {
    const test = await this.getTest(id);
    test.status = ABTestStatus.RUNNING;
    test.startDate = new Date();
    return this.abTestRepository.save(test);
  }

  async pauseTest(id: number): Promise<ABTest> {
    const test = await this.getTest(id);
    test.status = ABTestStatus.PAUSED;
    return this.abTestRepository.save(test);
  }

  async completeTest(id: number, winnerVariantId: number): Promise<ABTest> {
    const test = await this.getTest(id);
    test.status = ABTestStatus.COMPLETED;
    test.endDate = new Date();
    test.winnerVariantId = winnerVariantId;
    return this.abTestRepository.save(test);
  }

  /**
   * Select a variant based on traffic distribution
   */
  async selectVariant(templateId: number): Promise<TemplateVariant> {
    const variants = await this.getVariants(templateId);
    
    if (variants.length === 0) {
      throw new NotFoundException('No active variants found');
    }

    // Weighted random selection based on traffic percentage
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.trafficPercentage;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  /**
   * Record variant usage
   */
  async recordVariantSent(variantId: number): Promise<void> {
    await this.variantRepository.increment({ id: variantId }, 'sentCount', 1);
  }

  /**
   * Record email open
   */
  async recordOpen(variantId: number): Promise<void> {
    await this.variantRepository.increment({ id: variantId }, 'openCount', 1);
  }

  /**
   * Record link click
   */
  async recordClick(variantId: number): Promise<void> {
    await this.variantRepository.increment({ id: variantId }, 'clickCount', 1);
  }

  /**
   * Calculate and update metrics
   */
  async updateTestMetrics(testId: number): Promise<ABTest> {
    const test = await this.getTest(testId);
    const variants = await this.getVariants(test.templateId);

    const variantPerformance = variants.map((variant) => ({
      variantId: variant.id,
      name: variant.name,
      sent: variant.sentCount,
      opens: variant.openCount,
      clicks: variant.clickCount,
      openRate: variant.sentCount > 0 
        ? (variant.openCount / variant.sentCount) * 100 
        : 0,
      clickRate: variant.sentCount > 0 
        ? (variant.clickCount / variant.sentCount) * 100 
        : 0,
    }));

    const totalSent = variants.reduce((sum, v) => sum + v.sentCount, 0);
    const totalOpens = variants.reduce((sum, v) => sum + v.openCount, 0);
    const totalClicks = variants.reduce((sum, v) => sum + v.clickCount, 0);

    test.metrics = {
      totalSent,
      totalOpens,
      totalClicks,
      variantPerformance,
    };

    return this.abTestRepository.save(test);
  }

  async deleteTest(id: number): Promise<void> {
    await this.abTestRepository.delete(id);
  }

  async deleteVariant(id: number): Promise<void> {
    await this.variantRepository.delete(id);
  }
}
