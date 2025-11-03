/**
 * Configuration loader for the application
 * 
 * Loads environment variables and provides typed configuration
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration interface
 */
export interface Config {
  port: number;
  nodeEnv: string;
  supabase: {
    url: string;
    key: string;
    serviceKey: string;
  };
  jitsi: {
    appId: string;
    appSecret: string;
    domain: string;
  };
  frontend: {
    url: string;
    corsOrigin: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  resend?: {
    apiKey?: string;
  };
}

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  const required = [
    'PORT',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SUPABASE_SERVICE_KEY',
    'FRONTEND_URL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Get application configuration
 */
export function getConfig(): Config {
  // Only validate in production
  if (process.env.NODE_ENV === 'production') {
    validateEnv();
  }

  return {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    supabase: {
      url: process.env.SUPABASE_URL || '',
      key: process.env.SUPABASE_KEY || '',
      serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    },
    jitsi: {
      appId: process.env.JITSI_APP_ID || '',
      appSecret: process.env.JITSI_APP_SECRET || '',
      domain: process.env.JITSI_DOMAIN || '8x8.vc',
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:3000',
      corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
  };
}

export const config = getConfig();

