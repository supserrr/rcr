/**
 * Authentication utilities for Edge Functions
 * 
 * Verifies JWT tokens and extracts user information from Supabase
 */

import { getSupabaseClient } from './supabase.ts';

/**
 * User information extracted from token
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate request and return user
 * 
 * @param request - Request object
 * @returns Authenticated user or null if not authenticated
 */
export async function authenticateRequest(request: Request): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return null;
    }

    const supabase = getSupabaseClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token || undefined);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as string) || 'patient',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * 
 * @param request - Request object
 * @returns Authenticated user
 * @throws Error if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthenticatedUser> {
  const user = await authenticateRequest(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Check if user has required role
 * 
 * @param user - Authenticated user
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has required role
 */
export function hasRole(user: AuthenticatedUser, ...allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Require role - throws error if user doesn't have required role
 * 
 * @param user - Authenticated user
 * @param allowedRoles - Array of allowed roles
 * @throws Error if user doesn't have required role
 */
export function requireRole(user: AuthenticatedUser, ...allowedRoles: string[]): void {
  if (!hasRole(user, ...allowedRoles)) {
    const error = new Error('Insufficient permissions');
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

