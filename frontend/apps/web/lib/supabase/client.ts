/**
 * Supabase Client for Client-Side Usage
 * 
 * Use this client for client-side components and browser interactions.
 * This client uses the anon key and respects RLS policies.
 * 
 * This module implements a singleton pattern to ensure only one
 * Supabase client instance is created per browser context, preventing
 * the "Multiple GoTrueClient instances detected" warning.
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/src/env';

/**
 * Singleton Supabase client instance
 * This ensures only one client is created per browser context
 */
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Create or get the singleton Supabase client for client-side usage
 * 
 * This function implements a singleton pattern to prevent multiple
 * GoTrueClient instances from being created in the same browser context.
 * 
 * Uses validated environment variables from @t3-oss/env-core which ensures
 * all required variables are present and properly typed.
 * 
 * @returns The singleton Supabase client instance, or null if not configured
 */
export function createClient(): SupabaseClient | null {
  // Return existing instance if it exists
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }
  
  // Validate that Supabase environment variables are set
  // During build time, these may not be available, so return null gracefully
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Only log warning in development, not during build
    if (typeof window !== 'undefined') {
      console.warn(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables. ' +
        'For Vercel deployments, add these in Settings → Environment Variables.'
      );
    }
    return null;
  }
  
  // Create and cache the client instance with validated credentials
  // The env object ensures NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  // are present and properly typed
  supabaseClientInstance = createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseClientInstance;
}

