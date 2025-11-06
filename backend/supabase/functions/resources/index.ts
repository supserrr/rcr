/**
 * Resources Edge Function
 * 
 * Handles resource endpoints:
 * - GET / - List resources
 * - GET /:id - Get resource by ID
 * - POST / - Create resource (counselor/admin only)
 * - PUT /:id - Update resource
 * - DELETE /:id - Delete resource
 * - POST /:id/view - Track resource view
 * - GET /:id/download - Get download URL
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth, authenticateRequest, requireRole } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * List resources
 */
async function handleListResources(request: Request): Promise<Response> {
  try {
    const user = await authenticateRequest(request);
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    let query = supabase.from('resources').select('*');

    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    if (category) {
      query = query.eq('category', category);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (offset) {
      query = query.range(Number(offset), Number(offset) + (limit ? Number(limit) : 10) - 1);
    }

    const { data: resources, error } = await query;

    if (error) {
      console.error('List resources error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list resources', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({ resources: resources || [], total: resources?.length || 0, count: resources?.length || 0, limit: limit ? Number(limit) : 10, offset: offset ? Number(offset) : 0 })),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('List resources error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Get resource by ID
 */
async function handleGetResource(request: Request, resourceId: string): Promise<Response> {
  try {
    await authenticateRequest(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error || !resource) {
      return corsResponse(
        JSON.stringify(errorResponse('Resource not found', error?.message || 'Resource does not exist')),
        { status: 404 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(resource)),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Get resource error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Create resource
 */
async function handleCreateResource(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    requireRole(user, 'counselor', 'admin');

    const body = await request.json();
    const { title, description, category, type, url, fileUrl } = body;

    if (!title || !category || !type) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Title, category, and type are required')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);
    const resourceData = {
      title,
      description: description || null,
      category,
      type,
      url: url || null,
      file_url: fileUrl || null,
      publisher_id: user.id,
    };

    const { data: resource, error } = await supabase
      .from('resources')
      .insert(resourceData)
      .select()
      .single();

    if (error) {
      console.error('Create resource error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to create resource', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(resource)),
      { status: 201 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Update resource
 */
async function handleUpdateResource(request: Request, resourceId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: existingResource, error: getError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (getError || !existingResource) {
      return corsResponse(
        JSON.stringify(errorResponse('Resource not found', getError?.message || 'Resource does not exist')),
        { status: 404 },
        request
      );
    }

    if (existingResource.publisher_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have permission to update this resource')),
        { status: 403 },
        request
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.fileUrl !== undefined) updateData.file_url = body.fileUrl;
    updateData.updated_at = new Date().toISOString();

    const { data: resource, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) {
      console.error('Update resource error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to update resource', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(resource)),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Delete resource
 */
async function handleDeleteResource(request: Request, resourceId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: existingResource, error: getError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (getError || !existingResource) {
      return corsResponse(
        JSON.stringify(errorResponse('Resource not found', getError?.message || 'Resource does not exist')),
        { status: 404 },
        request
      );
    }

    if (existingResource.publisher_id !== user.id && user.role !== 'admin') {
      return corsResponse(
        JSON.stringify(errorResponse('Permission denied', 'You do not have permission to delete this resource')),
        { status: 403 },
        request
      );
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      console.error('Delete resource error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to delete resource', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Resource deleted successfully')),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Track resource view
 */
async function handleTrackView(request: Request, resourceId: string): Promise<Response> {
  try {
    const user = await authenticateRequest(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Track view (optional - can be done without auth)
    const viewData = {
      resource_id: resourceId,
      user_id: user?.id || null,
      viewed_at: new Date().toISOString(),
    };

    await supabase.from('resource_views').insert(viewData);

    return corsResponse(
      JSON.stringify(successResponse(null, 'View tracked')),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Track view error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
}

/**
 * Get download URL
 */
async function handleDownloadResource(request: Request, resourceId: string): Promise<Response> {
  try {
    await authenticateRequest(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error || !resource) {
      return corsResponse(
        JSON.stringify(errorResponse('Resource not found', error?.message || 'Resource does not exist')),
        { status: 404 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        url: resource.file_url || resource.url,
        filename: resource.title,
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    console.error('Download resource error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
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
  const path = url.pathname.replace('/resources', '') || '/';
  const method = request.method;

  try {
    const pathParts = path.split('/').filter(Boolean);
    const resourceId = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
    const action = pathParts.length > 1 ? pathParts[1] : null;

    if (method === 'GET' && path === '/') {
      return await handleListResources(request);
    }

    if (method === 'POST' && path === '/') {
      return await handleCreateResource(request);
    }

    if (method === 'GET' && resourceId && !action) {
      return await handleGetResource(request, resourceId);
    }

    if (method === 'PUT' && resourceId && !action) {
      return await handleUpdateResource(request, resourceId);
    }

    if (method === 'DELETE' && resourceId && !action) {
      return await handleDeleteResource(request, resourceId);
    }

    if (method === 'POST' && resourceId && action === 'view') {
      return await handleTrackView(request, resourceId);
    }

    if (method === 'GET' && resourceId && action === 'download') {
      return await handleDownloadResource(request, resourceId);
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

