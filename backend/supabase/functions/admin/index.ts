/**
 * Admin Edge Function
 * 
 * Handles admin endpoints (admin only):
 * - GET /analytics - Get platform analytics
 * - GET /users - List users
 * - GET /users/:id - Get user by ID
 * - PUT /users/:id/role - Update user role
 * - DELETE /users/:id - Delete user
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient, getSupabaseServiceClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth, requireRole } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

const corsOptions = {
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Client-Info',
    'apikey',
    'X-Supabase-Api-Version',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
    'Range',
    'Prefer',
    'Content-Profile',
    'Accept-Profile',
  ],
};

/**
 * Get analytics
 */
async function handleGetAnalytics(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Get counts from various tables
    const [usersCount, sessionsCount, chatsCount, resourcesCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('chats').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
    ]);

    return corsResponse(
      JSON.stringify(successResponse({
        users: usersCount.count || 0,
        sessions: sessionsCount.count || 0,
        chats: chatsCount.count || 0,
        resources: resourcesCount.count || 0,
      })),
      { status: 200 },
      request,
      corsOptions
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request,
      corsOptions
    );
  }
}

/**
 * List users
 */
async function handleListUsers(request: Request, params?: { limit?: number; offset?: number; role?: string; isVerified?: boolean; search?: string }): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    const url = new URL(request.url);
    const supabaseAdmin = getSupabaseServiceClient();

    // Get params from URL query string or from function params
    const limit = params?.limit || (url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 50);
    const offset = params?.offset || (url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0);
    const role = params?.role || url.searchParams.get('role');
    const isVerified = params?.isVerified !== undefined ? params.isVerified : (url.searchParams.get('isVerified') === 'true');
    const search = params?.search || url.searchParams.get('search');

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: offset ? Math.floor(Number(offset) / (limit ? Number(limit) : 50)) + 1 : 1,
      perPage: limit ? Number(limit) : 50,
    });

    if (error) {
      console.error('List users error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list users', error.message)),
        { status: 500 },
        request,
        corsOptions
      );
    }

    let filteredUsers = users || [];

    if (role) {
      filteredUsers = filteredUsers.filter((u) => u.user_metadata?.role === role);
    }

    if (isVerified !== undefined) {
      filteredUsers = filteredUsers.filter((u) => !!u.email_confirmed_at === isVerified);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter((u) => 
        u.email?.toLowerCase().includes(searchLower) ||
        u.user_metadata?.full_name?.toLowerCase().includes(searchLower)
      );
    }

    const formattedUsers = filteredUsers.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'patient',
      fullName: u.user_metadata?.full_name,
      phoneNumber: u.user_metadata?.phone_number,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      isVerified: !!u.email_confirmed_at,
    }));

    return corsResponse(
      JSON.stringify(successResponse({ 
        users: formattedUsers, 
        total: formattedUsers.length, 
        count: formattedUsers.length, 
        limit: Number(limit), 
        offset: Number(offset) 
      })),
      { status: 200 },
      request,
      corsOptions
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request,
      corsOptions
    );
  }
}

/**
 * Get user by ID
 */
async function handleGetUser(request: Request, userId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { user: targetUser }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !targetUser) {
      return corsResponse(
        JSON.stringify(errorResponse('User not found', error?.message || 'User does not exist')),
        { status: 404 },
        request,
        corsOptions
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.user_metadata?.role || 'patient',
        fullName: targetUser.user_metadata?.full_name,
        phoneNumber: targetUser.user_metadata?.phone_number,
        createdAt: targetUser.created_at,
        updatedAt: targetUser.updated_at,
      })),
      { status: 200 },
      request,
      corsOptions
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request,
      corsOptions
    );
  }
}

/**
 * Update user role
 */
