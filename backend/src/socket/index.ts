/**
 * Socket.IO server setup
 * 
 * Configures Socket.IO server, middleware, and event handlers
 */

import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createSocketServer } from '../config/socket';
import { authenticateSocket } from './middleware/socketAuth.middleware';
import { TypedSocket } from '../types/socket';
import { logInfo, logError, logDebug } from '../utils/logger';
import * as chatHandler from './handlers/chat.handler';
import * as notificationsHandler from './handlers/notifications.handler';
import * as sessionsHandler from './handlers/sessions.handler';

/**
 * Initialize Socket.IO server
 */
export function initializeSocket(httpServer: HTTPServer): Server {
  const io = createSocketServer(httpServer);

  // Authentication middleware
  io.use(authenticateSocket);

  // Connection handler
  io.on('connection', (socket: TypedSocket) => {
    const userId = socket.data.userId;
    const userRole = socket.data.userRole;

    logInfo(`Socket connected`, {
      socketId: socket.id,
      userId,
      userRole,
    });

    // Register event handlers
    chatHandler.registerHandlers(socket, io);
    notificationsHandler.registerHandlers(socket, io);
    sessionsHandler.registerHandlers(socket, io);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logInfo(`Socket disconnected`, {
        socketId: socket.id,
        userId,
        reason,
      });

      // Leave all rooms
      socket.data.rooms?.forEach((room) => {
        socket.leave(room);
      });
    });

    // Error handler
    socket.on('error', (error) => {
      logError('Socket error', { socketId: socket.id, userId, error });
    });
  });

  logInfo('Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 * Note: This should be called after initializeSocket
 */
let socketIO: Server | null = null;

export function setSocketIO(io: Server): void {
  socketIO = io;
}

export function getSocketIO(): Server {
  if (!socketIO) {
    throw new Error('Socket.IO server not initialized. Call initializeSocket first.');
  }
  return socketIO;
}

