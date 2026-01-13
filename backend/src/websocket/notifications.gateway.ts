import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit notification status update to all connected clients
   */
  emitNotificationStatus(data: {
    notificationId: number;
    status: string;
    timestamp: Date;
    details?: any;
  }) {
    this.server.emit('notification:status', data);
    this.logger.log(`Emitted status update for notification ${data.notificationId}`);
  }

  /**
   * Emit notification status to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit queue statistics
   */
  emitQueueStats(stats: any) {
    this.server.emit('queue:stats', stats);
  }
}
