/**
 * Authentication API service
 * 
 * Handles all authentication-related API calls
 */

import { api } from './client';
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
}

/**
 * Authentication API service
 */
export class AuthApi {
  /**
   * Sign up a new user
   */
  static async signUp(credentials: SignUpCredentials): Promise<SignInResponse> {
    const response = await api.post<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/signup',
      {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
        fullName: credentials.name,
      }
    );

    // Handle case where email confirmation is required (no tokens)
    if (!response.tokens || !response.tokens.accessToken) {
      // Transform user profile to User type
      const userMetadata = response.user.metadata || {};
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.fullName || '',
        role: response.user.role,
        avatar: response.user.avatar,
        isVerified: (userMetadata.isVerified as boolean) || false,
        createdAt: userMetadata.createdAt ? new Date(userMetadata.createdAt as string) : new Date(),
        updatedAt: userMetadata.updatedAt ? new Date(userMetadata.updatedAt as string) : new Date(),
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

    // Store token
    api.setAuthToken(response.tokens.accessToken);

    // Transform user profile to User type
    const userMetadata = response.user.metadata || {};
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.fullName || '',
      role: response.user.role,
      avatar: response.user.avatar,
      isVerified: (userMetadata.isVerified as boolean) || false,
      createdAt: userMetadata.createdAt ? new Date(userMetadata.createdAt as string) : new Date(),
      updatedAt: userMetadata.updatedAt ? new Date(userMetadata.updatedAt as string) : new Date(),
    };

    return {
      user,
      tokens: response.tokens,
    };
  }

  /**
   * Sign in an existing user
   */
  static async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    const response = await api.post<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/signin',
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    // Store token
    api.setAuthToken(response.tokens.accessToken);

    // Transform user profile to User type
    const userMetadata = response.user.metadata || {};
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.fullName || response.user.email || '',
      role: response.user.role,
      avatar: response.user.avatar,
      isVerified: (userMetadata.isVerified as boolean) ?? response.user.isVerified ?? false,
      createdAt: response.user.createdAt ? new Date(response.user.createdAt) : new Date(),
      updatedAt: response.user.updatedAt ? new Date(response.user.updatedAt) : new Date(),
    };

    return {
      user,
      tokens: response.tokens,
    };
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      // Continue with sign out even if API call fails
      console.error('Sign out API call failed:', error);
    } finally {
      api.clearAuthToken();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: UserProfile }>('/auth/me');

    const userMetadata = response.user.metadata || {};
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.fullName || response.user.email || '',
      role: response.user.role,
      avatar: response.user.avatar,
      isVerified: (userMetadata.isVerified as boolean) ?? response.user.isVerified ?? false,
      createdAt: response.user.createdAt ? new Date(response.user.createdAt) : new Date(),
      updatedAt: response.user.updatedAt ? new Date(response.user.updatedAt) : new Date(),
    };

    return user;
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );

    api.setAuthToken(response.tokens.accessToken);
    localStorage.setItem('refresh-token', response.tokens.refreshToken);

    return response.tokens;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: {
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<User> {
    const response = await api.put<{ user: UserProfile }>(
      '/auth/profile',
      data
    );

    const userMetadata = response.user.metadata || {};
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.fullName || response.user.email || '',
      role: response.user.role,
      avatar: response.user.avatar,
      isVerified: (userMetadata.isVerified as boolean) ?? response.user.isVerified ?? false,
      createdAt: response.user.createdAt ? new Date(response.user.createdAt) : new Date(),
      updatedAt: response.user.updatedAt ? new Date(response.user.updatedAt) : new Date(),
    };

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<void> {
    // Note: Edge Function expects email field, but we don't have it in the token
    // The token should contain the email, or we need to get it from the user
    // For now, we'll pass an empty email and let the Edge Function handle it
    await api.post('/auth/reset-password', { email: '', password: data.password, token: data.token });
  }
}

