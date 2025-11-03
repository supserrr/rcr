/**
 * Chat Socket.IO handlers
 * 
 * Handles real-time chat events
 */

import { Server } from 'socket.io';
import { TypedSocket } from '../../types/socket';
import { logDebug, logError, logInfo } from '../../utils/logger';
import * as chatService from '../../services/chat.service';

/**
 * Register chat event handlers
 */
export function registerHandlers(socket: TypedSocket, io: Server): void {
  const userId = socket.data.userId;

  /**
   * Join a chat room
   */
  socket.on('joinChat', async (chatId: string, callback) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verify user has access to this chat
      await chatService.getChatById(chatId, userId);

      // Join the chat room (room name format: chat:{chatId})
      const roomName = `chat:${chatId}`;
      socket.join(roomName);
      socket.data.rooms = socket.data.rooms || [];
      if (!socket.data.rooms.includes(roomName)) {
        socket.data.rooms.push(roomName);
      }

      logInfo('User joined chat room', { userId, chatId, roomName });

      if (callback) {
        callback({ success: true });
      }

      // Notify other participants in the chat
      if (userId) {
        socket.to(roomName).emit('userJoinedChat', { userId, chatId });
      }
    } catch (error) {
      logError('Error joining chat', { userId, chatId, error });
      if (callback) {
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });

  /**
   * Leave a chat room
   */
  socket.on('leaveChat', (chatId: string, callback) => {
    try {
      const roomName = `chat:${chatId}`;
      socket.leave(roomName);
      socket.data.rooms = socket.data.rooms?.filter((r) => r !== roomName) || [];

      logDebug('User left chat room', { userId, chatId, roomName });

      if (callback) {
        callback({ success: true });
      }

      // Notify other participants
      if (userId) {
        socket.to(roomName).emit('userLeftChat', { userId, chatId });
      }
    } catch (error) {
      logError('Error leaving chat', { userId, chatId, error });
      if (callback) {
        callback({ success: false });
      }
    }
  });

  /**
   * Send a message to a chat
   */
  socket.on('sendMessage', async (data: { chatId: string; content: string; type?: string; fileUrl?: string }, callback) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { chatId, content, type, fileUrl } = data;

      if (!chatId || !content) {
        throw new Error('Chat ID and content are required');
      }

      // Send message using service
      const message = await chatService.sendMessage(
        {
          chatId,
          content,
          type: (type as 'text' | 'image' | 'file') || 'text',
          fileUrl,
        },
        userId
      );

      // Emit message to all participants in the chat room
      const roomName = `chat:${chatId}`;
      io.to(roomName).emit('newMessage', message);

      logInfo('Message sent via socket', { userId, chatId, messageId: message.id });

      if (callback) {
        callback({ success: true, message });
      }
    } catch (error) {
      logError('Error sending message via socket', { userId, error });
      if (callback) {
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });

  /**
   * Typing indicator
   */
  socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
    try {
      const { chatId, isTyping } = data;
      const roomName = `chat:${chatId}`;
      if (userId) {
        socket.to(roomName).emit('typing', {
          userId,
          chatId,
          isTyping,
        });
      }
    } catch (error) {
      logError('Error handling typing indicator', { userId, error });
    }
  });

  /**
   * Mark messages as read
   */
  socket.on('markMessagesRead', async (data: { chatId: string; messageIds?: string[] }, callback) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { chatId, messageIds } = data;

      if (!messageIds || messageIds.length === 0) {
        throw new Error('Message IDs are required');
      }

      await chatService.markMessagesAsRead({ messageIds }, userId);

      // Notify other participants that messages were read
      const roomName = `chat:${chatId}`;
      socket.to(roomName).emit('messagesRead', { userId, chatId, messageIds });

      logDebug('Messages marked as read via socket', { userId, chatId, messageIds });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      logError('Error marking messages as read', { userId, error });
      if (callback) {
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });
}

