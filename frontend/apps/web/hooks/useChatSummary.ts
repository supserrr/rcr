/**
 * Hook to load chat summary metrics for dashboards
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatApi, ChatSummary } from '@/lib/api/chat';
import { ApiError } from '@/lib/api/client';

export interface UseChatSummaryOptions {
  enabled?: boolean;
}

export interface UseChatSummaryReturn {
  summary: ChatSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useChatSummary(
  options?: UseChatSummaryOptions
): UseChatSummaryReturn {
  const enabled = options?.enabled ?? true;

  const [summary, setSummary] = useState<ChatSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!enabled) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ChatApi.getChatSummary();
      setSummary(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load chat summary';
      setError(message);
      console.error('Error loading chat summary:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refresh = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  return useMemo(
    () => ({
      summary,
      loading,
      error,
      refresh,
    }),
    [summary, loading, error, refresh]
  );
}

