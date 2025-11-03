/**
 * Chat routes
 * 
 * All chat-related endpoints
 */

import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createChatSchema,
  sendMessageSchema,
  chatQueryValidationSchema,
  chatIdParamValidationSchema,
  messagesQueryValidationSchema,
  markReadSchema,
} from '../schemas/chat.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/chat
 * List chats for the authenticated user
 */
router.get(
  '/',
  validate(chatQueryValidationSchema),
  chatController.listChats
);

/**
 * GET /api/chat/:id
 * Get chat by ID
 */
router.get(
  '/:id',
  validate(chatIdParamValidationSchema),
  chatController.getChat
);

/**
 * POST /api/chat
 * Create a new chat
 */
router.post(
  '/',
  validate(createChatSchema),
  chatController.createChat
);

/**
 * GET /api/chat/:id/messages
 * Get messages for a chat
 */
router.get(
  '/:id/messages',
  validate(chatIdParamValidationSchema),
  validate(messagesQueryValidationSchema),
  chatController.getMessages
);

/**
 * POST /api/chat/:id/messages
 * Send a message to a chat
 */
router.post(
  '/:id/messages',
  validate(chatIdParamValidationSchema),
  validate(sendMessageSchema),
  chatController.sendMessage
);

/**
 * POST /api/chat/:id/messages/read
 * Mark messages as read
 */
router.post(
  '/:id/messages/read',
  validate(chatIdParamValidationSchema),
  validate(markReadSchema),
  chatController.markMessagesRead
);

export default router;

