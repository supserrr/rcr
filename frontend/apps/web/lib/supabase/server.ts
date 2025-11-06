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
  // Validate that Supabase environment variables are set
  // During build time, these may not be available, so return null gracefully
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  
  const cookieStore = await cookies();
  
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
    }
  );
}

