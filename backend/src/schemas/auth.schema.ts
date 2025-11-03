/**
 * Authentication validation schemas using Zod
 */

import { z } from 'zod';
import { UserRole } from '../types';

/**
 * Sign up request body schema
 */
export const signUpBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  role: z.enum(['patient', 'counselor'] as const, {
    message: 'Role must be either patient or counselor',
  }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phoneNumber: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Sign up request schema
 */
export const signUpSchema = {
  body: signUpBodySchema,
};

/**
 * Sign in request body schema
 */
export const signInBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Sign in request schema
 */
export const signInSchema = {
  body: signInBodySchema,
};

/**
 * Refresh token request body schema
 */
export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = {
  body: refreshTokenBodySchema,
};

/**
 * Update profile request body schema
 */
export const updateProfileBodySchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phoneNumber: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update profile request schema
 */
export const updateProfileSchema = {
  body: updateProfileBodySchema,
};

/**
 * Change password request body schema
 */
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
});

/**
 * Change password request schema
 */
export const changePasswordSchema = {
  body: changePasswordBodySchema,
};

/**
 * Forgot password request body schema
 */
export const forgotPasswordBodySchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = {
  body: forgotPasswordBodySchema,
};

/**
 * Reset password request body schema
 */
export const resetPasswordBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  token: z.string().min(1, 'Reset token is required'),
});

/**
 * Reset password request schema
 */
export const resetPasswordSchema = {
  body: resetPasswordBodySchema,
};

/**
 * Type exports
 */
export type SignUpInput = z.infer<typeof signUpBodySchema>;
export type SignInInput = z.infer<typeof signInBodySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

