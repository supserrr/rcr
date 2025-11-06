/**
 * Notifications Edge Function
 * 
 * Handles notification endpoints:
 * - GET / - List notifications for user
 * - GET /:id - Get notification by ID
 * - POST / - Create notification
 * - POST /read - Mark notifications as read
 * - DELETE /:id - Delete notification
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * List notifications
 */
async function handleListNotifications(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const read = url.searchParams.get('read');
    const type = url.searchParams.get('type');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    if (read !== null) {
      query = query.eq('is_read', read === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (offset) {
      query = query.range(Number(offset), Number(offset) + (limit ? Number(limit) : 10) - 1);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('List notifications error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list notifications', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({ notifications: notifications || [], total: notifications?.length || 0, count: notifications?.length || 0, unreadCount: (notifications || []).filter((n: any) => !n.is_read).length, limit: limit ? Number(limit) : 10, offset: offset ? Number(offset) : 0 })),
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
 * Get notification by ID
 */
async function handleGetNotification(request: Request, notificationId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single();

    if (error || !notification) {
      return corsResponse(
        JSON.stringify(errorResponse('Notification not found', error?.message || 'Notification does not exist')),
        { status: 404 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(notification)),
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
 * Create notification
 */
async function handleCreateNotification(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!type || !title || !message) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Type, title, and message are required')),
        { status: 400 },
        request
      );
    }

    // Users can only create notifications for themselves unless they're admin
    const targetUserId = userId && user.role === 'admin' ? userId : user.id;

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);
    const notificationData = {
      user_id: targetUserId,
      type,
      title,
      message,
      data: data || null,
      is_read: false,
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Create notification error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to create notification', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(notification)),
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
 * Mark notifications as read
 */
async function handleMarkNotificationsRead(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Notification IDs are required')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .eq('user_id', user.id);

    if (error) {
      console.error('Mark notifications read error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to mark notifications as read', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Notifications marked as read')),
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
 * Delete notification
 */
async function handleDeleteNotification(request: Request, notificationId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete notification error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to delete notification', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Notification deleted successfully')),
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
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) {
    return corsResponse;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/notifications', '') || '/';
  const method = request.method;

  try {
    const pathParts = path.split('/').filter(Boolean);
    const notificationId = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
    const action = pathParts.length > 1 ? pathParts[1] : null;

    if (method === 'GET' && path === '/') {
      return await handleListNotifications(request);
    }

    if (method === 'POST' && path === '/') {
      return await handleCreateNotification(request);
    }

    if (method === 'POST' && path === '/read') {
      return await handleMarkNotificationsRead(request);
    }

    if (method === 'GET' && notificationId && !action) {
      return await handleGetNotification(request, notificationId);
    }

    if (method === 'DELETE' && notificationId && !action) {
      return await handleDeleteNotification(request, notificationId);
    }

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

