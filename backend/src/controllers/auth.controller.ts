/**
 * Authentication controller
 * 
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as storageService from '../services/storage.service';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
export async function signUp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.signUp(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Sign in an existing user
 * POST /api/auth/signin
 */
export async function signIn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.signIn(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Sign out the current user
 * POST /api/auth/signout
 */
export async function signOut(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1] || '';
    await authService.signOut(token);
    res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.refreshToken(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const token = req.headers.authorization?.split(' ')[1] || '';
    const user = await authService.getCurrentUser(token);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    await authService.changePassword(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload profile image
 * POST /api/auth/profile/upload
 */
export async function uploadProfileImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const file = (req as any).file;
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only JPG and PNG images are allowed', 400);
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new AppError('File size too large. Maximum size is 2MB', 400);
    }

    // Upload to Supabase Storage
    const userId = req.user.id;
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    // Store in user's folder: profiles/{userId}/{fileName}
    const filePath = `${userId}/${fileName}`;

    const uploadResult = await storageService.uploadFile({
      bucket: 'avatars',
      path: filePath,
      file: file.buffer,
      contentType: file.mimetype,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update user profile with avatar URL
    const user = await authService.updateProfile(userId, {
      metadata: {
        avatar_url: uploadResult.publicUrl,
      },
    });

    logInfo('Profile image uploaded successfully', { userId, url: uploadResult.publicUrl });

    res.status(200).json({
      success: true,
      data: {
        url: uploadResult.publicUrl,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

