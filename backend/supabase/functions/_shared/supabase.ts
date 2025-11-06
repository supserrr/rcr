/**
 * Supabase client helper for Edge Functions
 * 
 * Creates Supabase clients for different use cases
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Get Supabase client using anon key
 * 
 * @param accessToken - Optional access token for authenticated requests
 * @returns Supabase client instance
 */
export function getSupabaseClient(accessToken?: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_KEY') || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_KEY) must be set');
  }

  const options: { auth?: { persistSession: boolean; global?: { headers?: Record<string, string> } } } = {
    auth: {
      persistSession: false,
    },
  };

  if (accessToken) {
    options.auth = {
      ...options.auth,
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Get Supabase service client using service role key
 * 
 * Use this for admin operations that require elevated permissions
 * @returns Supabase service client instance
 */
export function getSupabaseServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}

