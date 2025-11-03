/**
 * Socket.IO authentication middleware
 * 
 * Authenticates Socket.IO connections using JWT tokens
 */

import { Socket } from 'socket.io';
import { getSupabaseClient } from '../../config/supabase';
import { TypedSocket, SocketData } from '../../types/socket';
import { logDebug, logError } from '../../utils/logger';

/**
 * Authenticate Socket.IO connection
 */
export async function authenticateSocket(
  socket: TypedSocket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required. Please provide a token.'));
    }

    // Verify token with Supabase
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logDebug('Socket authentication failed', { error: error?.message });
      return next(new Error('Invalid or expired token.'));
    }

    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.userRole = user.user_metadata?.role || 'patient';
    socket.data.rooms = [];

    logDebug('Socket authenticated', { userId: user.id, role: socket.data.userRole });
    next();
  } catch (error) {
    logError('Socket authentication error', error);
    next(new Error('Authentication failed.'));
  }
}

