/**
 * Socket.IO type definitions
 * 
 * Types for Socket.IO server events and data
 */

import { Server, Socket } from 'socket.io';

export interface ServerToClientEvents {
  message: (data: { message: string; sender: string; timestamp: Date }) => void;
  newMessage: (data: { id: string; chatId: string; senderId: string; receiverId: string; content: string; type: string; fileUrl?: string; isRead: boolean; timestamp: string; createdAt: string }) => void;
  notification: (data: { type: string; message: string; data?: unknown }) => void;
  sessionUpdate: (data: { sessionId: string; status: string }) => void;
  userJoined: (data: { userId: string; username: string }) => void;
  userLeft: (data: { userId: string }) => void;
  userJoinedChat: (data: { userId: string; chatId: string }) => void;
  userLeftChat: (data: { userId: string; chatId: string }) => void;
  typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void;
  messagesRead: (data: { userId: string; chatId: string; messageIds: string[] }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string, callback?: (response: { success: boolean }) => void) => void;
  leaveRoom: (roomId: string, callback?: (response: { success: boolean }) => void) => void;
  joinChat: (chatId: string, callback?: (response: { success: boolean; error?: string }) => void) => void;
  leaveChat: (chatId: string, callback?: (response: { success: boolean }) => void) => void;
  sendMessage: (data: { chatId: string; content: string; type?: string; fileUrl?: string }, callback?: (response: { success: boolean; message?: unknown; error?: string }) => void) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;
  markMessagesRead: (data: { chatId: string; messageIds?: string[] }, callback?: (response: { success: boolean; error?: string }) => void) => void;
  acknowledgeNotification: (notificationId: string) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userRole?: string;
  rooms?: string[];
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

