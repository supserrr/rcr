/**
 * Route aggregator
 * 
 * Combines all routes into a single router
 */

import { Router, Request, Response } from 'express';
import { logInfo } from '../utils/logger';
import authRoutes from './auth.routes';
import sessionsRoutes from './sessions.routes';
import resourcesRoutes from './resources.routes';
import chatRoutes from './chat.routes';
import notificationsRoutes from './notifications.routes';
import adminRoutes from './admin.routes';

const router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (req: Request, res: Response) => {
  logInfo('Health check endpoint hit');
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * API root endpoint
 * GET /api
 */
router.get('/api', (req: Request, res: Response) => {
  logInfo('API root endpoint hit');
  res.status(200).json({
    message: 'Welcome to the Rwanda Cancer Relief Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      sessions: '/api/sessions',
      resources: '/api/resources',
      chat: '/api/chat',
      notifications: '/api/notifications',
      admin: '/api/admin',
      health: '/health',
    },
  });
});

/**
 * Authentication routes
 * All routes prefixed with /api/auth
 */
router.use('/api/auth', authRoutes);

/**
 * Sessions routes
 * All routes prefixed with /api/sessions
 */
router.use('/api/sessions', sessionsRoutes);

/**
 * Resources routes
 * All routes prefixed with /api/resources
 */
router.use('/api/resources', resourcesRoutes);

/**
 * Chat routes
 * All routes prefixed with /api/chat
 */
router.use('/api/chat', chatRoutes);

/**
 * Notifications routes
 * All routes prefixed with /api/notifications
 */
router.use('/api/notifications', notificationsRoutes);

/**
 * Admin routes
 * All routes prefixed with /api/admin (admin only)
 */
router.use('/api/admin', adminRoutes);

export default router;

