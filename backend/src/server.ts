/**
 * Server entry point
 * 
 * Starts the Express server
 */

import { createServer } from 'http';
import { createApp } from './app';
import { config } from './config';
import { logInfo, logError } from './utils/logger';
import { testSupabaseConnection } from './config/supabase';
import { initializeSocket } from './socket';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = createServer(app);

    // Test Supabase connection if credentials are available
    if (config.supabase.url && config.supabase.key) {
      logInfo('Testing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        logInfo('Supabase connection successful');
      } else {
        logError('Supabase connection failed. Check your credentials.');
      }
    } else {
      logInfo('Supabase credentials not found. Skipping connection test.');
    }

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start server
    httpServer.listen(config.port, () => {
      logInfo(`Server started on port ${config.port}`, {
        environment: config.nodeEnv,
        port: config.port,
        frontendUrl: config.frontend.url,
      });
    });

    const server = httpServer;

    // Graceful shutdown
    const shutdown = () => {
      logInfo('Shutting down server...');
      server.close(() => {
        logInfo('Server shut down');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
startServer();

