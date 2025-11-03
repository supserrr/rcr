/**
 * Chat service layer
 * 
 * Handles all chat-related business logic using Supabase
 */

import { getSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import type {
  SendMessageInput,
  CreateChatInput,
  ChatQueryParams,
  MessagesQueryParams,
  MarkReadInput,
} from '../schemas/chat.schema';

/**
 * Message type
 */
export type MessageType = 'text' | 'image' | 'file';

/**
 * Message data returned from operations
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
}

/**
 * Chat data returned from operations
 */
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new chat
 */
export async function createChat(input: CreateChatInput, userId: string): Promise<Chat> {
  try {
    const supabase = getSupabaseClient();
    const { participantId } = input;

    // Check if chat already exists between these users
    // Supabase array contains: use filter with overlap operator
    const { data: existingChats } = await supabase
      .from('chats')
      .select('*')
      .filter('participants', 'cs', `{${userId},${participantId}}`)
      .limit(1);

    if (existingChats && existingChats.length > 0) {
      // Return existing chat
      const chat = existingChats[0];
      return {
        id: chat.id,
        participants: chat.participants || [userId, participantId],
        unreadCount: 0,
        createdAt: chat.created_at || new Date().toISOString(),
        updatedAt: chat.updated_at || new Date().toISOString(),
      };
    }

    // Create new chat
    const chatData = {
      participants: [userId, participantId],
    };

    const { data: chat, error } = await supabase
      .from('chats')
      .insert(chatData)
      .select()
      .single();

    if (error) {
      logError('Create chat error', error);
      throw new AppError('Failed to create chat', 500);
    }

    const result: Chat = {
      id: chat.id,
      participants: chat.participants || [userId, participantId],
      unreadCount: 0,
      createdAt: chat.created_at || new Date().toISOString(),
      updatedAt: chat.updated_at || new Date().toISOString(),
    };

    logInfo('Chat created successfully', { chatId: result.id, userId, participantId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Create chat service error', error);
    throw new AppError('Failed to create chat', 500);
  }
}

/**
 * Get chat by ID
 */
export async function getChatById(chatId: string, userId: string): Promise<Chat> {
  try {
    const supabase = getSupabaseClient();

    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error || !chat) {
      logError('Get chat error', error);
      throw new AppError('Chat not found', 404);
    }

    // Check if user is a participant
    if (!chat.participants?.includes(userId)) {
      throw new AppError('Access denied to this chat', 403);
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    // Get last message
    const { data: lastMessageData } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let lastMessage: Message | undefined;
    if (lastMessageData) {
      lastMessage = {
        id: lastMessageData.id,
        chatId: lastMessageData.chat_id,
        senderId: lastMessageData.sender_id,
        receiverId: lastMessageData.receiver_id,
        content: lastMessageData.content,
        type: lastMessageData.type,
        fileUrl: lastMessageData.file_url || undefined,
        isRead: lastMessageData.is_read || false,
        timestamp: lastMessageData.created_at || new Date().toISOString(),
        createdAt: lastMessageData.created_at || new Date().toISOString(),
      };
    }

    const result: Chat = {
      id: chat.id,
      participants: chat.participants || [],
      lastMessage,
      unreadCount: unreadCount || 0,
      createdAt: chat.created_at || new Date().toISOString(),
      updatedAt: chat.updated_at || new Date().toISOString(),
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get chat service error', error);
    throw new AppError('Failed to get chat', 500);
  }
}

/**
 * List chats for a user
 */
export async function listChats(userId: string, query: ChatQueryParams): Promise<{ chats: Chat[]; total: number }> {
  try {
    const supabase = getSupabaseClient();

    // Supabase array contains: use filter with contains operator
    let queryBuilder = supabase
      .from('chats')
      .select('*', { count: 'exact' })
      .filter('participants', 'cs', `{${userId}}`);

    // Filter by participant if provided
    if (query.participantId) {
      queryBuilder = queryBuilder.filter('participants', 'cs', `{${query.participantId}}`);
    }

    // Apply pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Order by updated_at descending
    queryBuilder = queryBuilder.order('updated_at', { ascending: false });

    const { data: chats, error, count } = await queryBuilder;

    if (error) {
      logError('List chats error', error);
      throw new AppError('Failed to list chats', 500);
    }

    // Enrich chats with last message and unread count
    const enrichedChats: Chat[] = await Promise.all(
      (chats || []).map(async (chat) => {
        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        // Get last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let lastMessage: Message | undefined;
        if (lastMessageData) {
          lastMessage = {
            id: lastMessageData.id,
            chatId: lastMessageData.chat_id,
            senderId: lastMessageData.sender_id,
            receiverId: lastMessageData.receiver_id,
            content: lastMessageData.content,
            type: lastMessageData.type,
            fileUrl: lastMessageData.file_url || undefined,
            isRead: lastMessageData.is_read || false,
            timestamp: lastMessageData.created_at || new Date().toISOString(),
            createdAt: lastMessageData.created_at || new Date().toISOString(),
          };
        }

        return {
          id: chat.id,
          participants: chat.participants || [],
          lastMessage,
          unreadCount: unreadCount || 0,
          createdAt: chat.created_at || new Date().toISOString(),
          updatedAt: chat.updated_at || new Date().toISOString(),
        };
      })
    );

    return {
      chats: enrichedChats,
      total: count || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('List chats service error', error);
    throw new AppError('Failed to list chats', 500);
  }
}

/**
 * Send a message
 */
export async function sendMessage(input: SendMessageInput, userId: string): Promise<Message> {
  try {
    const supabase = getSupabaseClient();
    const { chatId, content, type, fileUrl } = input;

    // Verify chat exists and user is a participant
    const chat = await getChatById(chatId, userId);

    // Get the other participant (receiver)
    const receiverId = chat.participants.find((id) => id !== userId);
    if (!receiverId) {
      throw new AppError('Invalid chat participants', 400);
    }

    // Create message
    const messageData = {
      chat_id: chatId,
      sender_id: userId,
      receiver_id: receiverId,
      content,
      type: type || 'text',
      file_url: fileUrl || null,
      is_read: false,
    };

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      logError('Send message error', error);
      throw new AppError('Failed to send message', 500);
    }

    // Update chat's updated_at timestamp
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

    const result: Message = {
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      type: message.type,
      fileUrl: message.file_url || undefined,
      isRead: message.is_read || false,
      timestamp: message.created_at || new Date().toISOString(),
      createdAt: message.created_at || new Date().toISOString(),
    };

    logInfo('Message sent successfully', { messageId: result.id, chatId, userId, receiverId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Send message service error', error);
    throw new AppError('Failed to send message', 500);
  }
}

/**
 * Get messages for a chat
 */
export async function getMessages(
  chatId: string,
  userId: string,
  query: MessagesQueryParams
): Promise<{ messages: Message[]; total: number }> {
  try {
    // Verify chat exists and user is a participant
    await getChatById(chatId, userId);

    const supabase = getSupabaseClient();

    let queryBuilder = supabase.from('messages').select('*', { count: 'exact' }).eq('chat_id', chatId);

    // Apply pagination filters
    if (query.before) {
      // Get messages before a specific message
      queryBuilder = queryBuilder.lt('created_at', query.before);
    }

    if (query.after) {
      // Get messages after a specific message
      queryBuilder = queryBuilder.gt('created_at', query.after);
    }

    // Order by created_at descending (newest first)
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    // Apply limit
    const limit = query.limit || 50;
    queryBuilder = queryBuilder.limit(limit);

    const { data: messages, error, count } = await queryBuilder;

    if (error) {
      logError('Get messages error', error);
      throw new AppError('Failed to get messages', 500);
    }

    const mappedMessages: Message[] = (messages || [])
      .map((message) => ({
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        type: message.type,
        fileUrl: message.file_url || undefined,
        isRead: message.is_read || false,
        timestamp: message.created_at || new Date().toISOString(),
        createdAt: message.created_at || new Date().toISOString(),
      }))
      .reverse(); // Reverse to show oldest first

    return {
      messages: mappedMessages,
      total: count || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get messages service error', error);
    throw new AppError('Failed to get messages', 500);
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(input: MarkReadInput, userId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { messageIds } = input;

    // Verify all messages belong to the user
    const { data: messages } = await supabase
      .from('messages')
      .select('id, receiver_id')
      .in('id', messageIds);

    if (!messages || messages.length !== messageIds.length) {
      throw new AppError('Some messages not found', 404);
    }

    // Check if all messages belong to the user
    const invalidMessages = messages.filter((msg) => msg.receiver_id !== userId);
    if (invalidMessages.length > 0) {
      throw new AppError('You can only mark your own messages as read', 403);
    }

    // Mark messages as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) {
      logError('Mark messages as read error', error);
      throw new AppError('Failed to mark messages as read', 500);
    }

    logInfo('Messages marked as read', { messageIds, userId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Mark messages as read service error', error);
    throw new AppError('Failed to mark messages as read', 500);
  }
}

