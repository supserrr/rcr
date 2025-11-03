/**
 * Sessions routes
 * 
 * All session-related endpoints
 */

import { Router } from 'express';
import * as sessionsController from '../controllers/sessions.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSessionSchema,
  updateSessionSchema,
  rescheduleSessionSchema,
  cancelSessionSchema,
  completeSessionSchema,
  sessionQueryValidationSchema,
  sessionIdParamValidationSchema,
} from '../schemas/sessions.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/sessions
 * List sessions with optional filters
 */
router.get(
  '/',
  validate(sessionQueryValidationSchema),
  sessionsController.listSessions
);

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
router.get(
  '/:id',
  validate(sessionIdParamValidationSchema),
  sessionsController.getSession
);

/**
 * POST /api/sessions
 * Create a new session booking
 */
router.post(
  '/',
  validate(createSessionSchema),
  sessionsController.createSession
);

/**
 * PUT /api/sessions/:id
 * Update session details
 */
router.put(
  '/:id',
  validate(sessionIdParamValidationSchema),
  validate(updateSessionSchema),
  sessionsController.updateSession
);

/**
 * POST /api/sessions/:id/reschedule
 * Reschedule a session
 */
router.post(
  '/:id/reschedule',
  validate(sessionIdParamValidationSchema),
  validate(rescheduleSessionSchema),
  sessionsController.rescheduleSession
);

/**
 * POST /api/sessions/:id/cancel
 * Cancel a session
 */
router.post(
  '/:id/cancel',
  validate(sessionIdParamValidationSchema),
  validate(cancelSessionSchema),
  sessionsController.cancelSession
);

/**
 * POST /api/sessions/:id/complete
 * Mark session as completed (counselor only)
 */
router.post(
  '/:id/complete',
  validate(sessionIdParamValidationSchema),
  validate(completeSessionSchema),
  sessionsController.completeSession
);

/**
 * GET /api/sessions/:id/jitsi-room
 * Get Jitsi Meet room for session (video sessions only)
 */
router.get(
  '/:id/jitsi-room',
  validate(sessionIdParamValidationSchema),
  sessionsController.getSessionJitsiRoom
);

export default router;

