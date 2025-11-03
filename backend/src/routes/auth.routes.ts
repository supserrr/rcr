/**
 * Authentication routes
 * 
 * All authentication-related endpoints
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  signUpSchema,
  signInSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user (patient or counselor)
 */
router.post('/signup', validate(signUpSchema), authController.signUp);

/**
 * POST /api/auth/signin
 * Sign in an existing user
 */
router.post('/signin', validate(signInSchema), authController.signIn);

/**
 * POST /api/auth/signout
 * Sign out the current user (requires authentication)
 */
router.post('/signout', authenticate, authController.signOut);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * GET /api/auth/me
 * Get current authenticated user (requires authentication)
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

/**
 * POST /api/auth/change-password
 * Change password for authenticated user (requires authentication)
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * POST /api/auth/forgot-password
 * Request password reset email (public endpoint)
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password using reset token (public endpoint)
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;

