/**
 * Utility functions for scheduled emails
 * Follows DRY principle - reusable helper functions
 */

import { ScheduledEmail } from '../hooks/useScheduledEmails';

/**
 * Extract email data from backend payload structure
 * Handles different payload formats consistently
 */
export const extractEmailData = (email: ScheduledEmail) => {
  const payload = email.payload || {};
  const recipients = email.recipients || { to: [] };

  return {
    toEmail: Array.isArray(payload.to) ? payload.to[0] : (recipients.to[0] || ''),
    toEmails: Array.isArray(payload.to) ? payload.to : (recipients.to || []),
    subject: payload.subject || '',
    body: payload.body || email.renderedContent || '',
    placeholders: payload.placeholders || {},
    scheduleAt: payload.scheduleAt || '',
    timezone: payload.timezone || 'UTC',
    templateId: email.templateId || payload.templateId,
  };
};

/**
 * Format scheduled email for form editing
 */
export const formatEmailForEdit = (email: ScheduledEmail) => {
  const data = extractEmailData(email);
  
  return {
    to: data.toEmail,
    subject: data.subject,
    body: data.body,
    templateId: data.templateId?.toString() || '',
    placeholders: JSON.stringify(data.placeholders),
    scheduleAt: data.scheduleAt ? new Date(data.scheduleAt).toISOString().slice(0, 16) : '',
    timezone: data.timezone,
  };
};

/**
 * Generate idempotency key for scheduled emails
 */
export const generateIdempotencyKey = (prefix: string = 'scheduled'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate schedule date is in the future
 */
export const isValidScheduleDate = (scheduleAt: string): boolean => {
  const scheduleDate = new Date(scheduleAt);
  return scheduleDate > new Date();
};
