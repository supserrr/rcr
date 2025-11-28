/**
 * React hook for managing sessions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionsApi, type Session, type CreateSessionInput, type UpdateSessionInput, type RescheduleSessionInput, type CancelSessionInput, type CompleteSessionInput, type SessionQueryParams } from '@/lib/api/sessions';
import { ApiError } from '@/lib/api/client';

export interface UseSessionsReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  total: number;
  createSession: (data: CreateSessionInput) => Promise<Session>;
  updateSession: (sessionId: string, data: UpdateSessionInput) => Promise<Session>;
  rescheduleSession: (sessionId: string, data: RescheduleSessionInput) => Promise<Session>;
  cancelSession: (sessionId: string, data?: CancelSessionInput) => Promise<Session>;
  completeSession: (sessionId: string, data?: CompleteSessionInput) => Promise<Session>;
  refreshSessions: () => Promise<void>;
}

export interface UseSessionsOptions {
  enabled?: boolean;
}

export function useSessions(
  params?: SessionQueryParams,
  options?: UseSessionsOptions
): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(options?.enabled ?? true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const enabled = options?.enabled ?? true;

  // Memoize params to prevent unnecessary re-fetches
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);

  const fetchSessions = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setSessions([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const effectiveParams = paramsKey === 'null' ? undefined : (JSON.parse(paramsKey) as SessionQueryParams);
      const response = await SessionsApi.listSessions(effectiveParams);
      setSessions(response.sessions);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, paramsKey]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(async (data: CreateSessionInput): Promise<Session> => {
    try {
      const session = await SessionsApi.createSession(data);
      await fetchSessions(); // Refresh list
      return session;
    } catch (err) {
      // Preserve the original error message if it exists
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err instanceof ApiError 
          ? err.message 
          : 'Failed to create session');
      console.error('[useSessions.createSession] Error creating session:', err);
      throw new Error(errorMessage);
    }
  }, [fetchSessions]);

  const updateSession = useCallback(async (sessionId: string, data: UpdateSessionInput): Promise<Session> => {
    try {
      const session = await SessionsApi.updateSession(sessionId, data);
      await fetchSessions(); // Refresh list
      return session;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update session';
      throw new Error(errorMessage);
    }
  }, [fetchSessions]);

  const rescheduleSession = useCallback(async (sessionId: string, data: RescheduleSessionInput): Promise<Session> => {
    try {
      const session = await SessionsApi.rescheduleSession(sessionId, data);
      await fetchSessions(); // Refresh list
      return session;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to reschedule session';
      throw new Error(errorMessage);
    }
  }, [fetchSessions]);

  const cancelSession = useCallback(async (sessionId: string, data?: CancelSessionInput): Promise<Session> => {
    try {
      const session = await SessionsApi.cancelSession(sessionId, data);
      await fetchSessions(); // Refresh list
      return session;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to cancel session';
      throw new Error(errorMessage);
    }
  }, [fetchSessions]);

  const completeSession = useCallback(async (sessionId: string, data?: CompleteSessionInput): Promise<Session> => {
    try {
      const session = await SessionsApi.completeSession(sessionId, data);
      await fetchSessions(); // Refresh list
      return session;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to complete session';
      throw new Error(errorMessage);
    }
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    total,
    createSession,
    updateSession,
    rescheduleSession,
    cancelSession,
    completeSession,
    refreshSessions: fetchSessions,
  };
}

