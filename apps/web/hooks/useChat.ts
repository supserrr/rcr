/**
 * React hook for managing chat
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChatApi, type Chat, type Message, type MessageType, type SendMessageInput, type CreateChatInput, type ChatQueryParams, type MessagesQueryParams, type MarkReadInput } from '@/lib/api/chat';
import { useChatMessages, type RealtimeMessage } from './useRealtime';
import { ApiError } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';

export interface UseChatReturn {
  chats: Chat[];
  messages: Message[];
  currentChat: Chat | null;
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  total: number;
  createChat: (data: CreateChatInput) => Promise<Chat>;
  sendMessage: (data: SendMessageInput) => Promise<Message>;
  loadMessages: (chatId: string, params?: MessagesQueryParams, forceReload?: boolean) => Promise<void>;
  selectChat: (chatId: string) => void;
  markMessagesRead: (chatId: string, data?: MarkReadInput) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<Message>;
  editMessage: (messageId: string, content: string) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
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
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [loadedChatIds, setLoadedChatIds] = useState<Set<string>>(new Set());

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

  // Get current user ID for unread tracking
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      }
    };
    if (isEnabled) {
      getCurrentUser();
    }
  }, [isEnabled]);

  // Use ref to track current chat ID to avoid stale closure issues
  const currentChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentChatIdRef.current = currentChat?.id || null;
  }, [currentChat?.id]);

  // Supabase Realtime integration for messages
  // Memoize the message handler to prevent unnecessary subscription recreations
  const handleRealtimeMessage = useCallback((message: RealtimeMessage) => {
      // Get current user to determine if message is from current user
      const isFromCurrentUser = currentUserId === message.sender_id;
      // Check if message is for the current chat using ref to avoid stale closure
      const isCurrentChat = currentChatIdRef.current === message.chat_id;
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[useChat] Realtime message received:', {
          messageId: message.id,
          chatId: message.chat_id,
          currentChatId: currentChatIdRef.current,
          isCurrentChat,
          isFromCurrentUser,
        });
      }
      
      // Add or update message if it's for the current chat
      if (isCurrentChat) {
          setMessages((prev) => {
            // Check if this is an update to an existing message (reaction, edit, delete)
            const existingIndex = prev.findIndex((m) => m.id === message.id);
            
            if (existingIndex !== -1) {
              // Update existing message
              const updated = [...prev];
              const existingMessage = updated[existingIndex];
              if (existingMessage) {
                updated[existingIndex] = {
                  ...existingMessage,
                  content: message.content,
                  reactions: message.reactions || existingMessage.reactions,
                  replyToId: message.reply_to_id || existingMessage.replyToId,
                  editedAt: message.edited_at || existingMessage.editedAt,
                  deletedAt: message.deleted_at || existingMessage.deletedAt,
                  isRead: message.is_read,
                };
                return deduplicateAndSortMessages(updated);
              }
            }
            
            // Transform Realtime message to Message type (new message)
            // If viewing current chat, mark as read immediately
            const transformedMessage: Message = {
              id: message.id,
              chatId: message.chat_id,
              senderId: message.sender_id,
              content: message.content,
              type: message.type as any,
              fileUrl: message.file_url,
              isRead: isFromCurrentUser ? true : true, // If viewing chat, mark as read
              createdAt: message.created_at,
              updatedAt: message.created_at,
              reactions: message.reactions,
              replyToId: message.reply_to_id,
              editedAt: message.edited_at,
              deletedAt: message.deleted_at,
            };
            
            // Check if this is replacing an optimistic message (same content and recent timestamp)
            const optimisticIndex = prev.findIndex(m => 
              m.id.startsWith('temp-') && 
              m.content === transformedMessage.content &&
              m.senderId === transformedMessage.senderId &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(transformedMessage.createdAt).getTime()) < 5000
            );
            
            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
              const updated = [...prev];
              updated[optimisticIndex] = transformedMessage;
              return deduplicateAndSortMessages(updated);
            }
            
            // Check if message already exists (avoid duplicates)
            const alreadyExists = prev.some(m => m.id === transformedMessage.id);
            if (alreadyExists) {
              return prev;
            }
            
            // Add message, deduplicate, and sort to maintain chronological order
            return deduplicateAndSortMessages([...prev, transformedMessage]);
          });
        
        // If viewing current chat and message is not from current user, mark as read
        if (!isFromCurrentUser) {
          // Mark message as read in the background
          ChatApi.markMessagesRead(message.chat_id, { messageIds: [message.id] }).catch(() => {
            // Silently fail - this is a background operation
          });
        }
      }
      
      // Update chats list to reflect new last message and unreadCount
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat.id === message.chat_id) {
            // Calculate new unreadCount:
            // - If message is from current user: set to 0 (no unread messages from them)
            // - If viewing current chat: set to 0 (messages are read)
            // - If message is from other user and not viewing chat: increment unreadCount
            let newUnreadCount: number;
            if (isFromCurrentUser) {
              // Last message is from current user, so no unread messages
              newUnreadCount = 0;
            } else if (isCurrentChat) {
              // Viewing the chat, so mark as read
              newUnreadCount = 0;
            } else {
              // Message from other user in a different chat, increment unreadCount
              newUnreadCount = (chat.unreadCount || 0) + 1;
        }
            
            return {
              ...chat,
              lastMessage: {
                id: message.id,
                chatId: message.chat_id,
                senderId: message.sender_id,
                content: message.content,
                type: (message.type as MessageType) || 'text',
                fileUrl: message.file_url,
                isRead: message.is_read,
                createdAt: message.created_at,
                updatedAt: message.created_at,
                reactions: message.reactions,
                replyToId: message.reply_to_id,
                editedAt: message.edited_at,
                deletedAt: message.deleted_at,
              },
              updatedAt: message.created_at,
              unreadCount: newUnreadCount,
            };
          }
          return chat;
        });
      });
    },
    [currentUserId, currentChat?.id, deduplicateAndSortMessages]
  );

  useChatMessages(
    isEnabled ? currentChat?.id || null : null,
    handleRealtimeMessage,
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

  const fetchChats = useCallback(async (showLoading = false) => {
    if (!isEnabled) {
      if (showLoading) {
      setLoading(false);
      }
      return;
    }

    if (showLoading) {
    setLoading(true);
    }
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
      if (showLoading) {
      setLoading(false);
      }
    }
  }, [params, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      fetchChats(true); // Show loading only on initial load
    } else {
      setLoading(false);
    }
  }, [fetchChats, isEnabled]);

  // Realtime subscription is handled by useChatMessages hook
  // No need to manually join/leave rooms

  const createChat = useCallback(async (data: CreateChatInput): Promise<Chat> => {
    try {
      const chat = await ChatApi.createChat(data);
      await fetchChats(false); // Refresh list without showing loading
      return chat;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create chat';
      throw new Error(errorMessage);
    }
  }, [fetchChats]);

  const sendMessage = useCallback(async (data: SendMessageInput): Promise<Message> => {
    try {
      // Add optimistic message immediately for instant feedback
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}-${Math.random()}`,
        chatId: data.chatId,
        senderId: currentUserId || '',
        content: data.content,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replyToId: data.replyToId,
      };

      // Add optimistic message to current chat if viewing it
      if (currentChat?.id === data.chatId) {
        setMessages((prev) => {
          // Check if message already exists (from realtime)
          const exists = prev.some(m => m.id === optimisticMessage.id || 
            (m.content === optimisticMessage.content && 
             Math.abs(new Date(m.createdAt).getTime() - new Date(optimisticMessage.createdAt).getTime()) < 1000));
          if (exists) return prev;
          return deduplicateAndSortMessages([...prev, optimisticMessage]);
        });
      }

      const message = await ChatApi.sendMessage(data);
      
      // Replace optimistic message with real message when it arrives
      if (currentChat?.id === data.chatId) {
        setMessages((prev) => {
          // Remove optimistic message and add real one
          const filtered = prev.filter(m => m.id !== optimisticMessage.id);
          // Check if realtime already added it
          const alreadyExists = filtered.some(m => m.id === message.id);
          if (alreadyExists) return filtered;
          return deduplicateAndSortMessages([...filtered, message]);
        });
      }
      
      // Update chats list to reflect new last message (optimistic update)
      // When current user sends a message, set unreadCount to 0 since it's their own message
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: 0, // Current user's message, so no unread count
            };
          }
          return chat;
        });
      });
      
      return message;
    } catch (err) {
      // Remove optimistic message on error
      if (currentChat?.id === data.chatId) {
        setMessages((prev) => prev.filter(m => !m.id.startsWith('temp-') || m.content !== data.content));
      }
      
      console.error('[useChat.sendMessage] Error sending message:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        chatId: data.chatId,
        content: data.content,
      });
      const errorMessage = err instanceof Error ? err.message : err instanceof ApiError ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [currentChat?.id, currentUserId, deduplicateAndSortMessages]);

  // Use ref to track loaded chat IDs to avoid Set dependency issues
  const loadedChatIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    loadedChatIdsRef.current = loadedChatIds;
  }, [loadedChatIds]);

  const loadMessages = useCallback(async (chatId: string, messageParams?: MessagesQueryParams, forceReload = false) => {
    // Don't reload if messages are already loaded for this chat (unless forced)
    if (!forceReload && loadedChatIdsRef.current.has(chatId) && currentChat?.id === chatId) {
      return;
    }

    setMessagesLoading(true);
    setError(null);
    try {
      const response = await ChatApi.getMessages(chatId, messageParams);
      // If switching to a different chat, replace messages instead of merging
      if (currentChat?.id !== chatId) {
        setMessages(deduplicateAndSortMessages(response.messages));
      } else {
      // Merge with existing messages and deduplicate
      // This ensures we don't lose messages that came via realtime
      setMessages((prev) => {
        // Combine existing messages with newly loaded ones
        const allMessages = [...prev, ...response.messages];
        // Deduplicate and sort
        return deduplicateAndSortMessages(allMessages);
      });
      }
      setLoadedChatIds((prev) => new Set(prev).add(chatId));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [deduplicateAndSortMessages, currentChat?.id]);

  const markMessagesRead = useCallback(async (chatId: string, data?: MarkReadInput): Promise<void> => {
    try {
      await ChatApi.markMessagesRead(chatId, data || { messageIds: [] });
      
      // Update chat in local state to set unreadCount to 0
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              unreadCount: 0,
            };
          }
          return chat;
        });
      });
      
      // Update messages in local state to mark them as read
      setMessages((prev) => {
        return prev.map((message) => {
          if (message.chatId === chatId && !message.isRead) {
            return {
              ...message,
              isRead: true,
            };
          }
          return message;
        });
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
      // Don't throw - this is a background operation
    }
  }, []);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      // Clear messages when switching chats to avoid showing old messages
      if (currentChat?.id !== chatId) {
        setMessages([]);
      }
      setCurrentChat(chat);
      loadMessages(chatId);
      
      // Mark all messages as read when selecting a chat
      if (chat.unreadCount > 0) {
        markMessagesRead(chatId);
      }
    }
  }, [chats, loadMessages, currentChat?.id, markMessagesRead]);

  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    try {
      await ChatApi.deleteChat(chatId);
      
      // Remove chat from local state
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      
      // Clear messages if it was the current chat
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
      
      // Refresh chat list to ensure consistency (without showing loading)
      await fetchChats(false);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete chat';
      throw new Error(errorMessage);
    }
  }, [currentChat, fetchChats]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string): Promise<Message> => {
    try {
      const updatedMessage = await ChatApi.reactToMessage(messageId, emoji);
      
      // Update message in local state
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = updatedMessage;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      return updatedMessage;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to react to message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages]);

  const editMessage = useCallback(async (messageId: string, content: string): Promise<Message> => {
    try {
      const updatedMessage = await ChatApi.editMessage(messageId, content);
      
      // Update message in local state
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = updatedMessage;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      // Refresh chats to update last message if needed (without showing loading)
      await fetchChats(false);
      
      return updatedMessage;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to edit message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages, fetchChats]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await ChatApi.deleteMessage(messageId);
      
      // Update message in local state (soft delete - mark as deleted)
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          const message = updated[index];
          updated[index] = {
            ...message,
            deletedAt: new Date().toISOString(),
            content: 'This message was deleted',
          } as Message;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      // Refresh chats to update last message if needed (without showing loading)
      await fetchChats(false);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages, fetchChats]);

  return {
    chats,
    messages,
    currentChat,
    loading,
    messagesLoading,
    error,
    total,
    createChat,
    sendMessage,
    loadMessages,
    selectChat,
    markMessagesRead,
    deleteChat,
    reactToMessage,
    editMessage,
    deleteMessage,
    refreshChats: fetchChats,
    realtimeConnected,
  };
}

