/**
 * Chat API service
 * 
 * Handles all chat-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Message type
 */
export type MessageType = 'text' | 'image' | 'file';

/**
 * Message interface
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat interface
 */
export interface Chat {
  id: string;
  participants: string[];
  participantNames?: Record<string, string>;
  participantAvatars?: Record<string, string>;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Send message input
 */
export interface SendMessageInput {
  chatId: string;
  content: string;
  type?: MessageType;
  fileUrl?: string;
}

/**
 * Create chat input
 */
export interface CreateChatInput {
  participantId: string;
}

/**
 * Chat query parameters
 */
export interface ChatQueryParams {
  participantId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Messages query parameters
 */
export interface MessagesQueryParams {
  limit?: number;
  before?: string;
  after?: string;
}

/**
 * List chats response
 */
export interface ListChatsResponse {
  chats: Chat[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatSummary {
  totalChats: number;
  unreadChats: number;
  unreadMessages: number;
  lastMessageAt?: string;
}

/**
 * List messages response
 */
export interface ListMessagesResponse {
  messages: Message[];
  total: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Mark messages as read input
 */
export interface MarkReadInput {
  messageIds: string[];
}

/**
 * Chat API service
 */
export class ChatApi {
  /**
   * Create a new chat using Supabase
   */
  static async createChat(data: CreateChatInput): Promise<Chat> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if chat already exists
    const { data: existingChat } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [user.id, data.participantId])
      .single();

    if (existingChat) {
      if (existingChat.unread_count === null || existingChat.unread_count === undefined) {
        await supabase
          .from('chats')
          .update({ unread_count: 0 })
          .eq('id', existingChat.id);
        existingChat.unread_count = 0;
      }
      return this.mapChatFromDb(existingChat, user.id);
    }

    // Create new chat
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        participants: [user.id, data.participantId],
        unread_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create chat');
    }

    return this.mapChatFromDb(chat, user.id);
  }

  /**
   * Get chat summary for the current user
   */
  static async getChatSummary(): Promise<ChatSummary> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: chats, error } = await supabase
      .from('chats')
      .select('unread_count, updated_at, participants')
      .contains('participants', [user.id]);

    if (error) {
      throw new Error(error.message || 'Failed to load chat summary');
    }

    const stats = (chats || []).reduce(
      (acc, chat) => {
        const unread = Number(chat.unread_count ?? 0);
        acc.totalChats += 1;
        if (unread > 0) {
          acc.unreadChats += 1;
          acc.unreadMessages += unread;
        }
        const updatedAt = chat.updated_at ? new Date(chat.updated_at as string) : null;
        if (updatedAt && (!acc.lastMessageAt || updatedAt > acc.lastMessageAt)) {
          acc.lastMessageAt = updatedAt;
        }
        return acc;
      },
      {
        totalChats: 0,
        unreadChats: 0,
        unreadMessages: 0,
        lastMessageAt: null as Date | null,
      }
    );

    return {
      totalChats: stats.totalChats,
      unreadChats: stats.unreadChats,
      unreadMessages: stats.unreadMessages,
      lastMessageAt: stats.lastMessageAt ? stats.lastMessageAt.toISOString() : undefined,
    };
  }

