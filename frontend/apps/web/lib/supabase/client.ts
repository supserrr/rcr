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
  // Check both the validated env object and process.env directly
  // In Next.js, NEXT_PUBLIC_ variables are embedded at build time
  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
    process.env.NEXT_PUBLIC_SUPABASE_DEV_URL;

  const supabaseKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) ||
    process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    // Only log warning in development, not during build
    if (typeof window !== 'undefined') {
      const hasEnvUrl = !!env.NEXT_PUBLIC_SUPABASE_URL;
      const hasEnvKey = !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const hasProcessUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasProcessKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.error(
        'Supabase is not configured.\n' +
        `env.NEXT_PUBLIC_SUPABASE_URL: ${hasEnvUrl ? 'Set' : 'Missing'}\n` +
        `env.NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasEnvKey ? 'Set' : 'Missing'}\n` +
        `process.env.NEXT_PUBLIC_SUPABASE_URL: ${hasProcessUrl ? 'Set' : 'Missing'}\n` +
        `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasProcessKey ? 'Set' : 'Missing'}\n` +
        '\nFor Vercel deployments:\n' +
        '1. Go to Vercel Project → Settings → Environment Variables\n' +
        '2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        '3. Make sure they are set for Production, Preview, and Development\n' +
        '4. Redeploy your project (the variables must be available at BUILD time)'
      );
    }
    return null;
  }
  
  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    if (typeof window !== 'undefined') {
      console.error(
        `Invalid Supabase URL format: ${supabaseUrl}\n` +
        'Expected format: https://your-project-id.supabase.co'
      );
    }
    return null;
  }
  
  // Validate key format (anon keys typically start with 'eyJ')
  if (!supabaseKey.startsWith('eyJ')) {
    if (typeof window !== 'undefined') {
      console.warn(
        'Supabase anon key format looks incorrect. ' +
        'Make sure you are using the anon/public key (not the service_role key). ' +
        'Get it from Supabase Dashboard → Settings → API → Project API keys → anon/public'
      );
    }
  }
  
  // Create and cache the client instance with validated credentials
  // Use the fallback values we checked above
  supabaseClientInstance = createSupabaseClient(
    supabaseUrl,
    supabaseKey,
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

