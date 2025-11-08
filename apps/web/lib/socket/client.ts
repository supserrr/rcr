/**
 * Socket.IO client for real-time features
 * 
 * Handles real-time communication for chat and notifications
 */

import { io, Socket } from 'socket.io-client';

/**
 * Socket events
 */
export interface ServerToClientEvents {
  // Chat events
  newMessage: (data: {
    id: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: string;
    fileUrl?: string;
    isRead: boolean;
    timestamp: string;
    createdAt: string;
  }) => void;
  userJoinedChat: (data: { userId: string; chatId: string }) => void;
  userLeftChat: (data: { userId: string; chatId: string }) => void;
  messagesRead: (data: { userId: string; chatId: string; messageIds: string[] }) => void;
  typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void;

  // Notification events
  notification: (data: { type: string; message: string; data?: unknown }) => void;

  // Session events
  sessionUpdate: (data: { sessionId: string; status: string }) => void;

  // Connection events
  connect: () => void;
  disconnect: () => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  // Chat events
  joinChat: (chatId: string, callback?: (response: { success: boolean; error?: string }) => void) => void;
  leaveChat: (chatId: string, callback?: (response: { success: boolean }) => void) => void;
  markMessagesRead: (data: { chatId: string; messageIds?: string[] }, callback?: (response: { success: boolean; error?: string }) => void) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;

  // Session events
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;

  // Notification events
  acknowledgeNotification: (notificationId: string) => void;

  // Room events
  joinRoom: (roomId: string, callback?: (response: { success: boolean }) => void) => void;
  leaveRoom: (roomId: string, callback?: (response: { success: boolean }) => void) => void;
}

/**
 * Socket.IO client instance
 */
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Get Socket.IO server URL
 * 
 * Note: This application uses Supabase for all backend operations.
 * Socket.IO is only used if a separate backend server is configured.
 * If no URL is set, returns empty string to prevent connection attempts.
 */
function getSocketUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  // In production, don't default to localhost - use Supabase Realtime instead
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!socketUrl && process.env.NODE_ENV === 'production') {
    // In production, if no socket URL is configured, return empty to prevent connection
    console.warn('Socket.IO URL is not configured. This application uses Supabase Realtime for real-time features.');
    return '';
  }
  // Development fallback
  return socketUrl || 'http://localhost:10000';
}

/**
 * Initialize Socket.IO client
 * 
 * Note: This application uses Supabase for all backend operations.
 * Socket.IO is only used if a separate backend server is configured.
 * If no URL is configured, this will not attempt to connect.
 */
export function initSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket?.connected) {
    return socket;
  }

  const url = getSocketUrl();
  
  // If no URL is configured, don't attempt to connect
  if (!url) {
    console.warn('Socket.IO URL is not configured. Use Supabase Realtime for real-time features.');
    // Return a mock socket that won't connect
    return null as unknown as Socket<ServerToClientEvents, ClientToServerEvents>;
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Handle connection
  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket?.id);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  // Connect to server
  socket.connect();

  return socket;
}

/**
 * Get Socket.IO client instance
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Disconnect Socket.IO client
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Reconnect Socket.IO client with new token
 */
export function reconnectSocket(token: string): void {
  disconnectSocket();
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }
  
  initSocket();
}

/**
 * Join a chat room
 */
export function joinChat(chatId: string): void {
  const client = getSocket();
  if (client?.connected) {
    client.emit('joinChat', chatId);
  }
}

/**
 * Leave a chat room
 */
export function leaveChat(chatId: string): void {
  const client = getSocket();
  if (client?.connected) {
    client.emit('leaveChat', chatId);
  }
}

/**
 * Mark messages as read (via Socket.IO)
 */
export function markMessagesRead(chatId: string, messageIds: string[]): void {
  const client = getSocket();
  if (client?.connected) {
    client.emit('markMessagesRead', { chatId, messageIds });
  }
}

/**
 * Socket.IO client utilities
 */
export const socketClient = {
  init: initSocket,
  get: getSocket,
  disconnect: disconnectSocket,
  reconnect: reconnectSocket,
  joinChat,
  leaveChat,
  markMessagesRead,
};

export default socketClient;

