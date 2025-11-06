/**
 * Sessions Edge Function
 * 
 * Handles session endpoints:
 * - GET / - List sessions
 * - POST / - Create a new session
 * - GET /:id - Get session by ID
 * - PUT /:id - Update session
 * - POST /:id/reschedule - Reschedule session
 * - POST /:id/cancel - Cancel session
 * - POST /:id/complete - Complete session
 * - GET /:id/jitsi-room - Get Jitsi room for session
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient, getSupabaseServiceClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth, requireRole } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * Create a new session
 */
async function handleCreateSession(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { patientId, counselorId, date, time, duration, type, notes } = body;

    if (!patientId || !counselorId || !date || !time || !duration || !type) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Patient ID, counselor ID, date, time, duration, and type are required')),
        { status: 400 },
        request
      );
    }

    if (user.id !== patientId && user.id !== counselorId) {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You can only create sessions for yourself')),
        { status: 403 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);
    const sessionData = {
      patient_id: patientId,
      counselor_id: counselorId,
      date,
      time,
      duration,
      type,
      status: 'scheduled',
      notes: notes || null,
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Create session error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to create session', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(session)),
      { status: 201 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Get session by ID
 */
async function handleGetSession(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return corsResponse(
        JSON.stringify(errorResponse('Session not found', error?.message || 'Session does not exist')),
        { status: 404 },
        request
      );
    }

    if (session.patient_id !== user.id && session.counselor_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have access to this session')),
        { status: 403 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(session)),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * List sessions
 */
async function handleListSessions(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    let query = supabase.from('sessions').select('*');

    // Apply filters based on user role
    if (user.role === 'patient') {
      query = query.eq('patient_id', user.id);
    } else if (user.role === 'counselor') {
      query = query.eq('counselor_id', user.id);
    }

    // Apply optional filters
    const patientId = url.searchParams.get('patientId');
    const counselorId = url.searchParams.get('counselorId');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (counselorId) {
      query = query.eq('counselor_id', counselorId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (offset) {
      query = query.range(Number(offset), Number(offset) + (limit ? Number(limit) : 10) - 1);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('List sessions error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list sessions', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({ sessions: sessions || [], total: sessions?.length || 0, count: sessions?.length || 0, limit: limit ? Number(limit) : 10, offset: offset ? Number(offset) : 0 })),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Update session
 */
async function handleUpdateSession(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Get existing session
    const { data: existingSession, error: getError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (getError || !existingSession) {
      return corsResponse(
        JSON.stringify(errorResponse('Session not found', getError?.message || 'Session does not exist')),
        { status: 404 },
        request
      );
    }

    if (existingSession.patient_id !== user.id && existingSession.counselor_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have permission to update this session')),
        { status: 403 },
        request
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.date !== undefined) updateData.date = body.date;
    if (body.time !== undefined) updateData.time = body.time;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updated_at = new Date().toISOString();

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Update session error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to update session', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(session)),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Reschedule session
 */
async function handleRescheduleSession(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { date, time } = body;

    if (!date || !time) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Date and time are required')),
        { status: 400 },
        request
      );
    }

    return await handleUpdateSession(
      new Request(request.url, {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify({ date, time, status: 'rescheduled' }),
      }),
      sessionId
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Cancel session
 */
async function handleCancelSession(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { reason } = body;

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: existingSession, error: getError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (getError || !existingSession) {
      return corsResponse(
        JSON.stringify(errorResponse('Session not found', getError?.message || 'Session does not exist')),
        { status: 404 },
        request
      );
    }

    if (existingSession.patient_id !== user.id && existingSession.counselor_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have permission to cancel this session')),
        { status: 403 },
        request
      );
    }

    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    if (reason) {
      updateData.notes = reason;
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Cancel session error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to cancel session', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(session, 'Session cancelled successfully')),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Complete session
 */
async function handleCompleteSession(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'counselor', 'admin');

    const body = await request.json();
    const { rating, notes } = body;

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: existingSession, error: getError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (getError || !existingSession) {
      return corsResponse(
        JSON.stringify(errorResponse('Session not found', getError?.message || 'Session does not exist')),
        { status: 404 },
        request
      );
    }

    if (existingSession.counselor_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'Only the counselor can complete this session')),
        { status: 403 },
        request
      );
    }

    const updateData: Record<string, unknown> = {
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Complete session error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to complete session', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(session, 'Session completed successfully')),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Get Jitsi room for session
 */
async function handleGetJitsiRoom(request: Request, sessionId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const apiType = (url.searchParams.get('apiType') as 'react-sdk' | 'iframe' | 'lib-jitsi-meet') || 'react-sdk';

    if (!['react-sdk', 'iframe', 'lib-jitsi-meet'].includes(apiType)) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid apiType', 'Must be: react-sdk, iframe, or lib-jitsi-meet')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: session, error: getError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (getError || !session) {
      return corsResponse(
        JSON.stringify(errorResponse('Session not found', getError?.message || 'Session does not exist')),
        { status: 404 },
        request
      );
    }

    if (session.patient_id !== user.id && session.counselor_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have access to this session')),
        { status: 403 },
        request
      );
    }

    if (session.type !== 'video') {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid session type', 'Jitsi rooms are only available for video sessions')),
        { status: 400 },
        request
      );
    }

    // Return Jitsi room info (simplified - in production, generate JWT token)
    const jitsiDomain = Deno.env.get('JITSI_DOMAIN') || '8x8.vc';
    const jitsiRoomName = `session-${sessionId}`;

    return corsResponse(
      JSON.stringify(successResponse({
        roomName: jitsiRoomName,
        domain: jitsiDomain,
        apiType,
        url: `https://${jitsiDomain}/${jitsiRoomName}`,
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Main handler
 */
serve(async (request: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) {
    return corsResponse;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/sessions', '') || '/';
  const method = request.method;

  try {
    // Extract session ID from path
    const pathParts = path.split('/').filter(Boolean);
    const sessionId = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
    const action = pathParts.length > 1 ? pathParts[1] : null;

    // Route handling
    if (method === 'GET' && path === '/') {
      return await handleListSessions(request);
    }

    if (method === 'POST' && path === '/') {
      return await handleCreateSession(request);
    }

    if (method === 'GET' && sessionId && !action) {
      return await handleGetSession(request, sessionId);
    }

    if (method === 'PUT' && sessionId && !action) {
      return await handleUpdateSession(request, sessionId);
    }

    if (method === 'POST' && sessionId && action === 'reschedule') {
      return await handleRescheduleSession(request, sessionId);
    }

    if (method === 'POST' && sessionId && action === 'cancel') {
      return await handleCancelSession(request, sessionId);
    }

    if (method === 'POST' && sessionId && action === 'complete') {
      return await handleCompleteSession(request, sessionId);
    }

    if (method === 'GET' && sessionId && action === 'jitsi-room') {
      return await handleGetJitsiRoom(request, sessionId);
    }

    // 404 for unknown routes
    return corsResponse(
      JSON.stringify(errorResponse('Not found', 'The requested endpoint does not exist')),
      { status: 404 },
      request
    );
  } catch (error) {
    console.error('Request error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
});

