import { Injectable, BadRequestException } from '@nestjs/common';

export enum PlaceholderStrategy {
  KEEP = 'KEEP', // Keep placeholder as is
  BLANK = 'BLANK', // Replace with empty string
  THROW = 'THROW', // Throw error
}

@Injectable()
export class TemplateEngineService {
  /**
   * Replace placeholders in template with values from data
   * Supports nested keys like {{user.firstName}}
   */
  render(
    template: string,
    data: Record<string, any>,
    strategy: PlaceholderStrategy = PlaceholderStrategy.BLANK,
  ): string {
    if (!template) {
      return '';
    }

    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const missingKeys: string[] = [];

    const result = template.replace(placeholderRegex, (match, key) => {
      const trimmedKey = key.trim();
      const value = this.getNestedValue(data, trimmedKey);

      if (value === undefined || value === null) {
        missingKeys.push(trimmedKey);

        switch (strategy) {
          case PlaceholderStrategy.KEEP:
            return match;
          case PlaceholderStrategy.BLANK:
            return '';
          case PlaceholderStrategy.THROW:
            // Will throw after processing all placeholders
            return match;
          default:
            return '';
        }
      }

      return String(value);
    });

    if (strategy === PlaceholderStrategy.THROW && missingKeys.length > 0) {
      throw new BadRequestException(
        `Missing required placeholders: ${missingKeys.join(', ')}`,
      );
    }

    return result;
  }

  /**
   * Extract all placeholders from a template
   */
  extractPlaceholders(template: string): string[] {
    if (!template) {
      return [];
    }

    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(template)) !== null) {
      placeholders.push(match[1].trim());
    }

    return [...new Set(placeholders)]; // Remove duplicates
  }

  /**
   * Get nested value from object using dot notation
   * Example: getNestedValue({ user: { name: 'John' } }, 'user.name') => 'John'
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Validate that all required placeholders are present in data
   */
  validatePlaceholders(
    template: string,
    data: Record<string, any>,
  ): { valid: boolean; missing: string[] } {
    const placeholders = this.extractPlaceholders(template);
    const missing: string[] = [];

    for (const placeholder of placeholders) {
      const value = this.getNestedValue(data, placeholder);
      if (value === undefined || value === null) {
        missing.push(placeholder);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
