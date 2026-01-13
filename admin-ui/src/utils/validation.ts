/**
 * Validation utilities
 * Centralized validation logic following DRY principle
 */

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate JSON string
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Parse JSON safely with fallback
 */
export const safeJSONParse = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Validate required fields for scheduled email
 */
export interface ScheduledEmailFormData {
  to: string;
  subject: string;
  body: string;
  scheduleAt: string;
}

export const validateScheduledEmailForm = (data: ScheduledEmailFormData): string | null => {
  if (!data.to || !data.subject || !data.body || !data.scheduleAt) {
    return 'Please fill in all required fields including schedule time';
  }

  if (!isValidEmail(data.to)) {
    return 'Please enter a valid email address';
  }

  const scheduleDate = new Date(data.scheduleAt);
  if (scheduleDate <= new Date()) {
    return 'Schedule time must be in the future';
  }

  return null;
};
