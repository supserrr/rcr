/**
 * Admin routes
 * 
 * All admin-related endpoints (admin only)
 */

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  updateUserRoleSchema,
  userIdParamValidationSchema,
  analyticsQueryValidationSchema,
  userQueryValidationSchema,
} from '../schemas/admin.schema';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/analytics
 * Get platform analytics
 */
router.get(
  '/analytics',
  validate(analyticsQueryValidationSchema),
  adminController.getAnalytics
);

/**
 * GET /api/admin/users
 * List users (admin only)
 */
router.get(
  '/users',
  validate(userQueryValidationSchema),
  adminController.listUsers
);

/**
 * GET /api/admin/users/:id
 * Get user by ID (admin only)
 */
router.get(
  '/users/:id',
  validate(userIdParamValidationSchema),
  adminController.getUser
);

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin only)
 */
router.put(
  '/users/:id/role',
  validate(userIdParamValidationSchema),
  validate(updateUserRoleSchema),
  adminController.updateUserRole
);

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
router.delete(
  '/users/:id',
  validate(userIdParamValidationSchema),
  adminController.deleteUser
);

export default router;

