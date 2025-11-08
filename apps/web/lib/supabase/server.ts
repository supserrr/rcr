/**
 * Supabase Client for Server-Side Usage
 * 
 * Use this client for server components, API routes, and server actions.
 * This client uses cookies for session management.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/src/env';

/**
 * Create a Supabase client for server-side usage
 * 
 * This client uses cookies for session management and is suitable for
 * server components, API routes, and server actions.
 * 
 * Uses validated environment variables from @t3-oss/env-core which ensures
 * all required variables are present and properly typed.
 * 
 * @returns The Supabase client instance, or null if not configured
 */
export async function createClient() {
  // Prefer production credentials but fall back to dev-specific values in non-production environments.
  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_DEV_URL;

  const supabaseAnonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY;

  // If credentials are still missing, return null gracefully (handled by callers).
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();
  
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Production-ready cookie settings
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              // In production, use Secure flag for HTTPS
              secure: isProduction,
              // Use SameSite=Lax for better security and compatibility
              sameSite: 'lax',
              // HttpOnly is handled by Supabase automatically for auth cookies
              httpOnly: options.httpOnly ?? true,
              // Set path to root for all cookies
              path: options.path ?? '/',
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Production-ready cookie removal
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              secure: isProduction,
              sameSite: 'lax',
              httpOnly: options.httpOnly ?? true,
              path: options.path ?? '/',
              maxAge: 0, // Expire immediately
            });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

