# Queue System Documentation

## Overview
The notification service uses **Bull** (backed by Redis) for asynchronous job processing with automatic retry mechanisms and scheduled delivery support.

## Features

### ✅ Implemented

1. **Async Processing**
   - All notifications are processed asynchronously via queues
   - Non-blocking API responses
   - Better scalability and performance

2. **Retry Mechanism with Exponential Backoff**
   - Automatic retry on failure (3 attempts by default)
   - Exponential backoff starting at 2 seconds
   - Failed jobs are logged and tracked

3. **Scheduled Notifications**
   - Schedule notifications for future delivery
   - Automatic execution at specified time
   - Cancel scheduled notifications before execution

4. **Bulk Processing**
   - Send multiple notifications efficiently
   - Batch job creation for better performance

5. **Queue Monitoring**
   - Real-time queue statistics
   - Track waiting, active, completed, and failed jobs
   - Monitor scheduled notifications

## Usage Examples

### Queue a Notification
```typescript
await queueService.addNotification({
  type: 'email',
  notificationRequestId: 123,
  payload: emailPayload,
  providerConfig: config,
});
```

### Schedule a Notification
```typescript
await queueService.scheduleNotification({
  type: 'email',
  notificationRequestId: 123,
  payload: emailPayload,
  providerConfig: config,
  scheduledFor: new Date('2024-12-25T10:00:00Z'),
});
```

### Bulk Notifications
```typescript
await queueService.addBulkNotifications([
  { type: 'email', notificationRequestId: 1, ... },
  { type: 'email', notificationRequestId: 2, ... },
  // ... more notifications
]);
```

### Get Queue Stats
```typescript
const stats = await queueService.getQueueStats();
// Returns: { waiting, active, completed, failed, delayed, total }
```

## Configuration

### Environment Variables
```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Queue Options
- **Attempts**: 3 retries
- **Backoff**: Exponential (2s, 4s, 8s)
- **Job Retention**: 100 completed, 500 failed

## Architecture

```
NotificationsService
    ↓
QueueService.addNotification()
    ↓
Bull Queue (Redis)
    ↓
NotificationProcessor.handleSendNotification()
    ↓
ProviderFactory → Email/SMS Provider
    ↓
DeliveryLog (Success/Failure)
```

## Monitoring

Access Bull Board (if configured) at:
```
http://localhost:3000/admin/queues
```

## Future Enhancements
- Dead letter queue for permanently failed jobs
- Priority-based processing
- Rate limiting per provider
- Webhook callbacks on completion
- Real-time status updates via WebSocket
