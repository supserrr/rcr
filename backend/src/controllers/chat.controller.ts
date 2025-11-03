/**
 * Chat controller
 * 
 * Handles HTTP requests for chat endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new chat
 * POST /api/chat
 */
export async function createChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const chat = await chatService.createChat(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get chat by ID
 * GET /api/chat/:id
 */
export async function getChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const chat = await chatService.getChatById(id, req.user.id);
    res.status(200).json({
      success: true,
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List chats for user
 * GET /api/chat
 */
export async function listChats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const query = {
      participantId: req.query.participantId as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };

    const result = await chatService.listChats(req.user.id, query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send a message
 * POST /api/chat/:id/messages
 */
export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const message = await chatService.sendMessage(
      { ...req.body, chatId: id },
      req.user.id
    );
    res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get messages for a chat
 * GET /api/chat/:id/messages
 */
export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const query = {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      before: req.query.before as string | undefined,
      after: req.query.after as string | undefined,
    };

    const result = await chatService.getMessages(id, req.user.id, query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark messages as read
 * POST /api/chat/:id/messages/read
 */
export async function markMessagesRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    await chatService.markMessagesAsRead(req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
}

