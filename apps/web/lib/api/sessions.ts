/**
 * Sessions API service
 * 
 * Handles all session-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';
import { getJitsiConfig, formatRoomName } from '../jitsi/config';

/**
 * Session type
 */
export type SessionType = 'video' | 'audio' | 'chat' | 'in-person';

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
 * Note: 'in-person' type is accepted but will be mapped to 'video' for database storage
 */
export interface CreateSessionInput {
  patientId: string;
  counselorId: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType | 'in-person';
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
 * Aggregated session statistics
 */
export interface SessionStats {
  totalSessions: number;
  totalScheduled: number;
  upcomingSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  nextSessionAt?: string;
  lastCompletedSessionAt?: string;
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

    // Validate session type - map 'in-person' to 'video' as it's not supported in DB
    const validType = data.type === 'in-person' ? 'video' : data.type;
    if (!['video', 'audio', 'chat'].includes(validType)) {
      throw new Error(`Invalid session type: ${data.type}. Must be one of: video, audio, chat`);
    }

    // Validate required fields
    if (!data.patientId || !data.counselorId) {
      throw new Error('Patient ID and Counselor ID are required');
    }

    if (!data.date || !data.time) {
      throw new Error('Date and time are required');
    }

    if (!data.duration || data.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }

    // Validate and format date (must be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error(`Invalid date format: ${data.date}. Expected YYYY-MM-DD format.`);
    }

    // Validate date is not in the past
    const sessionDate = new Date(data.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sessionDate < today) {
      throw new Error('Session date cannot be in the past');
    }

