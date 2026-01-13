/**
 * Notification-related constants
 * Centralized configuration following DRY principle
 */

export const NOTIFICATION_STATUS = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

export const STATUS_COLORS = {
  [NOTIFICATION_STATUS.QUEUED]: 'yellow',
  [NOTIFICATION_STATUS.SENT]: 'green',
  [NOTIFICATION_STATUS.FAILED]: 'red',
  [NOTIFICATION_STATUS.PROCESSING]: 'blue',
} as const;

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];
