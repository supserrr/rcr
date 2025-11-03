/**
 * Resource validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Create resource request body schema
 */
export const createResourceBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be at most 1000 characters'),
  type: z.enum(['audio', 'pdf', 'video', 'article'] as const, {
    message: 'Resource type must be audio, pdf, video, or article',
  }),
  url: z.string().url('Invalid URL format').optional(),
  thumbnail: z.string().url('Invalid thumbnail URL format').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  isPublic: z.boolean().default(true),
  youtubeUrl: z.string().url('Invalid YouTube URL format').optional(),
  content: z.string().max(50000, 'Content must be at most 50000 characters').optional(),
  category: z.string().max(100, 'Category must be at most 100 characters').optional(),
});

/**
 * Create resource request schema
 */
export const createResourceSchema = {
  body: createResourceBodySchema,
};

/**
 * Update resource request body schema
 */
export const updateResourceBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be at most 1000 characters').optional(),
  type: z.enum(['audio', 'pdf', 'video', 'article'] as const, {
    message: 'Resource type must be audio, pdf, video, or article',
  }).optional(),
  url: z.string().url('Invalid URL format').optional(),
  thumbnail: z.string().url('Invalid thumbnail URL format').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed').optional(),
  isPublic: z.boolean().optional(),
  youtubeUrl: z.string().url('Invalid YouTube URL format').optional(),
  content: z.string().max(50000, 'Content must be at most 50000 characters').optional(),
  category: z.string().max(100, 'Category must be at most 100 characters').optional(),
});

/**
 * Update resource request schema
 */
export const updateResourceSchema = {
  body: updateResourceBodySchema,
};

/**
 * Resource query parameters schema
 */
export const resourceQuerySchema = z.object({
  type: z.enum(['audio', 'pdf', 'video', 'article'] as const).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  isPublic: z.string().transform((val) => val === 'true').optional(),
  publisher: z.string().uuid('Invalid publisher ID format').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
  sortBy: z.enum(['title', 'created_at', 'views', 'downloads'] as const).optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).optional(),
});

/**
 * Resource query validation schema
 */
export const resourceQueryValidationSchema = {
  query: resourceQuerySchema,
};

/**
 * Resource ID parameter schema
 */
export const resourceIdParamSchema = z.object({
  id: z.string().uuid('Invalid resource ID format'),
});

/**
 * Resource ID parameter validation schema
 */
export const resourceIdParamValidationSchema = {
  params: resourceIdParamSchema,
};

/**
 * Track resource view request body schema
 */
export const trackViewBodySchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID format'),
});

/**
 * Track resource view request schema
 */
export const trackViewSchema = {
  body: trackViewBodySchema,
};

/**
 * Type exports
 */
export type CreateResourceInput = z.infer<typeof createResourceBodySchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceBodySchema>;
export type ResourceQueryParams = z.infer<typeof resourceQuerySchema>;
export type TrackViewInput = z.infer<typeof trackViewBodySchema>;

