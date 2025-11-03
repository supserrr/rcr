/**
 * Admin validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Update user role request body schema
 */
export const updateUserRoleBodySchema = z.object({
  role: z.enum(['patient', 'counselor', 'admin'] as const, {
    message: 'Role must be patient, counselor, or admin',
  }),
});

/**
 * Update user role request schema
 */
export const updateUserRoleSchema = {
  body: updateUserRoleBodySchema,
};

/**
 * User ID parameter schema
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

/**
 * User ID parameter validation schema
 */
export const userIdParamValidationSchema = {
  params: userIdParamSchema,
};

/**
 * Analytics query parameters schema
 */
export const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  groupBy: z.enum(['day', 'week', 'month'] as const).optional(),
});

/**
 * Analytics query validation schema
 */
export const analyticsQueryValidationSchema = {
  query: analyticsQuerySchema,
};

/**
 * User query parameters schema
 */
export const userQuerySchema = z.object({
  role: z.enum(['patient', 'counselor', 'admin'] as const).optional(),
  search: z.string().optional(),
  isVerified: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
});

/**
 * User query validation schema
 */
export const userQueryValidationSchema = {
  query: userQuerySchema,
};

/**
 * Type exports
 */
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleBodySchema>;
export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;

