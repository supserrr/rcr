/**
 * Session validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Create session request body schema
 */
export const createSessionBodySchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  counselorId: z.string().uuid('Invalid counselor ID format'),
  date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(120, 'Duration must be at most 120 minutes'),
  type: z.enum(['video', 'audio', 'chat'] as const, {
    message: 'Session type must be video, audio, or chat',
  }),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
});

/**
 * Create session request schema
 */
export const createSessionSchema = {
  body: createSessionBodySchema,
};

/**
 * Update session request body schema
 */
export const updateSessionBodySchema = z.object({
  date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')).optional(),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(120, 'Duration must be at most 120 minutes').optional(),
  type: z.enum(['video', 'audio', 'chat'] as const, {
    message: 'Session type must be video, audio, or chat',
  }).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled'] as const, {
    message: 'Status must be scheduled, completed, cancelled, or rescheduled',
  }).optional(),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
});

/**
 * Update session request schema
 */
export const updateSessionSchema = {
  body: updateSessionBodySchema,
};

/**
 * Reschedule session request body schema
 */
export const rescheduleSessionBodySchema = z.object({
  date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

/**
 * Reschedule session request schema
 */
export const rescheduleSessionSchema = {
  body: rescheduleSessionBodySchema,
};

/**
 * Cancel session request body schema
 */
export const cancelSessionBodySchema = z.object({
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

/**
 * Cancel session request schema
 */
export const cancelSessionSchema = {
  body: cancelSessionBodySchema,
};

/**
 * Complete session request body schema
 */
export const completeSessionBodySchema = z.object({
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
});

/**
 * Complete session request schema
 */
export const completeSessionSchema = {
  body: completeSessionBodySchema,
};

/**
 * Session query parameters schema
 */
export const sessionQuerySchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format').optional(),
  counselorId: z.string().uuid('Invalid counselor ID format').optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled'] as const).optional(),
  type: z.enum(['video', 'audio', 'chat'] as const).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
});

/**
 * Session query schema for route validation
 */
export const sessionQueryValidationSchema = {
  query: sessionQuerySchema,
};

/**
 * Session ID parameter schema
 */
export const sessionIdParamSchema = z.object({
  id: z.string().uuid('Invalid session ID format'),
});

/**
 * Session ID parameter validation schema
 */
export const sessionIdParamValidationSchema = {
  params: sessionIdParamSchema,
};

/**
 * Type exports
 */
export type CreateSessionInput = z.infer<typeof createSessionBodySchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionBodySchema>;
export type RescheduleSessionInput = z.infer<typeof rescheduleSessionBodySchema>;
export type CancelSessionInput = z.infer<typeof cancelSessionBodySchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionBodySchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;

