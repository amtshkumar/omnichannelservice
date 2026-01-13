/**
 * Notification Constants
 * Centralized configuration following DRY principle
 */

export const NOTIFICATION_LIMITS = {
  MAX_RECIPIENTS: 100,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ATTACHMENTS: 10,
  MAX_SUBJECT_LENGTH: 255,
  MAX_BODY_LENGTH: 100000,
} as const;

export const QUEUE_NAMES = {
  EMAIL: 'email-notifications',
  SMS: 'sms-notifications',
  SCHEDULED: 'scheduled-notifications',
} as const;

export const QUEUE_PRIORITIES = {
  HIGH: 1,
  NORMAL: 5,
  LOW: 10,
} as const;

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BACKOFF_DELAY: 5000, // 5 seconds
  BACKOFF_TYPE: 'exponential',
} as const;

export const DEFAULT_TIMEZONE = 'UTC';

export const SUPPORTED_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;
