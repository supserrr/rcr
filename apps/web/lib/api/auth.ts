/**
 * Authentication API service
 * 
 * Handles all authentication-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';
import type { User, SignInCredentials, SignUpCredentials } from '../auth';

/**
 * Sign up response
 */
export interface SignUpResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Sign in response
 */
export interface SignInResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: 'patient' | 'counselor' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  onboardingCompleted?: boolean;
}

/**
 * Authentication API service
 */
export class AuthApi {
  /**
   * Sign up a new user using Supabase
   */
  static async signUp(credentials: SignUpCredentials): Promise<SignInResponse> {
    const supabase = createClient();
    if (!supabase) {
      // Check if env vars are actually set
      const hasUrl = typeof window !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_URL : false;
      const hasKey = typeof window !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : false;
      
      throw new Error(
        `Supabase is not configured. ` +
        `URL: ${hasUrl ? 'Set' : 'Missing'}, ` +
        `Key: ${hasKey ? 'Set' : 'Missing'}. ` +
        `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables and redeploy.`
      );
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      options: {
        data: {
          full_name: credentials.name,
        role: credentials.role,
        },
      },
    });

    if (error) {
      // Provide more helpful error messages
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT') || error.message?.includes('invalid_token')) {
        // Log the actual error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('Supabase signUp error:', error);
        }
        throw new Error(
          'Invalid Supabase API key. Please verify: ' +
          '1. NEXT_PUBLIC_SUPABASE_ANON_KEY matches the anon/public key from Supabase Settings → API. ' +
          '2. The key is set in Vercel Environment Variables (not just .env.local). ' +
          '3. You have redeployed after setting the variables. ' +
          '4. The key is the anon/public key (not the service_role key).'
        );
      }
      if (error.message?.includes('Invalid URL') || error.message?.includes('fetch')) {
        throw new Error(
          'Invalid Supabase URL. Please verify: ' +
          '1. NEXT_PUBLIC_SUPABASE_URL is set to https://your-project-id.supabase.co ' +
          '2. The URL is set in Vercel Environment Variables. ' +
          '3. You have redeployed after setting the variables.'
        );
      }
      throw new Error(error.message || 'Failed to create account');
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    // Handle case where email confirmation is required (no session)
    if (!data.session) {
      // Transform user to User type
      const userMetadata = data.user.user_metadata || {};
      const user: User = {
        id: data.user.id,
        email: data.user.email || credentials.email,
        name: userMetadata.full_name || credentials.name,
        role: (userMetadata.role as User['role']) || credentials.role,
        avatar: userMetadata.avatar_url,
        isVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
      };

      // Return with empty tokens - user needs to confirm email
      return {
        user,
        tokens: {
          accessToken: '',
          refreshToken: '',
        },
      };
    }

    // Transform user to User type
    const userMetadata = data.user.user_metadata || {};
    const user: User = {
      id: data.user.id,
      email: data.user.email || credentials.email,
      name: userMetadata.full_name || credentials.name,
      role: (userMetadata.role as User['role']) || credentials.role,
      avatar: userMetadata.avatar_url,
      isVerified: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    };

    return {
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Sign in an existing user using Supabase
   */
  static async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in');
      }

    if (!data.user || !data.session) {
      throw new Error('Failed to sign in - no user or session returned');
    }

    // Transform user to User type
    const userMetadata = data.user.user_metadata || {};
    const user: User = {
      id: data.user.id,
      email: data.user.email || credentials.email,
      name: userMetadata.full_name || data.user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: userMetadata.avatar_url,
      isVerified: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    };

    return {
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Sign out current user using Supabase
   */
  static async signOut(): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  /**
   * Get current user profile using Supabase
   */
  static async getCurrentUser(): Promise<User> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error(error?.message || 'Failed to get current user');
    }

    const userMetadata = user.user_metadata || {};
    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: userMetadata.full_name || user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: userMetadata.avatar_url,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      metadata: userMetadata,
    } as User & { metadata?: Record<string, unknown> };

    return userData;
  }

  /**
   * Refresh authentication token using Supabase
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error || !session) {
      throw new Error(error?.message || 'Failed to refresh session');
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }

  /**
   * Update user profile using Supabase
   */
  static async updateProfile(data: {
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    metadata?: Record<string, unknown>;
  }): Promise<User> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user first
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !currentUser) {
      throw new Error(getUserError?.message || 'Failed to get current user');
    }

    // Update user metadata
    const updateData: Record<string, unknown> = {
      ...currentUser.user_metadata,
      ...(data.fullName && { full_name: data.fullName }),
      ...(data.phoneNumber && { phone_number: data.phoneNumber }),
      ...(data.avatar && { avatar_url: data.avatar }),
      ...(data.metadata && { ...data.metadata }),
    };

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (error || !user) {
      throw new Error(error?.message || 'Failed to update profile');
    }

    const userMetadata = user.user_metadata || {};
    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: userMetadata.full_name || user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: userMetadata.avatar_url,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      metadata: userMetadata,
    } as User & { metadata?: Record<string, unknown> };

    return userData;
  }

  /**
   * Upload profile image using Supabase Storage
   */
  static async uploadProfileImage(file: File): Promise<{ url: string; user: User }> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !currentUser) {
      throw new Error(getUserError?.message || 'Failed to get current user');
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user metadata with avatar URL
    const { data: { user }, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...currentUser.user_metadata,
        avatar_url: publicUrl,
      },
    });

    if (updateError || !user) {
      throw new Error(updateError?.message || 'Failed to update user profile');
    }

    const userMetadata = user.user_metadata || {};
    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: userMetadata.full_name || user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: publicUrl,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    };

    return {
      url: publicUrl,
      user: userData,
    };
  }

  /**
   * Change password using Supabase
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Update password with Supabase
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Request password reset using Supabase
   */
  static async forgotPassword(email: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * Reset password with token using Supabase
   */
  static async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Supabase handles password reset through the session
    // The token is typically handled via URL hash or query params
    // For now, we'll update the password if there's an active session
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
}

