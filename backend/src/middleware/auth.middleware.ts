/**
 * Authentication middleware
 * 
 * Verifies JWT tokens and extracts user information from Supabase
 */

import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { AppError } from './error.middleware';
import { logDebug, logError } from '../utils/logger';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader?: string): string | null {
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
 * Authentication middleware
 * Verifies JWT token and sets req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    // Verify token with Supabase
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logDebug('Authentication failed', { error: error?.message });
      throw new AppError('Invalid or expired token.', 401);
    }

    // Set user in request object
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'patient',
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Authentication error', error);
    throw new AppError('Authentication failed.', 401);
  }
}

/**
 * Optional authentication middleware
 * Sets req.user if token is valid, but doesn't require it
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'patient',
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if there's an error
    next();
  }
}

/**
 * Role-based access control middleware
 * Requires user to have one of the specified roles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions.', 403);
    }

    next();
  };
}

/**
 * Middleware to require patient role
 */
export const requirePatient = requireRole('patient');

/**
 * Middleware to require counselor role
 */
export const requireCounselor = requireRole('counselor');

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin');

