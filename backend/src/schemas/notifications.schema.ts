/**
 * Notification validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Create notification request body schema
 */
export const createNotificationBodySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be at most 1000 characters'),
  type: z.enum(['session', 'message', 'system', 'resource'] as const, {
    message: 'Notification type must be session, message, system, or resource',
  }),
  link: z.string().url('Invalid link URL format').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Create notification request schema
 */
export const createNotificationSchema = {
  body: createNotificationBodySchema,
};

/**
 * Notification query parameters schema
 */
export const notificationQuerySchema = z.object({
  type: z.enum(['session', 'message', 'system', 'resource'] as const).optional(),
  isRead: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
});

/**
 * Notification query validation schema
 */
export const notificationQueryValidationSchema = {
  query: notificationQuerySchema,
};

/**
 * Notification ID parameter schema
 */
export const notificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format'),
});

/**
 * Notification ID parameter validation schema
 */
export const notificationIdParamValidationSchema = {
  params: notificationIdParamSchema,
};

/**
 * Mark notifications as read request body schema
 */
export const markNotificationsReadBodySchema = z.object({
  notificationIds: z.array(z.string().uuid('Invalid notification ID format')).min(1, 'At least one notification ID is required').optional(),
  markAll: z.boolean().optional(),
});

/**
 * Mark notifications as read request schema
 */
export const markNotificationsReadSchema = {
  body: markNotificationsReadBodySchema,
};

/**
 * Type exports
 */
export type CreateNotificationInput = z.infer<typeof createNotificationBodySchema>;
export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;
export type MarkNotificationsReadInput = z.infer<typeof markNotificationsReadBodySchema>;

