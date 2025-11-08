/**
 * Hook to load notification summary for dashboards
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotificationSummary, NotificationsApi } from '@/lib/api/notifications';
import { ApiError } from '@/lib/api/client';

export interface UseNotificationSummaryOptions {
  enabled?: boolean;
}

export interface UseNotificationSummaryReturn {
  summary: NotificationSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNotificationSummary(
  options?: UseNotificationSummaryOptions
): UseNotificationSummaryReturn {
  const enabled = options?.enabled ?? true;

  const [summary, setSummary] = useState<NotificationSummary | null>(null);
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
      const data = await NotificationsApi.getNotificationSummary();
      setSummary(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load notification summary';
      setError(message);
      console.error('Error loading notification summary:', err);
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

