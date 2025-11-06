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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Don't throw error at module evaluation time - this prevents build errors
// The error will be thrown at runtime when createClient() is called if needed

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
 * @returns The singleton Supabase client instance
 */
/**
 * Check if we're in a browser environment (not during build/SSR)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function createClient(): SupabaseClient {
  // Return existing instance if it exists
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Check for environment variables at runtime, not at module evaluation time
  // This prevents build errors when env vars aren't available during build
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time (SSR), use placeholder values to prevent build errors
    // Only throw errors at actual runtime in the browser
    if (isBrowser() && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
      );
    }
    // In development/build/SSR, use placeholder values
    const url = 'https://placeholder.supabase.co';
    const key = 'placeholder-key';
    
    supabaseClientInstance = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    
    return supabaseClientInstance;
  }
  
  // Create and cache the client instance with actual credentials
  supabaseClientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClientInstance;
}

