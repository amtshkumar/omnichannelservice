import { Test, TestingModule } from '@nestjs/testing';
import { TemplateEngineService, PlaceholderStrategy } from './template-engine.service';

describe('TemplateEngineService', () => {
  let service: TemplateEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateEngineService],
    }).compile();

    service = module.get<TemplateEngineService>(TemplateEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('render', () => {
    it('should replace simple placeholders', () => {
      const template = 'Hello {{name}}!';
      const data = { name: 'John' };
      const result = service.render(template, data);
      expect(result).toBe('Hello John!');
    });

    it('should replace nested placeholders', () => {
      const template = 'Hello {{user.firstName}} {{user.lastName}}!';
      const data = { user: { firstName: 'John', lastName: 'Doe' } };
      const result = service.render(template, data);
      expect(result).toBe('Hello John Doe!');
    });

    it('should handle missing placeholders with BLANK strategy', () => {
      const template = 'Hello {{name}}!';
      const data = {};
      const result = service.render(template, data, PlaceholderStrategy.BLANK);
      expect(result).toBe('Hello !');
    });

    it('should handle missing placeholders with KEEP strategy', () => {
      const template = 'Hello {{name}}!';
      const data = {};
      const result = service.render(template, data, PlaceholderStrategy.KEEP);
      expect(result).toBe('Hello {{name}}!');
    });

    it('should throw error for missing placeholders with THROW strategy', () => {
      const template = 'Hello {{name}}!';
      const data = {};
      expect(() => {
        service.render(template, data, PlaceholderStrategy.THROW);
      }).toThrow();
    });

    it('should handle multiple placeholders', () => {
      const template = 'Order {{orderId}} for {{customer}} is {{status}}';
      const data = { orderId: '12345', customer: 'John', status: 'shipped' };
      const result = service.render(template, data);
      expect(result).toBe('Order 12345 for John is shipped');
    });
  });

  describe('extractPlaceholders', () => {
    it('should extract all placeholders', () => {
      const template = 'Hello {{firstName}} {{lastName}}, your order {{orderId}} is ready';
      const placeholders = service.extractPlaceholders(template);
      expect(placeholders).toEqual(['firstName', 'lastName', 'orderId']);
    });

    it('should handle nested placeholders', () => {
      const template = 'Hello {{user.name}}, your {{order.id}} is ready';
      const placeholders = service.extractPlaceholders(template);
      expect(placeholders).toEqual(['user.name', 'order.id']);
    });

    it('should remove duplicates', () => {
      const template = 'Hello {{name}}, {{name}}!';
      const placeholders = service.extractPlaceholders(template);
      expect(placeholders).toEqual(['name']);
    });
  });

  describe('validatePlaceholders', () => {
    it('should validate all placeholders are present', () => {
      const template = 'Hello {{name}}';
      const data = { name: 'John' };
      const result = service.validatePlaceholders(template, data);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing placeholders', () => {
      const template = 'Hello {{firstName}} {{lastName}}';
      const data = { firstName: 'John' };
      const result = service.validatePlaceholders(template, data);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['lastName']);
    });
  });
});
