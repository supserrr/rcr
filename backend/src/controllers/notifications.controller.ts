/**
 * Notifications controller
 * 
 * Handles HTTP requests for notification endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as notificationsService from '../services/notifications.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a notification
 * POST /api/notifications
 */
export async function createNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can create notifications for other users
    if (req.body.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('You can only create notifications for yourself', 403);
    }

    const notification = await notificationsService.createNotification(req.body);
    res.status(201).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
export async function getNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const notification = await notificationsService.getNotificationById(id, req.user.id);
    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List notifications for user
 * GET /api/notifications
 */
export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const query = {
      type: req.query.type as 'session' | 'message' | 'system' | 'resource' | undefined,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };

    const result = await notificationsService.listNotifications(req.user.id, query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark notifications as read
 * POST /api/notifications/read
 */
export async function markNotificationsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const result = await notificationsService.markNotificationsAsRead(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    await notificationsService.deleteNotification(id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

