/**
 * Authentication Edge Function
 * 
 * Handles authentication endpoints:
 * - POST /signup - Register a new user
 * - POST /signin - Sign in an existing user
 * - POST /signout - Sign out the current user
 * - POST /refresh - Refresh access token
 * - GET /me - Get current authenticated user
 * - PUT /profile - Update user profile
 * - POST /change-password - Change password
 * - POST /forgot-password - Request password reset
 * - POST /reset-password - Reset password
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient, getSupabaseServiceClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth, requireRole } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * Sign up a new user
 */
async function handleSignUp(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password, role, fullName, phoneNumber, metadata } = body;

    if (!email || !password || !role) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Email, password, and role are required')),
        { status: 400 },
        request
      );
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          phone_number: phoneNumber,
          ...metadata,
        },
        emailRedirectTo: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (signUpError) {
      return corsResponse(
        JSON.stringify(errorResponse('Sign up failed', signUpError.message)),
        { status: 400 },
        request
      );
    }

    if (!authData.user) {
      return corsResponse(
        JSON.stringify(errorResponse('Failed to create user account')),
        { status: 500 },
        request
      );
    }

    const session = authData.session;
    if (!session) {
      // Email confirmation required
      return corsResponse(
        JSON.stringify(successResponse({
          user: {
            id: authData.user.id,
            email: authData.user.email || email,
            role: (authData.user.user_metadata?.role as string) || role,
            fullName: fullName || authData.user.user_metadata?.full_name,
            phoneNumber: phoneNumber || authData.user.user_metadata?.phone_number,
            metadata: authData.user.user_metadata,
          },
          tokens: {
            accessToken: '',
            refreshToken: '',
            expiresIn: 0,
            expiresAt: 0,
          },
        }, 'Please check your email to confirm your account')),
        { status: 201 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          role: (authData.user.user_metadata?.role as string) || role,
          fullName: fullName || authData.user.user_metadata?.full_name,
          phoneNumber: phoneNumber || authData.user.user_metadata?.phone_number,
          metadata: authData.user.user_metadata,
        },
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
          expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
        },
      })),
      { status: 201 },
      request
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Failed to sign up user', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Sign in an existing user
 */
async function handleSignIn(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Email and password are required')),
        { status: 400 },
        request
      );
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user || !authData.session) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid email or password', signInError?.message || 'Sign in failed')),
        { status: 401 },
        request
      );
    }

    const session = authData.session;
    return corsResponse(
      JSON.stringify(successResponse({
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          role: (authData.user.user_metadata?.role as string) || 'patient',
          fullName: authData.user.user_metadata?.full_name,
          phoneNumber: authData.user.user_metadata?.phone_number,
          metadata: authData.user.user_metadata,
        },
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
          expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
        },
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Failed to sign in user', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Sign out the current user
 */
async function handleSignOut(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
      const supabase = getSupabaseClient(token);
      await supabase.auth.signOut();
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Signed out successfully')),
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
 * Refresh access token
 */
async function handleRefreshToken(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Refresh token is required')),
        { status: 400 },
        request
      );
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !authData.session) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid or expired refresh token', refreshError?.message || 'Token refresh failed')),
        { status: 401 },
        request
      );
    }

    const session = authData.session;
    return corsResponse(
      JSON.stringify(successResponse({
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
          expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
        },
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Failed to refresh token', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Get current authenticated user
 */
async function handleGetCurrentUser(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return corsResponse(
        JSON.stringify(errorResponse('Authentication required')),
        { status: 401 },
        request
      );
    }

    const supabase = getSupabaseClient(token);
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token || undefined);

    if (error || !authUser) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid or expired token', error?.message || 'Failed to get user')),
        { status: 401 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        id: authUser.id,
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as string) || 'patient',
        fullName: authUser.user_metadata?.full_name,
        phoneNumber: authUser.user_metadata?.phone_number,
        metadata: authUser.user_metadata,
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
 * Update user profile
 */
async function handleUpdateProfile(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { fullName, phoneNumber, metadata } = body;

    const supabaseAdmin = getSupabaseServiceClient();
    const updateData: Record<string, unknown> = {};

    if (fullName !== undefined) {
      updateData.full_name = fullName;
    }

    if (phoneNumber !== undefined) {
      updateData.phone_number = phoneNumber;
    }

    if (metadata) {
      Object.assign(updateData, metadata);
    }

    const { data: { user: updatedUser }, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: updateData,
    });

    if (error || !updatedUser) {
      return corsResponse(
        JSON.stringify(errorResponse('Failed to update profile', error?.message || 'Update failed')),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        id: updatedUser.id,
        email: updatedUser.email || '',
        role: (updatedUser.user_metadata?.role as string) || 'patient',
        fullName: updatedUser.user_metadata?.full_name,
        phoneNumber: updatedUser.user_metadata?.phone_number,
        metadata: updatedUser.user_metadata,
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
 * Change password
 */
async function handleChangePassword(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'New password is required')),
        { status: 400 },
        request
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      return corsResponse(
        JSON.stringify(errorResponse('Failed to change password', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Password changed successfully')),
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
 * Request password reset
 */
async function handleForgotPassword(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Email is required')),
        { status: 400 },
        request
      );
    }

    const redirectTo = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/reset-password`;
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error('Forgot password error:', error);
    }

    // Don't expose if user exists or not for security
    return corsResponse(
      JSON.stringify(successResponse(null, 'If an account with that email exists, a password reset link has been sent')),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Failed to send password reset email', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Reset password
 */
async function handleResetPassword(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Email and password are required')),
        { status: 400 },
        request
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      return corsResponse(
        JSON.stringify(errorResponse('Failed to find user', getUserError.message)),
        { status: 500 },
        request
      );
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      return corsResponse(
        JSON.stringify(errorResponse('User not found')),
        { status: 404 },
        request
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) {
      return corsResponse(
        JSON.stringify(errorResponse('Failed to reset password', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Password reset successfully')),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Failed to reset password', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
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
  const path = url.pathname.replace('/auth', '') || '/';
  const method = request.method;

  try {
    // Route handling
    if (method === 'POST' && path === '/signup') {
      return await handleSignUp(request);
    }

    if (method === 'POST' && path === '/signin') {
      return await handleSignIn(request);
    }

    if (method === 'POST' && path === '/signout') {
      return await handleSignOut(request);
    }

    if (method === 'POST' && path === '/refresh') {
      return await handleRefreshToken(request);
    }

    if (method === 'GET' && path === '/me') {
      return await handleGetCurrentUser(request);
    }

    if (method === 'PUT' && path === '/profile') {
      return await handleUpdateProfile(request);
    }

    if (method === 'POST' && path === '/change-password') {
      return await handleChangePassword(request);
    }

    if (method === 'POST' && path === '/forgot-password') {
      return await handleForgotPassword(request);
    }

    if (method === 'POST' && path === '/reset-password') {
      return await handleResetPassword(request);
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

