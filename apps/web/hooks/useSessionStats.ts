/**
 * Hooks to read aggregated session statistics for dashboards
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SessionStats, SessionsApi } from '@/lib/api/sessions';
import { ApiError } from '@/lib/api/client';

export interface UseSessionStatsOptions {
  userId?: string;
  role?: 'patient' | 'counselor';
  enabled?: boolean;
}

export interface UseSessionStatsReturn {
  stats: SessionStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSessionStats(options?: UseSessionStatsOptions): UseSessionStatsReturn {
  const { role = 'patient', userId, enabled = true } = options || {};

  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data =
        role === 'counselor'
          ? await SessionsApi.getCounselorSessionStats(userId)
          : await SessionsApi.getPatientSessionStats(userId);
      setStats(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load session statistics';
      setError(message);
      console.error('Error loading session stats:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, role, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return useMemo(
    () => ({
      stats,
      loading,
      error,
      refresh,
    }),
    [stats, loading, error, refresh]
  );
}

