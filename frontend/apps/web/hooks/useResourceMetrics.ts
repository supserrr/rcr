/**
 * Hook to load aggregated resource metrics for dashboards
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResourceEngagementMetric,
  ResourceSummaryMetric,
  ResourcesApi,
} from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';

export interface UseResourceSummariesOptions {
  isPublic?: boolean;
  limit?: number;
  orderBy?: 'views' | 'downloads' | 'recent';
  enabled?: boolean;
}

export interface UseResourceSummariesReturn {
  summaries: ResourceSummaryMetric[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useResourceSummaries(
  options?: UseResourceSummariesOptions
): UseResourceSummariesReturn {
  const { isPublic, limit = 6, orderBy = 'views', enabled = true } = options || {};

  const [summaries, setSummaries] = useState<ResourceSummaryMetric[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    if (!enabled) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ResourcesApi.listResourceSummaries({
        isPublic,
        limit,
        orderBy,
      });
      setSummaries(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load resource metrics';
      setError(message);
      console.error('Error loading resource summaries:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, isPublic, limit, orderBy]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const refresh = useCallback(async () => {
    await fetchSummaries();
  }, [fetchSummaries]);

  return useMemo(
    () => ({
      summaries,
      loading,
      error,
      refresh,
    }),
    [summaries, loading, error, refresh]
  );
}

export interface UseResourceEngagementOptions {
  resourceId: string;
  userId?: string | null;
  enabled?: boolean;
}

export interface UseResourceEngagementReturn {
  engagement: ResourceEngagementMetric | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useResourceEngagement(
  options: UseResourceEngagementOptions
): UseResourceEngagementReturn {
  const { resourceId, userId, enabled = true } = options;

  const [engagement, setEngagement] = useState<ResourceEngagementMetric | null>(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const fetchEngagement = useCallback(async () => {
    if (!enabled || !resourceId) {
      setEngagement(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ResourcesApi.getResourceEngagement(resourceId, userId);
      setEngagement(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load resource engagement';
      setError(message);
      console.error('Error loading resource engagement:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, resourceId, userId]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  const refresh = useCallback(async () => {
    await fetchEngagement();
  }, [fetchEngagement]);

  return useMemo(
    () => ({
      engagement,
      loading,
      error,
      refresh,
    }),
    [engagement, loading, error, refresh]
  );
}

