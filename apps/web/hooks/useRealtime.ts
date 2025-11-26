/**
 * React hook for Supabase Realtime subscriptions
 * 
 * Provides real-time subscriptions for messages, notifications, and sessions
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  subscribeToMessages,
  subscribeToNotifications,
  subscribeToSession,
  subscribeToChat,
  subscribeToProfiles,
  unsubscribeAll,
  type RealtimeMessage,
  type RealtimeNotification,
  type RealtimeSession,
  type RealtimeProfile,
} from '@/lib/realtime/client';

// Re-export types for convenience
export type { RealtimeMessage, RealtimeNotification, RealtimeSession, RealtimeProfile };

/**
 * Hook for subscribing to chat messages
 */
export function useChatMessages(
  chatId: string | null,
  onMessage: (message: RealtimeMessage) => void,
  onError?: (error: Error) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const unsubscribe = subscribeToMessages(chatId, onMessage, onError);
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [chatId, onMessage, onError]);
}

/**
 * Hook for subscribing to notifications
 */
export function useNotifications(
  userId: string | null,
  onNotification: (notification: RealtimeNotification) => void,
  onError?: (error: Error) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = subscribeToNotifications(userId, onNotification, onError);
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, onNotification, onError]);
}

/**
 * Hook for subscribing to session updates
 */
export function useSessionUpdates(
  sessionId: string | null,
  onUpdate: (session: RealtimeSession) => void,
  onError?: (error: Error) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const unsubscribe = subscribeToSession(sessionId, onUpdate, onError);
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId, onUpdate, onError]);
}

/**
 * Hook for subscribing to chat updates
 */
export function useChatUpdates(
  chatId: string | null,
  onUpdate: (chat: { id: string; updated_at: string }) => void,
  onError?: (error: Error) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const unsubscribe = subscribeToChat(chatId, onUpdate, onError);
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [chatId, onUpdate, onError]);
}

/**
 * Cleanup all subscriptions on unmount
 */
export function useRealtimeCleanup() {
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, []);
}

/**
 * Hook for subscribing to profile updates
 */
export function useProfileUpdates(
  filters: { role?: string; ids?: string[] } | null,
  onUpdate: (
    profile: RealtimeProfile,
    context: { eventType: string; oldRecord: Record<string, unknown> | null },
  ) => void,
  onError?: (error: Error) => void
) {
  const filtersKey = JSON.stringify(filters ?? {});

  useEffect(() => {
    if (!filters || (Array.isArray(filters.ids) && filters.ids.length === 0 && !filters.role)) {
      return;
    }

    const unsubscribe = subscribeToProfiles(filters, onUpdate, onError);

    return () => {
      unsubscribe();
    };
  }, [filtersKey, onUpdate, onError, filters]);
}

