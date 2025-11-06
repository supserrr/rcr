/**
 * React hook for managing chat
 */

import { useState, useEffect, useCallback } from 'react';
import { ChatApi, type Chat, type Message, type SendMessageInput, type CreateChatInput, type ChatQueryParams, type MessagesQueryParams } from '@/lib/api/chat';
import { useChatMessages } from './useRealtime';
import { ApiError } from '@/lib/api/client';

export interface UseChatReturn {
  chats: Chat[];
  messages: Message[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  total: number;
  createChat: (data: CreateChatInput) => Promise<Chat>;
  sendMessage: (data: SendMessageInput) => Promise<Message>;
  loadMessages: (chatId: string, params?: MessagesQueryParams) => Promise<void>;
  selectChat: (chatId: string) => void;
  refreshChats: () => Promise<void>;
  realtimeConnected: boolean;
}

export function useChat(params?: ChatQueryParams): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Supabase Realtime integration for messages
  useChatMessages(
    currentChat?.id || null,
    (message) => {
        // Add new message if it's for the current chat
      if (currentChat && message.chat_id === currentChat.id) {
          setMessages((prev) => {
            // Check if message already exists
          if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
          // Transform Realtime message to Message type
          const transformedMessage: Message = {
            id: message.id,
            chatId: message.chat_id,
            senderId: message.sender_id,
            content: message.content,
            type: message.type as any,
            fileUrl: message.file_url,
            isRead: message.is_read,
            createdAt: message.created_at,
            updatedAt: message.created_at,
          };
          return [...prev, transformedMessage];
        });
        // Refresh chats to update last message
        fetchChats();
      }
    },
    (error) => {
      console.error('Realtime subscription error:', error);
      setRealtimeConnected(false);
    }
  );

  // Set connected state (Realtime is connected when subscribed)
  useEffect(() => {
    if (currentChat) {
      setRealtimeConnected(true);
    } else {
      setRealtimeConnected(false);
    }
  }, [currentChat]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.listChats(params);
      setChats(response.chats);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load chats';
      setError(errorMessage);
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Realtime subscription is handled by useChatMessages hook
  // No need to manually join/leave rooms

  const createChat = useCallback(async (data: CreateChatInput): Promise<Chat> => {
    try {
      const chat = await ChatApi.createChat(data);
      await fetchChats(); // Refresh list
      return chat;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create chat';
      throw new Error(errorMessage);
    }
  }, [fetchChats]);

  const sendMessage = useCallback(async (data: SendMessageInput): Promise<Message> => {
    try {
      const message = await ChatApi.sendMessage(data);
      
      // Add message to local state immediately for instant feedback
      if (currentChat && data.chatId === currentChat.id) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Refresh chats to update last message
      await fetchChats();
      
      return message;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [currentChat, fetchChats]);

  const loadMessages = useCallback(async (chatId: string, messageParams?: MessagesQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.getMessages(chatId, messageParams);
      setMessages(response.messages);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      loadMessages(chatId);
    }
  }, [chats, loadMessages]);

  return {
    chats,
    messages,
    currentChat,
    loading,
    error,
    total,
    createChat,
    sendMessage,
    loadMessages,
    selectChat,
    refreshChats: fetchChats,
    realtimeConnected,
  };
}

