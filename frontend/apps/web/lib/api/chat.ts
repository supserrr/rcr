/**
 * Chat API service
 * 
 * Handles all chat-related API calls
 */

import { api } from './client';

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
   * Create a new chat
   */
  static async createChat(data: CreateChatInput): Promise<Chat> {
    return api.post<Chat>('/chat', data);
  }

  /**
   * Get a chat by ID
   */
  static async getChat(chatId: string): Promise<Chat> {
    return api.get<Chat>(`/chat/${chatId}`);
  }

  /**
   * List chats
   */
  static async listChats(params?: ChatQueryParams): Promise<ListChatsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/chat?${queryString}` : '/chat';
    
    return api.get<ListChatsResponse>(endpoint);
  }

  /**
   * Send a message
   */
  static async sendMessage(data: SendMessageInput): Promise<Message> {
    return api.post<Message>(`/chat/${data.chatId}/messages`, { content: data.content, type: data.type, fileUrl: data.fileUrl });
  }

  /**
   * Get messages for a chat
   */
  static async getMessages(
    chatId: string,
    params?: MessagesQueryParams
  ): Promise<ListMessagesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/chat/${chatId}/messages?${queryString}`
      : `/chat/${chatId}/messages`;
    
    return api.get<ListMessagesResponse>(endpoint);
  }

  /**
   * Mark messages as read
   */
  static async markMessagesRead(
    chatId: string,
    data: MarkReadInput
  ): Promise<void> {
    return api.post<void>(`/chat/${chatId}/messages/read`, data);
  }
}

