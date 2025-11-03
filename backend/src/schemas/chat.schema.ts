/**
 * Chat validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Send message request body schema
 */
export const sendMessageBodySchema = z.object({
  chatId: z.string().uuid('Invalid chat ID format'),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message must be at most 5000 characters'),
  type: z.enum(['text', 'image', 'file'] as const, {
    message: 'Message type must be text, image, or file',
  }).default('text'),
  fileUrl: z.string().url('Invalid file URL format').optional(),
});

/**
 * Send message request schema
 */
export const sendMessageSchema = {
  body: sendMessageBodySchema,
};

/**
 * Create chat request body schema
 */
export const createChatBodySchema = z.object({
  participantId: z.string().uuid('Invalid participant ID format'),
});

/**
 * Create chat request schema
 */
export const createChatSchema = {
  body: createChatBodySchema,
};

/**
 * Chat query parameters schema
 */
export const chatQuerySchema = z.object({
  participantId: z.string().uuid('Invalid participant ID format').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).optional(),
});

/**
 * Chat query validation schema
 */
export const chatQueryValidationSchema = {
  query: chatQuerySchema,
};

/**
 * Chat ID parameter schema
 */
export const chatIdParamSchema = z.object({
  id: z.string().uuid('Invalid chat ID format'),
});

/**
 * Chat ID parameter validation schema
 */
export const chatIdParamValidationSchema = {
  params: chatIdParamSchema,
};

/**
 * Message ID parameter schema
 */
export const messageIdParamSchema = z.object({
  id: z.string().uuid('Invalid message ID format'),
});

/**
 * Message ID parameter validation schema
 */
export const messageIdParamValidationSchema = {
  params: messageIdParamSchema,
};

/**
 * Get messages query parameters schema
 */
export const messagesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  before: z.string().uuid('Invalid message ID format').optional(),
  after: z.string().uuid('Invalid message ID format').optional(),
});

/**
 * Get messages query validation schema
 */
export const messagesQueryValidationSchema = {
  query: messagesQuerySchema,
};

/**
 * Mark messages as read request body schema
 */
export const markReadBodySchema = z.object({
  messageIds: z.array(z.string().uuid('Invalid message ID format')).min(1, 'At least one message ID is required'),
});

/**
 * Mark messages as read request schema
 */
export const markReadSchema = {
  body: markReadBodySchema,
};

/**
 * Type exports
 */
export type SendMessageInput = z.infer<typeof sendMessageBodySchema>;
export type CreateChatInput = z.infer<typeof createChatBodySchema>;
export type ChatQueryParams = z.infer<typeof chatQuerySchema>;
export type MessagesQueryParams = z.infer<typeof messagesQuerySchema>;
export type MarkReadInput = z.infer<typeof markReadBodySchema>;

