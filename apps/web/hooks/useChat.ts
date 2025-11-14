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

interface UseChatOptions {
  enabled?: boolean;
}

export function useChat(
  params?: ChatQueryParams,
  options?: UseChatOptions
): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const isEnabled = options?.enabled ?? true;
  const [loading, setLoading] = useState(isEnabled);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Helper function to deduplicate and sort messages by createdAt (ascending - oldest first)
  const deduplicateAndSortMessages = useCallback((msgs: Message[]): Message[] => {
    // Use Map to deduplicate by ID (keeps last occurrence, but we'll sort anyway)
    const messageMap = new Map<string, Message>();
    for (const msg of msgs) {
      messageMap.set(msg.id, msg);
    }
    // Convert back to array and sort
    return Array.from(messageMap.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });
  }, []);

  // Supabase Realtime integration for messages
  useChatMessages(
    isEnabled ? currentChat?.id || null : null,
    (message) => {
        // Add new message if it's for the current chat
      if (currentChat && message.chat_id === currentChat.id) {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
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
          // Add message, deduplicate, and sort to maintain chronological order
          return deduplicateAndSortMessages([...prev, transformedMessage]);
        });
        // Refresh chats to update last message
        if (isEnabled) {
        fetchChats();
        }
      }
    },
    (error) => {
      console.error('Realtime subscription error:', error);
      setRealtimeConnected(false);
    }
  );

  // Set connected state (Realtime is connected when subscribed)
  useEffect(() => {
    if (isEnabled && currentChat) {
      setRealtimeConnected(true);
    } else {
      setRealtimeConnected(false);
    }
  }, [currentChat, isEnabled]);

  const fetchChats = useCallback(async () => {
    if (!isEnabled) {
      setLoading(false);
      return;
    }

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
  }, [params, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
    fetchChats();
    } else {
      setLoading(false);
    }
  }, [fetchChats, isEnabled]);

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
      
      // Don't add message here - let realtime subscription handle it
      // This prevents duplicates from race conditions between sendMessage and realtime
      // Realtime will add it almost instantly anyway
      
      // Refresh chats to update last message
      await fetchChats();
      
      return message;
    } catch (err) {
      console.error('[useChat.sendMessage] Error sending message:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        chatId: data.chatId,
        content: data.content,
      });
      const errorMessage = err instanceof Error ? err.message : err instanceof ApiError ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [fetchChats]);

  const loadMessages = useCallback(async (chatId: string, messageParams?: MessagesQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.getMessages(chatId, messageParams);
      // Merge with existing messages and deduplicate
      // This ensures we don't lose messages that came via realtime
      setMessages((prev) => {
        // Combine existing messages with newly loaded ones
        const allMessages = [...prev, ...response.messages];
        // Deduplicate and sort
        return deduplicateAndSortMessages(allMessages);
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [deduplicateAndSortMessages]);

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

