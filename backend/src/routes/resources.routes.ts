/**
 * Resources routes
 * 
 * All resource-related endpoints
 */

import { Router } from 'express';
import * as resourcesController from '../controllers/resources.controller';
import { authenticate, optionalAuthenticate, requireCounselor } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQueryValidationSchema,
  resourceIdParamValidationSchema,
} from '../schemas/resources.schema';

const router = Router();

/**
 * GET /api/resources
 * List resources with optional filters (public endpoint with optional auth)
 */
router.get(
  '/',
  optionalAuthenticate,
  validate(resourceQueryValidationSchema),
  resourcesController.listResources
);

/**
 * GET /api/resources/:id
 * Get resource by ID (public endpoint with optional auth)
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validate(resourceIdParamValidationSchema),
  resourcesController.getResource
);

/**
 * POST /api/resources
 * Create a new resource (counselor/admin only)
 */
router.post(
  '/',
  authenticate,
  requireCounselor,
  validate(createResourceSchema),
  resourcesController.createResource
);

/**
 * PUT /api/resources/:id
 * Update resource (publisher or admin only)
 */
router.put(
  '/:id',
  authenticate,
  validate(resourceIdParamValidationSchema),
  validate(updateResourceSchema),
  resourcesController.updateResource
);

/**
 * DELETE /api/resources/:id
 * Delete resource (publisher or admin only)
 */
router.delete(
  '/:id',
  authenticate,
  validate(resourceIdParamValidationSchema),
  resourcesController.deleteResource
);

/**
 * POST /api/resources/:id/view
 * Track resource view (optional auth)
 */
router.post(
  '/:id/view',
  optionalAuthenticate,
  validate(resourceIdParamValidationSchema),
  resourcesController.trackView
);

/**
 * GET /api/resources/:id/download
 * Get download URL for resource (optional auth)
 */
router.get(
  '/:id/download',
  optionalAuthenticate,
  validate(resourceIdParamValidationSchema),
  resourcesController.downloadResource
);

export default router;

