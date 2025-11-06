/**
 * Sessions API service
 * 
 * Handles all session-related API calls
 */

import { api } from './client';

/**
 * Session type
 */
export type SessionType = 'video' | 'audio' | 'chat';

/**
 * Session status
 */
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

/**
 * Session interface
 */
export interface Session {
  id: string;
  patientId: string;
  counselorId: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType;
  status: SessionStatus;
  notes?: string;
  jitsiRoomUrl?: string;
  jitsiRoomName?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create session input
 */
export interface CreateSessionInput {
  patientId: string;
  counselorId: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType;
  notes?: string;
}

/**
 * Update session input
 */
export interface UpdateSessionInput {
  date?: string;
  time?: string;
  duration?: number;
  type?: SessionType;
  status?: SessionStatus;
  notes?: string;
  rating?: number;
}

/**
 * Reschedule session input
 */
export interface RescheduleSessionInput {
  date: string;
  time: string;
  reason?: string;
}

/**
 * Cancel session input
 */
export interface CancelSessionInput {
  reason?: string;
}

/**
 * Complete session input
 */
export interface CompleteSessionInput {
  notes?: string;
  rating?: number;
}

/**
 * Session query parameters
 */
export interface SessionQueryParams {
  patientId?: string;
  counselorId?: string;
  status?: SessionStatus;
  type?: SessionType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * List sessions response
 */
export interface ListSessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Jitsi room configuration
 */
export interface JitsiRoomConfig {
  roomUrl: string;
  roomName: string;
  config: unknown;
  isJaaS: boolean;
  apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet';
}

/**
 * Sessions API service
 */
export class SessionsApi {
  /**
   * Create a new session
   */
  static async createSession(data: CreateSessionInput): Promise<Session> {
    return api.post<Session>('/sessions', data);
  }

  /**
   * Get a session by ID
   */
  static async getSession(sessionId: string): Promise<Session> {
    return api.get<Session>(`/sessions/${sessionId}`);
  }

  /**
   * List sessions
   */
  static async listSessions(params?: SessionQueryParams): Promise<ListSessionsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';
    
    return api.get<ListSessionsResponse>(endpoint);
  }

  /**
   * Update a session
   */
  static async updateSession(
    sessionId: string,
    data: UpdateSessionInput
  ): Promise<Session> {
    return api.put<Session>(`/sessions/${sessionId}`, data);
  }

  /**
   * Reschedule a session
   */
  static async rescheduleSession(
    sessionId: string,
    data: RescheduleSessionInput
  ): Promise<Session> {
    return api.post<Session>(`/sessions/${sessionId}/reschedule`, data);
  }

  /**
   * Cancel a session
   */
  static async cancelSession(
    sessionId: string,
    data?: CancelSessionInput
  ): Promise<Session> {
    return api.post<Session>(`/sessions/${sessionId}/cancel`, data || {});
  }

  /**
   * Complete a session
   */
  static async completeSession(
    sessionId: string,
    data?: CompleteSessionInput
  ): Promise<Session> {
    return api.post<Session>(`/sessions/${sessionId}/complete`, data || {});
  }

  /**
   * Get Jitsi room configuration for a session
   */
  static async getJitsiRoom(
    sessionId: string,
    apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet' = 'react-sdk'
  ): Promise<JitsiRoomConfig> {
    return api.get<JitsiRoomConfig>(
      `/sessions/${sessionId}/jitsi-room?apiType=${apiType}`
    );
  }
}

