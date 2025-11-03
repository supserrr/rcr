/**
 * Resources controller
 * 
 * Handles HTTP requests for resource endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as resourcesService from '../services/resources.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new resource
 * POST /api/resources
 */
export async function createResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only counselors and admins can create resources
    if (req.user.role !== 'counselor' && req.user.role !== 'admin') {
      throw new AppError('Only counselors and admins can create resources', 403);
    }

    const resource = await resourcesService.createResource(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get resource by ID
 * GET /api/resources/:id
 */
export async function getResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const resource = await resourcesService.getResourceById(id, userId);

    // Track view if user is authenticated
    if (userId) {
      await resourcesService.trackResourceView(id, userId);
    }

    res.status(200).json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List resources with filters
 * GET /api/resources
 */
export async function listResources(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const query = {
      type: req.query.type as 'audio' | 'pdf' | 'video' | 'article' | undefined,
      category: req.query.category as string | undefined,
      tag: req.query.tag as string | undefined,
      search: req.query.search as string | undefined,
      isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
      publisher: req.query.publisher as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
      sortBy: req.query.sortBy as 'title' | 'created_at' | 'views' | 'downloads' | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };

    const result = await resourcesService.listResources(userId, query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update resource
 * PUT /api/resources/:id
 */
export async function updateResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const resource = await resourcesService.updateResource(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete resource
 * DELETE /api/resources/:id
 */
export async function deleteResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    await resourcesService.deleteResource(id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Track resource view
 * POST /api/resources/:id/view
 */
export async function trackView(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const result = await resourcesService.trackResourceView(id, userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get resource download URL
 * GET /api/resources/:id/download
 */
export async function downloadResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const result = await resourcesService.getResourceDownloadUrl(id, userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