  /**
   * Get a chat by ID using Supabase
   */
  static async getChat(chatId: string): Promise<Chat> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to get chat');
    }

    return this.mapChatFromDb(chat, user.id);
  }

  /**
   * List chats using Supabase
   */
  static async listChats(params?: ChatQueryParams): Promise<ListChatsResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Select specific columns to avoid triggering RLS recursion on related tables
    let query = supabase
      .from('chats')
      .select('id,participants,participant_names,participant_avatars,last_message,unread_count,created_at,updated_at', { count: 'exact' });

    // Filter chats where user is a participant
    query = query.contains('participants', [user.id]);

    if (params?.participantId) {
      query = query.contains('participants', [params.participantId]);
        }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('updated_at', { ascending: false });

    const { data: chats, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list chats');
    }

    return {
      chats: (chats || []).map(c => this.mapChatFromDb(c, user.id)),
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Send a message using Supabase
   */
  static async sendMessage(data: SendMessageInput): Promise<Message> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: data.chatId,
        sender_id: user.id,
        content: data.content,
        type: data.type || 'text',
        file_url: data.fileUrl,
        is_read: false,
      })
      .select()
      .single();

    if (error || !message) {
      throw new Error(error?.message || 'Failed to send message');
    }

    const { data: chatRecord, error: chatFetchError } = await supabase
      .from('chats')
      .select('participants, unread_count')
      .eq('id', data.chatId)
      .single();

    if (chatFetchError || !chatRecord) {
      throw new Error(chatFetchError?.message || 'Failed to update chat metadata');
    }

    const currentUnread = Number(chatRecord.unread_count ?? 0);
    const participantCount = Array.isArray(chatRecord.participants) ? chatRecord.participants.length : 0;
    const recipients = Array.isArray(chatRecord.participants)
      ? chatRecord.participants.filter((participantId: string) => participantId !== user.id)
      : [];
    const unreadIncrement = recipients.length > 0 ? 1 : 0;
    const updatedUnreadCount = participantCount <= 1 ? 0 : currentUnread + unreadIncrement;

    const lastMessagePayload = {
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name ?? user.user_metadata?.full_name ?? user.email ?? '',
      sender_avatar: message.sender_avatar ?? user.user_metadata?.avatar_url ?? null,
      content: message.content,
      type: message.type,
      file_url: message.file_url,
      is_read: message.is_read,
      created_at: message.created_at,
      updated_at: message.updated_at,
    };

    await supabase
      .from('chats')
      .update({
        updated_at: new Date().toISOString(),
        last_message: lastMessagePayload,
        unread_count: updatedUnreadCount,
      })
      .eq('id', data.chatId);

    return this.mapMessageFromDb(message);
  }

  /**
   * Get messages for a chat using Supabase
   */
  static async getMessages(
    chatId: string,
    params?: MessagesQueryParams
  ): Promise<ListMessagesResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let query = supabase.from('messages').select('*', { count: 'exact' });

    query = query.eq('chat_id', chatId);

    if (params?.before) {
      query = query.lt('created_at', params.before);
        }
    if (params?.after) {
      query = query.gt('created_at', params.after);
    }

    const limit = params?.limit || 50;
    query = query.limit(limit);
    query = query.order('created_at', { ascending: false });

    const { data: messages, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to get messages');
    }

    return {
      messages: (messages || []).map(m => this.mapMessageFromDb(m)),
      total: count || 0,
      limit,
      hasMore: (count || 0) > limit,
    };
  }

  /**
   * Mark messages as read using Supabase
   */
  static async markMessagesRead(
    chatId: string,
    data: MarkReadInput
  ): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    if (data.messageIds && data.messageIds.length > 0) {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', data.messageIds)
        .eq('chat_id', chatId);

      if (error) {
        throw new Error(error.message || 'Failed to mark messages as read');
      }
    } else {
      // Mark all messages in chat as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('is_read', false);

      if (error) {
        throw new Error(error.message || 'Failed to mark messages as read');
      }
    }

    const { error: chatUpdateError } = await supabase
      .from('chats')
      .update({
        unread_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId);

    if (chatUpdateError) {
      throw new Error(chatUpdateError.message || 'Failed to update chat read status');
    }
  }

  /**
   * Map database chat to API chat format
   */
  private static mapChatFromDb(dbChat: Record<string, unknown>, currentUserId?: string): Chat {
    const lastMessagePayload = dbChat.last_message as Record<string, unknown> | undefined;
    const lastMessage = lastMessagePayload ? this.mapMessageFromDb(lastMessagePayload) : undefined;
    const unreadCountValue =
      typeof dbChat.unread_count === 'number'
        ? (dbChat.unread_count as number)
        : Number(dbChat.unread_count ?? 0);

    return {
      id: dbChat.id as string,
      participants: (dbChat.participants as string[]) || [],
      participantNames: dbChat.participant_names as Record<string, string> | undefined,
      participantAvatars: dbChat.participant_avatars as Record<string, string> | undefined,
      lastMessage,
      unreadCount: unreadCountValue || 0,
      createdAt: dbChat.created_at as string,
      updatedAt: dbChat.updated_at as string,
    };
  }

  /**
   * Map database message to API message format
   */
  private static mapMessageFromDb(dbMessage: Record<string, unknown>): Message {
    const chatId =
      (dbMessage.chat_id as string) ??
      (dbMessage.chatId as string) ??
      '';
    const createdAt =
      (dbMessage.created_at as string) ??
      (dbMessage.createdAt as string) ??
      new Date().toISOString();
    const updatedAt =
      (dbMessage.updated_at as string) ??
      (dbMessage.updatedAt as string) ??
      createdAt;

    return {
      id: dbMessage.id as string,
      chatId,
      senderId: dbMessage.sender_id as string,
      senderName: dbMessage.sender_name as string | undefined,
      senderAvatar: dbMessage.sender_avatar as string | undefined,
      content: dbMessage.content as string,
      type: dbMessage.type as MessageType,
      fileUrl: dbMessage.file_url as string | undefined,
      isRead: dbMessage.is_read as boolean,
      createdAt,
      updatedAt,
    };
  }
}

