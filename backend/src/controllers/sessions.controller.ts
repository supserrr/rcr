/**
 * Sessions controller
 * 
 * Handles HTTP requests for session endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new session
 * POST /api/sessions
 */
export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const session = await sessionsService.createSession(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const session = await sessionsService.getSessionById(id, req.user.id);
    res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List sessions with filters
 * GET /api/sessions
 */
export async function listSessions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const query = {
      patientId: req.query.patientId as string | undefined,
      counselorId: req.query.counselorId as string | undefined,
      status: req.query.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | undefined,
      type: req.query.type as 'video' | 'audio' | 'chat' | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };

    const result = await sessionsService.listSessions(req.user.id, req.user.role, query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update session
 * PUT /api/sessions/:id
 */
export async function updateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const session = await sessionsService.updateSession(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reschedule session
 * POST /api/sessions/:id/reschedule
 */
export async function rescheduleSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const session = await sessionsService.rescheduleSession(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: { session },
      message: 'Session rescheduled successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel session
 * POST /api/sessions/:id/cancel
 */
export async function cancelSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const session = await sessionsService.cancelSession(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: { session },
      message: 'Session cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete session
 * POST /api/sessions/:id/complete
 */
export async function completeSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const session = await sessionsService.completeSession(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: { session },
      message: 'Session completed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Jitsi room for session
 * GET /api/sessions/:id/jitsi-room
 * Query params: ?apiType=react-sdk|iframe|lib-jitsi-meet (default: react-sdk)
 */
export async function getSessionJitsiRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const apiType =
      (req.query.apiType as 'react-sdk' | 'iframe' | 'lib-jitsi-meet') || 'react-sdk';

    // Validate apiType
    if (!['react-sdk', 'iframe', 'lib-jitsi-meet'].includes(apiType)) {
      throw new AppError('Invalid apiType. Must be: react-sdk, iframe, or lib-jitsi-meet', 400);
    }

    const jitsiRoom = await sessionsService.getSessionJitsiRoom(id, req.user.id, apiType);
    res.status(200).json({
      success: true,
      data: jitsiRoom,
    });
  } catch (error) {
    next(error);
  }
}