    // Validate and format time (must be HH:MM or HH:MM:SS)
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(data.time)) {
      throw new Error(`Invalid time format: ${data.time}. Expected HH:MM or HH:MM:SS format.`);
    }

    // Get current user to verify authentication and RLS permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[SessionsApi.createSession] Auth error:', authError);
      throw new Error('You must be authenticated to create a session');
    }

    // Verify user is the patient (RLS requires auth.uid() = patient_id)
    if (user.id !== data.patientId) {
      throw new Error('You can only create sessions for yourself as a patient');
    }

    // Validate that patient and counselor exist
    // Note: We can't create profiles due to RLS (only handle_new_user trigger can),
    // so we'll just verify they exist and let the session insert validate foreign keys
    // RLS policies will handle authorization
    const [patientProfileCheck, counselorProfileCheck] = await Promise.all([
      supabase.from('profiles').select('id, role').eq('id', data.patientId).maybeSingle(),
      supabase.from('profiles').select('id, role').eq('id', data.counselorId).maybeSingle(),
    ]);

    // Check patient profile (optional - profile might not exist yet, but user exists in auth.users)
    if (patientProfileCheck.error) {
      console.warn('[SessionsApi.createSession] Patient profile check error (non-blocking):', patientProfileCheck.error);
      // Don't throw - profile might not exist but user exists in auth.users
      // The session insert will fail with a foreign key error if user doesn't exist
    }

    if (patientProfileCheck.data && patientProfileCheck.data.role !== 'patient') {
      // Profile exists but role is wrong - warn but don't block (RLS will handle permissions)
      console.warn(`[SessionsApi.createSession] Patient has role '${patientProfileCheck.data.role}' instead of 'patient'. Session creation may still work if RLS allows it.`);
    }

    // Check counselor profile (required - counselor must have a profile)
    if (counselorProfileCheck.error) {
      console.error('[SessionsApi.createSession] Counselor profile check error:', counselorProfileCheck.error);
      // If it's a permission error, we might not be able to see the profile, but the session insert will validate
      if (counselorProfileCheck.error.code === 'PGRST301' || counselorProfileCheck.error.code === '42501') {
        console.warn('[SessionsApi.createSession] Cannot verify counselor profile due to permissions. Proceeding with session creation - RLS will validate.');
      }
    }

    if (!counselorProfileCheck.data) {
      // Counselor profile doesn't exist - this is a problem
      // But we'll let the session insert fail with a foreign key error for a clearer message
      console.warn('[SessionsApi.createSession] Counselor profile not found. Session insert will validate foreign key constraint.');
    } else if (counselorProfileCheck.data.role !== 'counselor') {
      console.warn(`[SessionsApi.createSession] Counselor has role '${counselorProfileCheck.data.role}' instead of 'counselor'. Session creation may still work if RLS allows it.`);
    }

    // Format time to ensure it's in HH:MM:SS format (PostgreSQL TIME accepts HH:MM but let's be explicit)
    const formattedTime = data.time.includes(':') && data.time.split(':').length === 2 
      ? `${data.time}:00` 
      : data.time;

    const insertData = {
      patient_id: data.patientId,
      counselor_id: data.counselorId,
      date: data.date,
      time: formattedTime,
      duration: data.duration,
      type: validType,
      notes: data.notes || null,
      status: 'scheduled' as const,
    };

    console.log('[SessionsApi.createSession] Inserting session:', {
      ...insertData,
      patient_id: insertData.patient_id.substring(0, 8) + '...',
      counselor_id: insertData.counselor_id.substring(0, 8) + '...',
    });

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[SessionsApi.createSession] Database error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        insertData: {
          ...insertData,
          patient_id: insertData.patient_id.substring(0, 8) + '...',
          counselor_id: insertData.counselor_id.substring(0, 8) + '...',
        }
      });

      // Provide more specific error messages based on error code
      if (error.code === '23503') {
        // Foreign key constraint violation - user doesn't exist in auth.users
        if (error.message.includes('patient_id') || error.message.includes('patient')) {
          throw new Error('Patient account does not exist. Please ensure you are signed in with a valid account.');
        }
        if (error.message.includes('counselor_id') || error.message.includes('counselor')) {
          throw new Error('Counselor account does not exist. Please select a valid counselor.');
        }
        throw new Error('Invalid patient or counselor ID. Please ensure both users exist.');
      }
      if (error.code === '23514') {
        if (error.message.includes('valid_session_time')) {
          throw new Error('Session date cannot be in the past');
        }
        if (error.message.includes('patient_counselor_different')) {
          throw new Error('Patient and counselor must be different users');
        }
        if (error.message.includes('duration')) {
          throw new Error('Duration must be greater than 0');
        }
        throw new Error(`Validation error: ${error.message}`);
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. You may not have permission to create sessions. Please contact support.');
      }
      if (error.code === '23505') {
        throw new Error('A session with these details already exists.');
      }
      if (error.code === 'PGRST116') {
        throw new Error('No rows returned. The session may not have been created due to database constraints.');
      }

      // Include the error code and details in the message for debugging
      const errorDetails = error.details ? ` Details: ${error.details}` : '';
      const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
      throw new Error(
        error.message || 'Failed to create session' + 
        (error.code ? ` (Error code: ${error.code})` : '') +
        errorDetails +
        errorHint
      );
    }

    if (!session) {
      throw new Error('Session was not created. No data returned from database.');
    }

    const mapped = this.mapSessionFromDb(session);

    void fetch('/api/notifications/events/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: mapped.id }),
    }).catch((notificationError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionsApi.createSession] Failed to schedule notifications:', notificationError);
      }
    });

    return mapped;
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

    // Select specific columns to avoid triggering RLS recursion on related tables
    let query = supabase.from('sessions').select('id,patient_id,counselor_id,date,time,duration,type,status,notes,jitsi_room_url,jitsi_room_name,rating,created_at,updated_at', { count: 'exact' });
    
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

    if (error || !session) {
      throw new Error(error?.message || 'Failed to update session');
    }

    const mapped = this.mapSessionFromDb(session);

    void fetch('/api/notifications/events/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: mapped.id }),
    }).catch((notificationError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionsApi.updateSession] Failed to adjust notifications:', notificationError);
      }
    });

    return mapped;
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

    if (error || !session) {
      throw new Error(error?.message || 'Failed to reschedule session');
    }

    const mapped = this.mapSessionFromDb(session);

    void fetch('/api/notifications/events/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: mapped.id }),
    }).catch((notificationError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionsApi.rescheduleSession] Failed to adjust notifications:', notificationError);
      }
    });

    return mapped;
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

    if (error || !session) {
      throw new Error(error?.message || 'Failed to cancel session');
    }

    const mapped = this.mapSessionFromDb(session);

    void fetch('/api/notifications/events/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: mapped.id }),
    }).catch((notificationError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionsApi.cancelSession] Failed to adjust notifications:', notificationError);
      }
    });

    return mapped;
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

    if (error || !session) {
      throw new Error(error?.message || 'Failed to complete session');
    }

    const mapped = this.mapSessionFromDb(session);

    void fetch('/api/notifications/events/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: mapped.id }),
    }).catch((notificationError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionsApi.completeSession] Failed to adjust notifications:', notificationError);
      }
    });

    return mapped;
  }

  /**
   * Get Jitsi room configuration for a session
   * 
   * Generates Jitsi room configuration based on environment settings.
   * Supports free Jitsi (meet.jit.si), JaaS (8x8.vc), and self-hosted instances.
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

    const baseRoomName = session?.jitsi_room_name || `session-${sessionId}`;
    const jitsiConfig = getJitsiConfig();
    const formattedRoomName = formatRoomName(baseRoomName);
    const roomUrl = `https://${jitsiConfig.domain}/${formattedRoomName}`;

    return {
      roomUrl,
      roomName: formattedRoomName,
      config: {},
      isJaaS: jitsiConfig.isJaaS,
      apiType,
    };
  }

  /**
   * Get session statistics for the current patient (or a specified patient)
   */
  static async getPatientSessionStats(userId?: string): Promise<SessionStats | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('patient_session_stats')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to get patient session stats');
    }

    if (!data) {
      return null;
    }

    return this.mapSessionStatsFromDb(data);
  }

  /**
   * Get session statistics for the current counselor (or a specified counselor)
   */
  static async getCounselorSessionStats(userId?: string): Promise<SessionStats | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('counselor_session_stats')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to get counselor session stats');
    }

    if (!data) {
      return null;
    }

    return this.mapSessionStatsFromDb(data);
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

  private static mapSessionStatsFromDb(dbStats: Record<string, unknown>): SessionStats {
    return {
      totalSessions: Number(dbStats.total_sessions ?? 0),
      totalScheduled: Number(dbStats.total_scheduled ?? 0),
      upcomingSessions: Number(dbStats.upcoming_sessions ?? 0),
      completedSessions: Number(dbStats.completed_sessions ?? 0),
      cancelledSessions: Number(dbStats.cancelled_sessions ?? 0),
      nextSessionAt: dbStats.next_session_at
        ? new Date(dbStats.next_session_at as string).toISOString()
        : undefined,
      lastCompletedSessionAt: dbStats.last_completed_session_at
        ? new Date(dbStats.last_completed_session_at as string).toISOString()
        : undefined,
    };
  }
}

