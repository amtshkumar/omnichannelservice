/**
 * Validation Helper Utilities
 * Follows DRY principle - centralized validation logic
 */

import { BadRequestException } from '@nestjs/common';

/**
 * Validate email format
 */
export class ValidationHelper {
  /**
   * Validate that a date is in the future
   */
  static validateFutureDate(date: Date | string, fieldName: string = 'Date'): void {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (dateObj <= new Date()) {
      throw new BadRequestException(`${fieldName} must be in the future`);
    }
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Validate email array
   */
  static validateEmailArray(emails: string[], fieldName: string = 'Email'): void {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new BadRequestException(`${fieldName} must be a non-empty array`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      throw new BadRequestException(
        `Invalid email addresses: ${invalidEmails.join(', ')}`
      );
    }
  }

  /**
   * Sanitize HTML content (basic)
   */
  static sanitizeHtml(html: string): string {
    // Basic sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '');
  }
}
