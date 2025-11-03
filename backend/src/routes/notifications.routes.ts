/**
 * Notifications routes
 * 
 * All notification-related endpoints
 */

import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createNotificationSchema,
  notificationQueryValidationSchema,
  notificationIdParamValidationSchema,
  markNotificationsReadSchema,
} from '../schemas/notifications.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 */
router.get(
  '/',
  validate(notificationQueryValidationSchema),
  notificationsController.listNotifications
);

/**
 * GET /api/notifications/:id
 * Get notification by ID
 */
router.get(
  '/:id',
  validate(notificationIdParamValidationSchema),
  notificationsController.getNotification
);

/**
 * POST /api/notifications
 * Create a notification (admin only, or for self)
 */
router.post(
  '/',
  validate(createNotificationSchema),
  notificationsController.createNotification
);

/**
 * POST /api/notifications/read
 * Mark notifications as read
 */
router.post(
  '/read',
  validate(markNotificationsReadSchema),
  notificationsController.markNotificationsRead
);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete(
  '/:id',
  validate(notificationIdParamValidationSchema),
  notificationsController.deleteNotification
);

export default router;

