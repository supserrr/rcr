/**
 * Sessions service layer
 * 
 * Handles all session-related business logic using Supabase
 */

import { getSupabaseClient, getSupabaseServiceClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import { createJitsiRoom, getJitsiRoom } from './jitsi.service';
import type {
  CreateSessionInput,
  UpdateSessionInput,
  RescheduleSessionInput,
  CancelSessionInput,
  CompleteSessionInput,
  SessionQueryParams,
} from '../schemas/sessions.schema';

/**
 * Session status type
 */
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

/**
 * Session type
 */
export type SessionType = 'video' | 'audio' | 'chat';

/**
 * Session data returned from operations
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
 * Create a new session
 */
export async function createSession(
  input: CreateSessionInput,
  userId: string
): Promise<Session> {
  try {
    const supabase = getSupabaseClient();
    const { patientId, counselorId, date, time, duration, type, notes } = input;

    // Validate that the user is either the patient or counselor
    if (userId !== patientId && userId !== counselorId) {
      throw new AppError('You can only create sessions for yourself', 403);
    }

    // Create session record
    const sessionData = {
      patient_id: patientId,
      counselor_id: counselorId,
      date,
      time,
      duration,
      type,
      status: 'scheduled' as SessionStatus,
      notes: notes || null,
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      logError('Create session error', error);
      throw new AppError('Failed to create session', 500);
    }

    // Generate Jitsi room if session type is video
    let jitsiRoomUrl: string | undefined;
    let jitsiRoomName: string | undefined;

    if (type === 'video') {
      try {
        // Get user information for Jitsi room creation
        const { data: userData } = await supabase.auth.getUser();
        const userName = userData?.user?.user_metadata?.full_name || 'User';
        const userEmail = userData?.user?.email || undefined;

        const jitsiRoom = await createJitsiRoom(session.id, userId, userName, userEmail, false);
        jitsiRoomUrl = jitsiRoom.roomUrl;
        jitsiRoomName = jitsiRoom.roomName;

        // Update session with Jitsi room information
        await supabase
          .from('sessions')
          .update({
            jitsi_room_url: jitsiRoomUrl,
            jitsi_room_name: jitsiRoomName,
          })
          .eq('id', session.id);
      } catch (jitsiError) {
        logError('Jitsi room creation failed', jitsiError);
        // Continue without Jitsi room - session can still be created
      }
    }

    const result: Session = {
      id: session.id,
      patientId: session.patient_id,
      counselorId: session.counselor_id,
      date: session.date,
      time: session.time,
      duration: session.duration,
      type: session.type,
      status: session.status,
      notes: session.notes || undefined,
      jitsiRoomUrl,
      jitsiRoomName,
      createdAt: session.created_at || new Date().toISOString(),
      updatedAt: session.updated_at || new Date().toISOString(),
    };

    logInfo('Session created successfully', { sessionId: result.id, userId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Create session service error', error);
    throw new AppError('Failed to create session', 500);
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string, userId: string): Promise<Session> {
  try {
    const supabase = getSupabaseClient();

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      logError('Get session error', error);
      throw new AppError('Session not found', 404);
    }

    // Check if user has access to this session
    if (session.patient_id !== userId && session.counselor_id !== userId) {
      throw new AppError('Access denied to this session', 403);
    }

    const result: Session = {
      id: session.id,
      patientId: session.patient_id,
      counselorId: session.counselor_id,
      date: session.date,
      time: session.time,
      duration: session.duration,
      type: session.type,
      status: session.status,
      notes: session.notes || undefined,
      jitsiRoomUrl: session.jitsi_room_url || undefined,
      jitsiRoomName: session.jitsi_room_name || undefined,
      rating: session.rating || undefined,
      createdAt: session.created_at || new Date().toISOString(),
      updatedAt: session.updated_at || new Date().toISOString(),
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get session service error', error);
    throw new AppError('Failed to get session', 500);
  }
}

/**
 * List sessions with filters
 */
export async function listSessions(
  userId: string,
  userRole: string,
  query: SessionQueryParams
): Promise<{ sessions: Session[]; total: number }> {
  try {
    const supabase = getSupabaseClient();

    let queryBuilder = supabase.from('sessions').select('*', { count: 'exact' });

    // Apply role-based filtering
    if (userRole === 'patient') {
      queryBuilder = queryBuilder.eq('patient_id', userId);
    } else if (userRole === 'counselor') {
      queryBuilder = queryBuilder.eq('counselor_id', userId);
    }
    // Admin can see all sessions - no filter needed

    // Apply filters from query params
    if (query.patientId) {
      queryBuilder = queryBuilder.eq('patient_id', query.patientId);
    }

    if (query.counselorId) {
      queryBuilder = queryBuilder.eq('counselor_id', query.counselorId);
    }

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.dateFrom) {
      queryBuilder = queryBuilder.gte('date', query.dateFrom);
    }

    if (query.dateTo) {
      queryBuilder = queryBuilder.lte('date', query.dateTo);
    }

    // Apply pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Order by date and time
    queryBuilder = queryBuilder.order('date', { ascending: true }).order('time', { ascending: true });

    const { data: sessions, error, count } = await queryBuilder;

    if (error) {
      logError('List sessions error', error);
      throw new AppError('Failed to list sessions', 500);
    }

    const mappedSessions: Session[] = (sessions || []).map((session) => ({
      id: session.id,
      patientId: session.patient_id,
      counselorId: session.counselor_id,
      date: session.date,
      time: session.time,
      duration: session.duration,
      type: session.type,
      status: session.status,
      notes: session.notes || undefined,
      jitsiRoomUrl: session.jitsi_room_url || undefined,
      jitsiRoomName: session.jitsi_room_name || undefined,
      rating: session.rating || undefined,
      createdAt: session.created_at || new Date().toISOString(),
      updatedAt: session.updated_at || new Date().toISOString(),
    }));

    return {
      sessions: mappedSessions,
      total: count || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('List sessions service error', error);
    throw new AppError('Failed to list sessions', 500);
  }
}

/**
 * Update session
 */
export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput,
  userId: string
): Promise<Session> {
  try {
    const supabase = getSupabaseClient();

    // First, get the session to check permissions
    const session = await getSessionById(sessionId, userId);

    // Check if user has permission to update
    // Only patient, counselor, or admin can update
    const canUpdate = session.patientId === userId || session.counselorId === userId;

    if (!canUpdate) {
      throw new AppError('You do not have permission to update this session', 403);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (input.date !== undefined) {
      updateData.date = input.date;
    }

    if (input.time !== undefined) {
      updateData.time = input.time;
    }

    if (input.duration !== undefined) {
      updateData.duration = input.duration;
    }

    if (input.type !== undefined) {
      updateData.type = input.type;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    updateData.updated_at = new Date().toISOString();

    // Update session
    const { data: updatedSession, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !updatedSession) {
      logError('Update session error', error);
      throw new AppError('Failed to update session', 500);
    }

    const result: Session = {
      id: updatedSession.id,
      patientId: updatedSession.patient_id,
      counselorId: updatedSession.counselor_id,
      date: updatedSession.date,
      time: updatedSession.time,
      duration: updatedSession.duration,
      type: updatedSession.type,
      status: updatedSession.status,
      notes: updatedSession.notes || undefined,
      jitsiRoomUrl: updatedSession.jitsi_room_url || undefined,
      jitsiRoomName: updatedSession.jitsi_room_name || undefined,
      rating: updatedSession.rating || undefined,
      createdAt: updatedSession.created_at || new Date().toISOString(),
      updatedAt: updatedSession.updated_at || new Date().toISOString(),
    };

    logInfo('Session updated successfully', { sessionId, userId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Update session service error', error);
    throw new AppError('Failed to update session', 500);
  }
}

/**
 * Reschedule session
 */
export async function rescheduleSession(
  sessionId: string,
  input: RescheduleSessionInput,
  userId: string
): Promise<Session> {
  try {
    // Get current session
    const session = await getSessionById(sessionId, userId);

    // Check if session can be rescheduled
    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new AppError('Cannot reschedule a completed or cancelled session', 400);
    }

    // Update session with new date and time
    const updateData: UpdateSessionInput = {
      date: input.date,
      time: input.time,
      status: 'rescheduled',
      notes: input.reason ? `${session.notes || ''}\n[Rescheduled] ${input.reason}`.trim() : session.notes,
    };

    const updatedSession = await updateSession(sessionId, updateData, userId);

    logInfo('Session rescheduled successfully', { sessionId, userId });

    return updatedSession;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Reschedule session service error', error);
    throw new AppError('Failed to reschedule session', 500);
  }
}

/**
 * Cancel session
 */
export async function cancelSession(
  sessionId: string,
  input: CancelSessionInput,
  userId: string
): Promise<Session> {
  try {
    // Get current session
    const session = await getSessionById(sessionId, userId);

    // Check if session can be cancelled
    if (session.status === 'completed') {
      throw new AppError('Cannot cancel a completed session', 400);
    }

    if (session.status === 'cancelled') {
      throw new AppError('Session is already cancelled', 400);
    }

    // Update session status to cancelled
    const updateData: UpdateSessionInput = {
      status: 'cancelled',
      notes: input.reason
        ? `${session.notes || ''}\n[Cancelled] ${input.reason}`.trim()
        : session.notes || 'Session cancelled',
    };

    const updatedSession = await updateSession(sessionId, updateData, userId);

    logInfo('Session cancelled successfully', { sessionId, userId });

    return updatedSession;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Cancel session service error', error);
    throw new AppError('Failed to cancel session', 500);
  }
}

/**
 * Complete session
 */
export async function completeSession(
  sessionId: string,
  input: CompleteSessionInput,
  userId: string
): Promise<Session> {
  try {
    // Get current session
    const session = await getSessionById(sessionId, userId);

    // Check if user is the counselor (only counselor can complete sessions)
    if (session.counselorId !== userId) {
      throw new AppError('Only the counselor can complete a session', 403);
    }

    // Check if session can be completed
    if (session.status === 'cancelled') {
      throw new AppError('Cannot complete a cancelled session', 400);
    }

    if (session.status === 'completed') {
      throw new AppError('Session is already completed', 400);
    }

    // Update session status to completed
    const updateData: UpdateSessionInput = {
      status: 'completed',
      notes: input.notes ? `${session.notes || ''}\n[Completed] ${input.notes}`.trim() : session.notes,
      rating: input.rating,
    };

    const updatedSession = await updateSession(sessionId, updateData, userId);

    logInfo('Session completed successfully', { sessionId, userId });

    return updatedSession;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Complete session service error', error);
    throw new AppError('Failed to complete session', 500);
  }
}

/**
 * Get Jitsi room configuration for session
 * Supports React SDK, IFrame API, and lib-jitsi-meet API
 */
export async function getSessionJitsiRoom(
  sessionId: string,
  userId: string,
  apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet' = 'react-sdk'
): Promise<{
  roomUrl: string;
  roomName: string;
  config: import('../types/jitsi.types').JitsiMeetingConfig | import('../types/jitsi.types').JaaSMeetingConfig | import('../types/jitsi.types').LibJitsiMeetConfig;
  isJaaS: boolean;
  apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet';
}> {
  try {
    // Get session to verify access
    const session = await getSessionById(sessionId, userId);

    // Generate new Jitsi room configuration if session type is video
    if (session.type === 'video') {
      const supabase = getSupabaseClient();
      
      // Get user information
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData?.user?.user_metadata?.full_name || 'User';
      const userEmail = userData?.user?.email || undefined;
      
      // Determine if user is moderator (counselor)
      const isModerator = session.counselorId === userId;

      const jitsiRoom = await createJitsiRoom(
        sessionId,
        userId,
        userName,
        userEmail,
        isModerator,
        apiType
      );
      
      // Update session with Jitsi room information if not already stored
      if (!session.jitsiRoomUrl || !session.jitsiRoomName) {
        await supabase
          .from('sessions')
          .update({
            jitsi_room_url: jitsiRoom.roomUrl,
            jitsi_room_name: jitsiRoom.roomName,
          })
          .eq('id', sessionId);
      }

      return {
        roomUrl: jitsiRoom.roomUrl,
        roomName: jitsiRoom.roomName,
        config: jitsiRoom.config,
        isJaaS: jitsiRoom.isJaaS,
        apiType: jitsiRoom.apiType,
      };
    }

    throw new AppError('Jitsi rooms are only available for video sessions', 400);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get session Jitsi room error', error);
    throw new AppError('Failed to get Jitsi room', 500);
  }
}

