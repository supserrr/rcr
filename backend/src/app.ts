/**
 * Express application setup
 * 
 * Configures Express app with middleware and routes
 */

import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { logInfo } from './utils/logger';
import router from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

/**
 * Create and configure Express app
 */
export function createApp(): Express {
  const app = express();

  // Trust proxy (for deployment behind reverse proxy)
  app.set('trust proxy', 1);

  // CORS configuration
  app.use(
    cors({
      origin: config.frontend.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging (simple)
  app.use((req, res, next) => {
    logInfo(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Routes
  app.use('/', router);

  // API routes will be added here
  // app.use('/api/auth', authRoutes);
  // app.use('/api/users', usersRoutes);
  // etc.

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