async function handleUpdateUserRole(request: Request, userId: string, body?: any): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    // Get role from body if provided, otherwise parse from request
    let role: string | undefined;
    if (body && body.role) {
      role = body.role;
    } else {
      try {
        const requestBody = await request.json();
        role = requestBody.role;
      } catch {
        // Body might already be parsed
      }
    }

    if (!role || !['patient', 'counselor', 'admin'].includes(role)) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid role', 'Role must be patient, counselor, or admin')),
        { status: 400 },
        request,
        corsOptions
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !targetUser) {
      return corsResponse(
        JSON.stringify(errorResponse('User not found', getUserError?.message || 'User does not exist')),
        { status: 404 },
        request,
        corsOptions
      );
    }

    const { data: { user: updatedUser }, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...targetUser.user_metadata,
        role,
      },
    });

    if (error || !updatedUser) {
      console.error('Update user role error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to update user role', error?.message || 'Update failed')),
        { status: 500 },
        request,
        corsOptions
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.user_metadata?.role || 'patient',
        fullName: updatedUser.user_metadata?.full_name,
        phoneNumber: updatedUser.user_metadata?.phone_number,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      })),
      { status: 200 },
      request,
      corsOptions
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request,
      corsOptions
    );
  }
}

/**
 * Delete user
 */
async function handleDeleteUser(request: Request, userId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    if (userId === user.id) {
      return corsResponse(
        JSON.stringify(errorResponse('Cannot delete yourself', 'You cannot delete your own account')),
        { status: 400 },
        request,
        corsOptions
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Delete user error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to delete user', error.message)),
        { status: 500 },
        request,
        corsOptions
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'User deleted successfully')),
      { status: 200 },
      request,
      corsOptions
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request,
      corsOptions
    );
  }
}

/**
 * Main handler
 */
serve(async (request: Request) => {
  const preflightResponse = handleCorsPreflight(request, corsOptions);
  if (preflightResponse) {
    return preflightResponse;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/admin', '') || '/';
  const method = request.method;

  try {
    // Support both pathname-based routing (for direct HTTP calls) and body-based routing (for invoke calls)
    let action: string | null = null;
    let resourceId: string | null = null;
    let body: any = null;

    // Try to parse body for invoke calls (POST requests)
    if (method === 'POST') {
      try {
        const clonedRequest = request.clone();
        body = await clonedRequest.json();
        if (body && body.action) {
          action = body.action;
          resourceId = body.userId || body.id || null;
        }
      } catch {
        // Body might be empty or not JSON - use pathname-based routing
      }
    }

    // Use pathname-based routing (for direct HTTP calls)
    if (!action) {
    const pathParts = path.split('/').filter(Boolean);
    const resource = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
      resourceId = pathParts.length > 1 ? pathParts[1] : null;
      const pathAction = pathParts.length > 2 ? pathParts[2] : null;

    if (method === 'GET' && path === '/analytics') {
      return await handleGetAnalytics(request);
    }

    if (method === 'GET' && resource === 'users' && !resourceId) {
      return await handleListUsers(request);
    }

      if (method === 'GET' && resource === 'users' && resourceId && !pathAction) {
        return await handleGetUser(request, resourceId);
      }

      if (method === 'PUT' && resource === 'users' && resourceId && pathAction === 'role') {
        return await handleUpdateUserRole(request, resourceId);
      }

      if (method === 'DELETE' && resource === 'users' && resourceId && !pathAction) {
        return await handleDeleteUser(request, resourceId);
      }
    }

    // Handle invoke-based calls (POST with action in body)
    if (action === 'listUsers') {
      return await handleListUsers(request, {
        limit: body?.limit,
        offset: body?.offset,
        role: body?.role,
        isVerified: body?.isVerified,
        search: body?.search,
      });
    }

    if (action === 'getUser') {
      if (!resourceId) {
        return corsResponse(
          JSON.stringify(errorResponse('Bad request', 'User ID is required')),
          { status: 400 },
          request,
          corsOptions
        );
      }
      return await handleGetUser(request, resourceId);
    }

    if (action === 'updateUserRole') {
      if (!resourceId) {
        return corsResponse(
          JSON.stringify(errorResponse('Bad request', 'User ID is required')),
          { status: 400 },
          request,
          corsOptions
        );
      }
      return await handleUpdateUserRole(request, resourceId, body);
    }

    if (action === 'deleteUser') {
      if (!resourceId) {
        return corsResponse(
          JSON.stringify(errorResponse('Bad request', 'User ID is required')),
          { status: 400 },
          request,
          corsOptions
        );
      }
      return await handleDeleteUser(request, resourceId);
    }

    return corsResponse(
      JSON.stringify(errorResponse('Not found', 'The requested endpoint does not exist')),
      { status: 404 },
      request,
      corsOptions
    );
  } catch (error) {
    console.error('Request error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request,
      corsOptions
    );
  }
});

