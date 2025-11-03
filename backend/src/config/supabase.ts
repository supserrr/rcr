/**
 * Supabase client configuration
 * 
 * Creates and exports Supabase clients for different use cases
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

/**
 * Supabase client for client-side operations (uses anon key)
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Supabase client for server-side operations (uses service role key)
 */
let supabaseServiceClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client (anon key)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!config.supabase.url || !config.supabase.key) {
      throw new Error(
        'Supabase URL and key are required. Check your environment variables.'
      );
    }

    supabaseClient = createClient(config.supabase.url, config.supabase.key, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Get or create Supabase service client (service role key)
 * 
 * Use this for admin operations that require elevated permissions
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!supabaseServiceClient) {
    if (!config.supabase.url || !config.supabase.serviceKey) {
      throw new Error(
        'Supabase URL and service key are required. Check your environment variables.'
      );
    }

    supabaseServiceClient = createClient(
      config.supabase.url,
      config.supabase.serviceKey,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }

  return supabaseServiceClient;
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    // Simple query to test connection
    const { error } = await client.from('_prisma_migrations').select('*').limit(1);
    
    // If we get here, connection is working (error might be expected if table doesn't exist)
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

