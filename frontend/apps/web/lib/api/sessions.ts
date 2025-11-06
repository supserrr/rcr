/**
 * Sessions API service
 * 
 * Handles all session-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';

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
   * Create a new session using Supabase
   */
  static async createSession(data: CreateSessionInput): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        patient_id: data.patientId,
        counselor_id: data.counselorId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        notes: data.notes,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * Get a session by ID using Supabase
   */
  static async getSession(sessionId: string): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to get session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * List sessions using Supabase
   */
  static async listSessions(params?: SessionQueryParams): Promise<ListSessionsResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let query = supabase.from('sessions').select('*', { count: 'exact' });

    if (params?.patientId) {
      query = query.eq('patient_id', params.patientId);
    }
    if (params?.counselorId) {
      query = query.eq('counselor_id', params.counselorId);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
    }
    if (params?.dateFrom) {
      query = query.gte('date', params.dateFrom);
    }
    if (params?.dateTo) {
      query = query.lte('date', params.dateTo);
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: sessions, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list sessions');
    }

    return {
      sessions: (sessions || []).map(s => this.mapSessionFromDb(s)),
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Update a session using Supabase
   */
  static async updateSession(
    sessionId: string,
    data: UpdateSessionInput
  ): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.date !== undefined) updateData.date = data.date;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.rating !== undefined) updateData.rating = data.rating;

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * Reschedule a session using Supabase
   */
  static async rescheduleSession(
    sessionId: string,
    data: RescheduleSessionInput
  ): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .update({
        date: data.date,
        time: data.time,
        status: 'rescheduled',
        notes: data.reason ? `Rescheduled: ${data.reason}` : undefined,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to reschedule session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * Cancel a session using Supabase
   */
  static async cancelSession(
    sessionId: string,
    data?: CancelSessionInput
  ): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .update({
        status: 'cancelled',
        notes: data?.reason ? `Cancelled: ${data.reason}` : undefined,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to cancel session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * Complete a session using Supabase
   */
  static async completeSession(
    sessionId: string,
    data?: CompleteSessionInput
  ): Promise<Session> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const updateData: Record<string, unknown> = {
      status: 'completed',
    };
    if (data?.notes) updateData.notes = data.notes;
    if (data?.rating !== undefined) updateData.rating = data.rating;

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to complete session');
    }

    return this.mapSessionFromDb(session);
  }

  /**
   * Get Jitsi room configuration for a session
   * Note: This generates a simple Jitsi room URL. For production, you may want to use Jitsi Meet API.
   */
  static async getJitsiRoom(
    sessionId: string,
    apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet' = 'react-sdk'
  ): Promise<JitsiRoomConfig> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('id, jitsi_room_name')
      .eq('id', sessionId)
      .single();

    const roomName = session?.jitsi_room_name || `session-${sessionId}`;
    const roomUrl = `https://meet.jit.si/${roomName}`;

    return {
      roomUrl,
      roomName,
      config: {},
      isJaaS: false,
      apiType,
    };
  }

  /**
   * Map database session to API session format
   */
  private static mapSessionFromDb(dbSession: Record<string, unknown>): Session {
    return {
      id: dbSession.id as string,
      patientId: dbSession.patient_id as string,
      counselorId: dbSession.counselor_id as string,
      date: dbSession.date as string,
      time: dbSession.time as string,
      duration: dbSession.duration as number,
      type: dbSession.type as SessionType,
      status: dbSession.status as SessionStatus,
      notes: dbSession.notes as string | undefined,
      jitsiRoomUrl: dbSession.jitsi_room_url as string | undefined,
      jitsiRoomName: dbSession.jitsi_room_name as string | undefined,
      rating: dbSession.rating as number | undefined,
      createdAt: dbSession.created_at as string,
      updatedAt: dbSession.updated_at as string,
    };
  }
}

