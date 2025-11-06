/**
 * Supabase Client for Server-Side Usage
 * 
 * Use this client for server components, API routes, and server actions.
 * This client uses cookies for session management.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw error at runtime in production, not during build
// During build time, we allow undefined values to prevent build errors
// The error will be thrown when the function is actually called at runtime

/**
 * Create a Supabase client for server-side usage
 * 
 * This client uses cookies for session management and is suitable for
 * server components, API routes, and server actions.
 */
/**
 * Check if we're in a build context (not at runtime)
 */
function isBuildTime(): boolean {
  // During Next.js build, NEXT_PHASE is set to 'phase-production-build'
  // or we can check if we're in a build context by checking for build-specific env vars
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.NEXT_PHASE === 'phase-development-build' ||
         !process.env.VERCEL_ENV; // If not in Vercel runtime, might be build time
}

export async function createClient() {
  // Check for environment variables at runtime, not at module evaluation time
  // This prevents build errors when env vars aren't available during build
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, use placeholder values to prevent build errors
    // Only throw errors at actual runtime in production
    if (!isBuildTime() && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
      );
    }
    // In development/build, use placeholder values
    const url = 'https://placeholder.supabase.co';
    const key = 'placeholder-key';
    
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });
  }
  
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

