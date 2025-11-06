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
 * List users
 */
async function handleListUsers(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    const url = new URL(request.url);
    const supabaseAdmin = getSupabaseServiceClient();

    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const role = url.searchParams.get('role');

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: offset ? Math.floor(Number(offset) / (limit ? Number(limit) : 10)) + 1 : 1,
      perPage: limit ? Number(limit) : 10,
    });

    if (error) {
      console.error('List users error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list users', error.message)),
        { status: 500 },
        request
      );
    }

    let filteredUsers = users || [];

    if (role) {
      filteredUsers = filteredUsers.filter((u) => u.user_metadata?.role === role);
    }

    const formattedUsers = filteredUsers.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'patient',
      fullName: u.user_metadata?.full_name,
      phoneNumber: u.user_metadata?.phone_number,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    return corsResponse(
      JSON.stringify(successResponse({ users: formattedUsers, total: formattedUsers.length, count: formattedUsers.length, limit: limit ? Number(limit) : 10, offset: offset ? Number(offset) : 0 })),
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
        request
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
 * Update user role
 */
async function handleUpdateUserRole(request: Request, userId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { role } = body;

    if (!role || !['patient', 'counselor', 'admin'].includes(role)) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid role', 'Role must be patient, counselor, or admin')),
        { status: 400 },
        request
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !targetUser) {
      return corsResponse(
        JSON.stringify(errorResponse('User not found', getUserError?.message || 'User does not exist')),
        { status: 404 },
        request
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
        request
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
        request
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Delete user error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to delete user', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'User deleted successfully')),
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
  const path = url.pathname.replace('/admin', '') || '/';
  const method = request.method;

  try {
    const pathParts = path.split('/').filter(Boolean);
    const resource = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
    const resourceId = pathParts.length > 1 ? pathParts[1] : null;
    const action = pathParts.length > 2 ? pathParts[2] : null;

    if (method === 'GET' && path === '/analytics') {
      return await handleGetAnalytics(request);
    }

    if (method === 'GET' && resource === 'users' && !resourceId) {
      return await handleListUsers(request);
    }

    if (method === 'GET' && resource === 'users' && resourceId && !action) {
      return await handleGetUser(request, resourceId);
    }

    if (method === 'PUT' && resource === 'users' && resourceId && action === 'role') {
      return await handleUpdateUserRole(request, resourceId);
    }

    if (method === 'DELETE' && resource === 'users' && resourceId && !action) {
      return await handleDeleteUser(request, resourceId);
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

