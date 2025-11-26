/**
 * Supabase Realtime client for real-time features
 * 
 * Handles real-time communication for chat, notifications, and sessions
 * using Supabase Realtime subscriptions
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { createClient as getBrowserSupabaseClient } from '@/lib/supabase/client';

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
  reactions?: Record<string, string[]>;
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
}

export interface RealtimeNotification {
  id: string;
  user_id: string;
  type_key?: string | null;
  title: string;
  message: string;
  metadata?: unknown;
  channels?: unknown;
  delivery_status?: string;
  priority?: string;
  scheduled_for?: string | null;
  delivered_at?: string | null;
  expires_at?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
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
  visibility_settings?: Record<string, unknown> | null;
  approval_status?: string | null;
  approval_submitted_at?: string | null;
  approval_reviewed_at?: string | null;
}

/**
 * Realtime client instance
 */
let supabaseClient: SupabaseClient | null = null;
let channels: Map<string, RealtimeChannel> = new Map();

async function ensureRealtimeAuth(client: SupabaseClient): Promise<void> {
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    if (session?.access_token) {
      client.realtime.setAuth(session.access_token);
    }
  } catch (error) {
    console.warn('[realtime] Failed to sync realtime auth token', error);
  }
}

function toError(details: unknown, fallbackMessage: string): Error {
  if (!details) {
    return new Error(fallbackMessage);
  }

  if (details instanceof Error) {
    return details;
  }

  if (typeof details === 'string') {
    return new Error(`${fallbackMessage}: ${details}`);
  }

  if (typeof details === 'object' && 'message' in details && typeof (details as any).message === 'string') {
    return new Error(`${fallbackMessage}: ${(details as any).message}`);
  }

  return new Error(fallbackMessage);
}

/**
 * Get Supabase client
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const singletonClient = getBrowserSupabaseClient();
    if (!singletonClient) {
      throw new Error('Supabase client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    supabaseClient = singletonClient;
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
      if (status === 'CHANNEL_ERROR') {
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
  onError?: (error: Error) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = `notifications:${userId}`;

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
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as RealtimeNotification);
      },
    );

  channels.set(channelName, channel);

  void (async () => {
    await ensureRealtimeAuth(client);
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        return;
      }

      if (status === 'TIMED_OUT') {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[realtime] Notifications channel timed out. Retrying subscribe…');
        }
        await ensureRealtimeAuth(client);
        await channel.subscribe();
        return;
      }

      if (status === 'CLOSED') {
        channels.delete(channelName);
        return;
      }

      if (status === 'CHANNEL_ERROR') {
        const details = (channel as any)?.getError?.();
        const error = toError(details, `Failed to subscribe to notifications for user ${userId}`);
        channels.delete(channelName);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });
  })().catch((error) => {
    const err = toError(error, `Failed to subscribe to notifications for user ${userId}`);
    channels.delete(channelName);
    if (onError) {
      onError(err);
    } else {
      console.error(err);
    }
  });

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
  onError?: (error: Error) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = `sessions:${sessionId}`;

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
      },
    );

  channels.set(channelName, channel);

  void (async () => {
    await ensureRealtimeAuth(client);
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        return;
      }

      if (status === 'TIMED_OUT') {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[realtime] Session channel timed out. Retrying subscribe…');
        }
        await ensureRealtimeAuth(client);
        await channel.subscribe();
        return;
      }

      if (status === 'CLOSED') {
        channels.delete(channelName);
        return;
      }

      if (status === 'CHANNEL_ERROR') {
        const details = (channel as any)?.getError?.();
        const error = toError(details, `Failed to subscribe to session ${sessionId}`);
        channels.delete(channelName);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });
  })().catch((error) => {
    const err = toError(error, `Failed to subscribe to session ${sessionId}`);
    channels.delete(channelName);
    if (onError) {
      onError(err);
    } else {
      console.error(err);
    }
  });

  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to chat metadata updates
 */
export function subscribeToChat(
  chatId: string,
  onUpdate: (chat: { id: string; updated_at: string }) => void,
  onError?: (error: Error) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = `chats:${chatId}`;

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
      },
    );

  channels.set(channelName, channel);

  void (async () => {
    await ensureRealtimeAuth(client);
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        return;
      }

      if (status === 'TIMED_OUT') {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[realtime] Chat channel timed out. Retrying subscribe…');
        }
        await ensureRealtimeAuth(client);
        await channel.subscribe();
        return;
      }

      if (status === 'CLOSED') {
        channels.delete(channelName);
        return;
      }

      if (status === 'CHANNEL_ERROR') {
        const details = (channel as any)?.getError?.();
        const error = toError(details, `Failed to subscribe to chat ${chatId}`);
        channels.delete(channelName);
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
      }
    });
  })().catch((error) => {
    const err = toError(error, `Failed to subscribe to chat ${chatId}`);
    channels.delete(channelName);
    if (onError) {
      onError(err);
    } else {
      console.error(err);
    }
  });

  return () => {
    channel.unsubscribe();
    channels.delete(channelName);
  };
}

/**
 * Subscribe to profile updates with optional filters
 */
export function subscribeToProfiles(
  filters: { role?: string; ids?: string[] } | null,
  onProfileChange: (
    profile: RealtimeProfile,
    context: { eventType: string; oldRecord: Record<string, unknown> | null },
  ) => void,
  onError?: (error: Error) => void,
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
 * Unsubscribe from all realtime channels
 */
export function unsubscribeAll(): void {
  channels.forEach((channel) => channel.unsubscribe());
  channels.clear();
}