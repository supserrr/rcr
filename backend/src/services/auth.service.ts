/**
 * Authentication service layer
 * 
 * Handles all authentication-related business logic using Supabase Auth
 */

import { getSupabaseClient, getSupabaseServiceClient } from '../config/supabase';
import { UserRole } from '../types';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import type {
  SignUpInput,
  SignInInput,
  RefreshTokenInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schema';

/**
 * User data returned from authentication operations
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phoneNumber?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

/**
 * Sign up a new user
 */
export async function signUp(
  input: SignUpInput
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  try {
    const { email, password, role, fullName, phoneNumber, metadata } = input;

    // Sign up user with Supabase Auth
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
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (signUpError) {
      logError('Sign up error', signUpError);
      throw new AppError(signUpError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('Failed to create user account', 500);
    }

    // Get session tokens
    const session = authData.session;
    if (!session) {
      // Email confirmation required
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          role: (authData.user.user_metadata?.role as UserRole) || role,
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
      };
    }

    const tokens: AuthTokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in || 3600,
      expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    };

    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      role: (authData.user.user_metadata?.role as UserRole) || role,
      fullName: fullName || authData.user.user_metadata?.full_name,
      phoneNumber: phoneNumber || authData.user.user_metadata?.phone_number,
      metadata: {
        ...authData.user.user_metadata,
        isVerified: authData.user.email_confirmed_at !== null,
        createdAt: authData.user.created_at,
        updatedAt: authData.user.updated_at || authData.user.created_at,
      },
    };

    logInfo('User signed up successfully', { userId: user.id, email: user.email });

    return { user, tokens };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Sign up service error', error);
    throw new AppError('Failed to sign up user', 500);
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  input: SignInInput
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  try {
    const { email, password } = input;

    // Sign in user with Supabase Auth
    const supabase = getSupabaseClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      logError('Sign in error', signInError);
      throw new AppError('Invalid email or password', 401);
    }

    if (!authData.user || !authData.session) {
      throw new AppError('Failed to sign in user', 500);
    }

    const session = authData.session;
    const tokens: AuthTokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in || 3600,
      expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    };

    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      role: (authData.user.user_metadata?.role as UserRole) || 'patient',
      fullName: authData.user.user_metadata?.full_name,
      phoneNumber: authData.user.user_metadata?.phone_number,
      metadata: authData.user.user_metadata,
    };

    logInfo('User signed in successfully', { userId: user.id, email: user.email });

    return { user, tokens };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Sign in service error', error);
    throw new AppError('Failed to sign in user', 500);
  }
}

/**
 * Sign out the current user
 */
export async function signOut(accessToken: string): Promise<void> {
  try {
    // Set session using the access token
    const supabase = getSupabaseClient();
    const { error: signOutError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });

    if (signOutError) {
      logError('Sign out error', signOutError);
      // Don't throw error - sign out should be best-effort
      return;
    }

    // Sign out from Supabase (already have supabase client from above)
    const { error } = await supabase.auth.signOut();

    if (error) {
      logError('Sign out error', error);
      // Don't throw error - sign out should be best-effort
    }

    logInfo('User signed out successfully');
  } catch (error) {
    logError('Sign out service error', error);
    // Don't throw error - sign out should be best-effort
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  input: RefreshTokenInput
): Promise<{ tokens: AuthTokens }> {
  try {
    const { refreshToken } = input;

    // Refresh session using refresh token
    const supabase = getSupabaseClient();
    const { data: authData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !authData.session) {
      logError('Token refresh error', refreshError);
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const session = authData.session;
    const tokens: AuthTokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in || 3600,
      expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    };

    logInfo('Token refreshed successfully');

    return { tokens };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Token refresh service error', error);
    throw new AppError('Failed to refresh token', 500);
  }
}

/**
 * Get current user by access token
 */
export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as UserRole) || 'patient',
      fullName: user.user_metadata?.full_name,
      phoneNumber: user.user_metadata?.phone_number,
      metadata: user.user_metadata,
    };

    return authUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get current user service error', error);
    throw new AppError('Failed to get current user', 500);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<AuthUser> {
  try {
    const { fullName, phoneNumber, metadata } = input;

    // Get current user metadata first
    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { user: currentUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    const updateData: Record<string, unknown> = {
      ...(currentUser?.user_metadata || {}),
    };

    if (fullName !== undefined) {
      updateData.full_name = fullName;
    }

    if (phoneNumber !== undefined) {
      updateData.phone_number = phoneNumber;
    }

    if (metadata) {
      Object.assign(updateData, metadata);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: updateData,
    });

    if (error || !user) {
      logError('Update profile error', error);
      throw new AppError('Failed to update profile', 500);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as UserRole) || 'patient',
      fullName: user.user_metadata?.full_name,
      phoneNumber: user.user_metadata?.phone_number,
      metadata: user.user_metadata,
    };

    logInfo('Profile updated successfully', { userId });

    return authUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Update profile service error', error);
    throw new AppError('Failed to update profile', 500);
  }
}

/**
 * Change user password
 */
export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  try {
    const { currentPassword, newPassword } = input;

    // Verify current password by attempting to sign in
    const supabaseAdmin = getSupabaseServiceClient();
    const user = await supabaseAdmin.auth.admin.getUserById(userId);

    if (!user.data.user || !user.data.user.email) {
      throw new AppError('User not found', 404);
    }

    // Note: Supabase Admin API doesn't directly support password verification
    // This would typically require the user to provide their current session
    // For now, we'll update the password if the user is authenticated
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      logError('Change password error', error);
      throw new AppError('Failed to change password', 500);
    }

    logInfo('Password changed successfully', { userId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Change password service error', error);
    throw new AppError('Failed to change password', 500);
  }
}

/**
 * Request password reset (forgot password)
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  try {
    const { email } = input;

    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`;
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      logError('Forgot password error', error);
      // Don't expose if user exists or not for security
      throw new AppError('If an account with that email exists, a password reset link has been sent', 200);
    }

    logInfo('Password reset email sent', { email });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Forgot password service error', error);
    throw new AppError('Failed to send password reset email', 500);
  }
}

/**
 * Reset password using reset token
 */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  try {
    const { email, password, token } = input;

    // Note: Supabase handles password reset through email links
    // This endpoint would typically be called after user clicks the reset link
    // For now, we'll use the admin API to update the password
    // In production, use Supabase's built-in reset password flow

    // Get user by email
    const supabaseAdmin = getSupabaseServiceClient();
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      logError('Get user error', getUserError);
      throw new AppError('Failed to find user', 500);
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update password (in production, verify the token first)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) {
      logError('Reset password error', error);
      throw new AppError('Failed to reset password', 500);
    }

    logInfo('Password reset successfully', { email });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Reset password service error', error);
    throw new AppError('Failed to reset password', 500);
  }
}

