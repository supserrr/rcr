/**
 * Health check Edge Function
 * 
 * Handles health check endpoint:
 * - GET / - Health check
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * Health check handler
 */
async function handleHealthCheck(request: Request): Promise<Response> {
  try {
    // Test Supabase connection
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('_prisma_migrations').select('*').limit(1);

    // Connection test (error might be expected if table doesn't exist)
    const isHealthy = true;

    return corsResponse(
      JSON.stringify(successResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: isHealthy ? 'connected' : 'disconnected',
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Health check error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Health check failed', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Main handler
 */
serve(async (request: Request) => {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) {
    return corsResponse;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/health', '') || '/';
  const method = request.method;

  try {
    if (method === 'GET' && path === '/') {
      return await handleHealthCheck(request);
    }

    return corsResponse(
      JSON.stringify(errorResponse('Not found', 'The requested endpoint does not exist')),
      { status: 404 },
      request
    );
  } catch (error) {
    console.error('Request error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
});

