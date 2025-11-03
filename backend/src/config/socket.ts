/**
 * Socket.IO server configuration
 * 
 * Configures Socket.IO server and CORS settings
 */

import { Server as HTTPServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import { config } from './index';

/**
 * Socket.IO server options
 */
export function getSocketOptions(): Partial<ServerOptions> {
  return {
    cors: {
      origin: config.frontend.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  };
}

/**
 * Create Socket.IO server instance
 */
export function createSocketServer(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, getSocketOptions());
  return io;
}

