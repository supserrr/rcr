/**
 * Supabase Realtime client for real-time features
 * 
 * Handles real-time communication for chat, notifications, and sessions
 * using Supabase Realtime subscriptions
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

/**
 * Realtime event types
 */
export interface RealtimeMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface RealtimeNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  is_read: boolean;
  created_at: string;
}

export interface RealtimeSession {
  id: string;
  patient_id: string;
  counselor_id: string;
  status: string;
  date: string;
  time: string;
  updated_at: string;
}

export interface RealtimeProfile {
  id: string;
  role: string | null;
  full_name?: string | null;
  email?: string | null;
  availability?: string | null;
  avatar_url?: string | null;
  metadata?: Record<string, unknown> | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  specialty?: string | null;
  experience_years?: number | null;
  phone_number?: string | null;
}

/**
 * Realtime client instance
 */
let supabaseClient: SupabaseClient | null = null;
let channels: Map<string, RealtimeChannel> = new Map();

/**
 * Get Supabase client
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and anon key are required');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseClient;
}

/**
 * Subscribe to messages in a chat
 */
export function subscribeToMessages(
  chatId: string,
  onMessage: (message: RealtimeMessage) => void,
  onError?: (error: Error) => void
): () => void {
  const client = getSupabaseClient();
  const channelName = `messages:${chatId}`;

  // Remove existing channel if any
  if (channels.has(channelName)) {
    channels.get(channelName)?.unsubscribe();
    channels.delete(channelName);
  }

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        onMessage(payload.new as RealtimeMessage);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        onMessage(payload.new as RealtimeMessage);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to messages for chat ${chatId}`);
      } else if (status === 'CHANNEL_ERROR') {
        const error = new Error(`Failed to subscribe to messages for chat ${chatId}`);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });

  channels.set(channelName, channel);

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: RealtimeNotification) => void,
  onError?: (error: Error) => void
): () => void {
  const client = getSupabaseClient();
  const channelName = `notifications:${userId}`;

  // Remove existing channel if any
  if (channels.has(channelName)) {
    channels.get(channelName)?.unsubscribe();
    channels.delete(channelName);
  }

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as RealtimeNotification);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as RealtimeNotification);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to notifications for user ${userId}`);
      } else if (status === 'CHANNEL_ERROR') {
        const error = new Error(`Failed to subscribe to notifications for user ${userId}`);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });

  channels.set(channelName, channel);

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to session updates
 */
export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: RealtimeSession) => void,
  onError?: (error: Error) => void
): () => void {
  const client = getSupabaseClient();
  const channelName = `sessions:${sessionId}`;

  // Remove existing channel if any
  if (channels.has(channelName)) {
    channels.get(channelName)?.unsubscribe();
    channels.delete(channelName);
  }

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        onUpdate(payload.new as RealtimeSession);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to session ${sessionId}`);
      } else if (status === 'CHANNEL_ERROR') {
        const error = new Error(`Failed to subscribe to session ${sessionId}`);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });

  channels.set(channelName, channel);

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to chat updates
 */
export function subscribeToChat(
  chatId: string,
  onUpdate: (chat: { id: string; updated_at: string }) => void,
  onError?: (error: Error) => void
): () => void {
  const client = getSupabaseClient();
  const channelName = `chats:${chatId}`;

  // Remove existing channel if any
  if (channels.has(channelName)) {
    channels.get(channelName)?.unsubscribe();
    channels.delete(channelName);
  }

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chats',
        filter: `id=eq.${chatId}`,
      },
      (payload) => {
        onUpdate(payload.new as { id: string; updated_at: string });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to chat ${chatId}`);
      } else if (status === 'CHANNEL_ERROR') {
        const error = new Error(`Failed to subscribe to chat ${chatId}`);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });

  channels.set(channelName, channel);

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to profile updates
 */
export function subscribeToProfiles(
  filters: { role?: string; ids?: string[] } | null,
  onProfileChange: (
    profile: RealtimeProfile,
    context: { eventType: string; oldRecord: Record<string, unknown> | null },
  ) => void,
  onError?: (error: Error) => void
): () => void {
  const client = getSupabaseClient();
  const filterKey = JSON.stringify(filters ?? {});
  const channelName = `profiles:${filterKey}`;

  if (channels.has(channelName)) {
    channels.get(channelName)?.unsubscribe();
    channels.delete(channelName);
  }

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
      },
      (payload) => {
        const record = (payload.new ?? payload.old) as RealtimeProfile | null;
        if (!record) {
          return;
        }

        if (filters?.role && record.role !== filters.role) {
          return;
        }

        if (filters?.ids && filters.ids.length > 0 && !filters.ids.includes(record.id)) {
          return;
        }

        try {
          onProfileChange(record, {
            eventType: payload.eventType,
            oldRecord: (payload.old as Record<string, unknown> | null) ?? null,
          });
        } catch (error) {
          if (onError) {
            onError(error as Error);
          } else {
            console.error(error);
          }
        }
      },
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        const error = new Error('Failed to subscribe to profiles channel');
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });

  channels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll(): void {
  channels.forEach((channel) => {
    channel.unsubscribe();
  });
  channels.clear();
}

/**
 * Realtime client utilities
 */
export const realtimeClient = {
  subscribeToMessages,
  subscribeToNotifications,
  subscribeToSession,
  subscribeToChat,
  unsubscribeAll,
  getClient: getSupabaseClient,
};

export default realtimeClient;

