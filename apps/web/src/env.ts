/**
 * Environment variable validation schema
 * 
 * Uses @t3-oss/env-nextjs to validate and type-check environment variables
 * at build time and runtime.
 * 
 * Next.js uses NEXT_PUBLIC_ prefix for client-side environment variables.
 * 
 * Note: Supabase variables are optional during build to allow Vercel deployments
 * to proceed, but will be validated at runtime when Supabase features are used.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables
 * 
 * This object contains all validated environment variables with proper
 * types and validation. Access this instead of process.env directly.
 * 
 * Supabase variables are optional during build to support deployments where
 * they may not be configured yet, but will be validated at runtime when
 * Supabase features are accessed.
 */
export const env = createEnv({
  /**
   * Server-side environment variables
   * 
   * These are only available on the server and will not be exposed to the client.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  
  /**
   * Client-side environment variables
   * 
   * Next.js requires the NEXT_PUBLIC_ prefix for client-side variables.
   * This is enforced both at type-level and at runtime.
   * 
   * Most variables are optional during build to allow deployments to proceed,
   * but should be set for full functionality. They will be validated at runtime
   * when features are accessed.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_DEV_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_ASSISTANT_API_URL: z.string().url().optional(),
  },
  
  /**
   * Runtime environment variables
   * 
   * For Next.js >= 13.4.4, we can use experimental__runtimeEnv for server variables
   * which automatically handles all server-side variables.
   * 
   * Client variables must be explicitly destructured in runtimeEnv to ensure
   * they are included in the bundle.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_DEV_URL: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL,
    NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_ASSISTANT_API_URL: process.env.NEXT_PUBLIC_ASSISTANT_API_URL,
  },
  
  /**
   * Treat empty strings as undefined
   * 
   * This ensures that empty string values in .env files are treated
   * as undefined, allowing default values to be applied correctly.
   */
  emptyStringAsUndefined: true,
});

