/**
 * Sessions Socket.IO handlers
 * 
 * Handles real-time session-related events
 */

import { Server } from 'socket.io';
import { TypedSocket } from '../../types/socket';
import { logDebug, logError } from '../../utils/logger';

/**
 * Register session event handlers
 */
export function registerHandlers(socket: TypedSocket, io: Server): void {
  const userId = socket.data.userId;

  /**
   * Join session room
   * Users can join a session room to receive updates
   */
  socket.on('joinSession', (sessionId: string) => {
    try {
      const sessionRoom = `session:${sessionId}`;
      socket.join(sessionRoom);
      socket.data.rooms = socket.data.rooms || [];
      if (!socket.data.rooms.includes(sessionRoom)) {
        socket.data.rooms.push(sessionRoom);
      }

      logDebug('User joined session room', { userId, sessionId });
    } catch (error) {
      logError('Error joining session room', { userId, sessionId, error });
    }
  });

  /**
   * Leave session room
   */
  socket.on('leaveSession', (sessionId: string) => {
    try {
      const sessionRoom = `session:${sessionId}`;
      socket.leave(sessionRoom);
      socket.data.rooms = socket.data.rooms?.filter((r) => r !== sessionRoom) || [];

      logDebug('User left session room', { userId, sessionId });
    } catch (error) {
      logError('Error leaving session room', { userId, sessionId, error });
    }
  });
}

/**
 * Broadcast session update to all users in a session
 */
export function broadcastSessionUpdate(
  io: Server,
  sessionId: string,
  update: { sessionId: string; status: string }
): void {
  const sessionRoom = `session:${sessionId}`;
  io.to(sessionRoom).emit('sessionUpdate', update);
  logDebug('Session update broadcasted', { sessionId, status: update.status });
}

