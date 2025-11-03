/**
 * Notifications Socket.IO handlers
 * 
 * Handles real-time notification events
 */

import { Server } from 'socket.io';
import { TypedSocket } from '../../types/socket';
import { logDebug, logError } from '../../utils/logger';

/**
 * Register notification event handlers
 */
export function registerHandlers(socket: TypedSocket, io: Server): void {
  const userId = socket.data.userId;

  /**
   * Join user's notification room
   * Each user has a personal notification room: notifications:{userId}
   */
  const notificationRoom = `notifications:${userId}`;
  socket.join(notificationRoom);
  socket.data.rooms = socket.data.rooms || [];
  if (!socket.data.rooms.includes(notificationRoom)) {
    socket.data.rooms.push(notificationRoom);
  }

  logDebug('User joined notification room', { userId, notificationRoom });

  /**
   * Handle notification acknowledgment
   */
  socket.on('acknowledgeNotification', (notificationId: string) => {
    try {
      logDebug('Notification acknowledged', { userId, notificationId });
      // In future, update notification status in database
    } catch (error) {
      logError('Error acknowledging notification', { userId, notificationId, error });
    }
  });
}

/**
 * Send notification to a user
 * Can be called from anywhere in the application
 */
export function sendNotificationToUser(
  io: Server,
  userId: string,
  notification: { type: string; message: string; data?: unknown }
): void {
  const notificationRoom = `notifications:${userId}`;
  io.to(notificationRoom).emit('notification', notification);
  logDebug('Notification sent to user', { userId, type: notification.type });
}

