/**
 * Resources service layer
 * 
 * Handles all resource-related business logic using Supabase
 */

import { getSupabaseClient, getSupabaseServiceClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import * as storageService from './storage.service';
import type {
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQueryParams,
  TrackViewInput,
} from '../schemas/resources.schema';

/**
 * Resource type
 */
export type ResourceType = 'audio' | 'pdf' | 'video' | 'article';

/**
 * Resource data returned from operations
 */
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  publisher: string;
  youtubeUrl?: string;
  content?: string;
  category?: string;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new resource
 */
export async function createResource(
  input: CreateResourceInput,
  publisherId: string
): Promise<Resource> {
  try {
    const supabase = getSupabaseClient();

    // Validate URL based on type
    if (input.type !== 'article' && !input.url && !input.youtubeUrl) {
      throw new AppError(`${input.type} resources require either a URL or YouTube URL`, 400);
    }

    if (input.type === 'article' && !input.content && !input.url) {
      throw new AppError('Article resources require either content or URL', 400);
    }

    // Create resource record
    const resourceData = {
      title: input.title,
      description: input.description,
      type: input.type,
      url: input.url || null,
      thumbnail: input.thumbnail || null,
      tags: input.tags,
      is_public: input.isPublic !== undefined ? input.isPublic : true,
      publisher: publisherId,
      youtube_url: input.youtubeUrl || null,
      content: input.content || null,
      category: input.category || null,
      views: 0,
      downloads: 0,
    };

    const { data: resource, error } = await supabase
      .from('resources')
      .insert(resourceData)
      .select()
      .single();

    if (error) {
      logError('Create resource error', error);
      throw new AppError('Failed to create resource', 500);
    }

    const result: Resource = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || undefined,
      thumbnail: resource.thumbnail || undefined,
      tags: resource.tags || [],
      isPublic: resource.is_public !== undefined ? resource.is_public : true,
      publisher: resource.publisher,
      youtubeUrl: resource.youtube_url || undefined,
      content: resource.content || undefined,
      category: resource.category || undefined,
      views: resource.views || 0,
      downloads: resource.downloads || 0,
      createdAt: resource.created_at || new Date().toISOString(),
      updatedAt: resource.updated_at || new Date().toISOString(),
    };

    logInfo('Resource created successfully', { resourceId: result.id, publisherId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Create resource service error', error);
    throw new AppError('Failed to create resource', 500);
  }
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: string, userId?: string): Promise<Resource> {
  try {
    const supabase = getSupabaseClient();

    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error || !resource) {
      logError('Get resource error', error);
      throw new AppError('Resource not found', 404);
    }

    // Check if resource is public or user is the publisher
    if (!resource.is_public && resource.publisher !== userId) {
      throw new AppError('Access denied to this resource', 403);
    }

    const result: Resource = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || undefined,
      thumbnail: resource.thumbnail || undefined,
      tags: resource.tags || [],
      isPublic: resource.is_public !== undefined ? resource.is_public : true,
      publisher: resource.publisher,
      youtubeUrl: resource.youtube_url || undefined,
      content: resource.content || undefined,
      category: resource.category || undefined,
      views: resource.views || 0,
      downloads: resource.downloads || 0,
      createdAt: resource.created_at || new Date().toISOString(),
      updatedAt: resource.updated_at || new Date().toISOString(),
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get resource service error', error);
    throw new AppError('Failed to get resource', 500);
  }
}

/**
 * List resources with filters
 */
export async function listResources(
  userId: string | undefined,
  query: ResourceQueryParams
): Promise<{ resources: Resource[]; total: number }> {
  try {
    const supabase = getSupabaseClient();

    let queryBuilder = supabase.from('resources').select('*', { count: 'exact' });

    // Apply filters
    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.category) {
      queryBuilder = queryBuilder.eq('category', query.category);
    }

    if (query.tag) {
      queryBuilder = queryBuilder.contains('tags', [query.tag]);
    }

    if (query.isPublic !== undefined) {
      if (query.isPublic) {
        // Show only public resources, or resources published by the user
        queryBuilder = queryBuilder.or(`is_public.eq.true${userId ? `,publisher.eq.${userId}` : ''}`);
      } else {
        // Show all resources (admin or owner view)
        // For now, we'll filter by publisher if userId is provided
        if (userId) {
          queryBuilder = queryBuilder.eq('publisher', userId);
        }
      }
    } else {
      // Default: show public resources or user's own resources
      if (userId) {
        queryBuilder = queryBuilder.or(`is_public.eq.true,publisher.eq.${userId}`);
      } else {
        queryBuilder = queryBuilder.eq('is_public', true);
      }
    }

    if (query.publisher) {
      queryBuilder = queryBuilder.eq('publisher', query.publisher);
    }

    // Apply search (searches in title and description)
    if (query.search) {
      const searchTerm = query.search.trim();
      // Use ilike for case-insensitive search
      queryBuilder = queryBuilder.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data: resources, error, count } = await queryBuilder;

    if (error) {
      logError('List resources error', error);
      throw new AppError('Failed to list resources', 500);
    }

    const mappedResources: Resource[] = (resources || []).map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || undefined,
      thumbnail: resource.thumbnail || undefined,
      tags: resource.tags || [],
      isPublic: resource.is_public !== undefined ? resource.is_public : true,
      publisher: resource.publisher,
      youtubeUrl: resource.youtube_url || undefined,
      content: resource.content || undefined,
      category: resource.category || undefined,
      views: resource.views || 0,
      downloads: resource.downloads || 0,
      createdAt: resource.created_at || new Date().toISOString(),
      updatedAt: resource.updated_at || new Date().toISOString(),
    }));

    return {
      resources: mappedResources,
      total: count || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('List resources service error', error);
    throw new AppError('Failed to list resources', 500);
  }
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  input: UpdateResourceInput,
  userId: string
): Promise<Resource> {
  try {
    // First, get the resource to check permissions
    const resource = await getResourceById(resourceId, userId);

    // Check if user is the publisher
    if (resource.publisher !== userId) {
      throw new AppError('You do not have permission to update this resource', 403);
    }

    const supabase = getSupabaseClient();

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.type !== undefined) {
      updateData.type = input.type;
    }

    if (input.url !== undefined) {
      updateData.url = input.url;
    }

    if (input.thumbnail !== undefined) {
      updateData.thumbnail = input.thumbnail;
    }

    if (input.tags !== undefined) {
      updateData.tags = input.tags;
    }

    if (input.isPublic !== undefined) {
      updateData.is_public = input.isPublic;
    }

    if (input.youtubeUrl !== undefined) {
      updateData.youtube_url = input.youtubeUrl;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    updateData.updated_at = new Date().toISOString();

    // Update resource
    const { data: updatedResource, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single();

    if (error || !updatedResource) {
      logError('Update resource error', error);
      throw new AppError('Failed to update resource', 500);
    }

    const result: Resource = {
      id: updatedResource.id,
      title: updatedResource.title,
      description: updatedResource.description,
      type: updatedResource.type,
      url: updatedResource.url || undefined,
      thumbnail: updatedResource.thumbnail || undefined,
      tags: updatedResource.tags || [],
      isPublic: updatedResource.is_public !== undefined ? updatedResource.is_public : true,
      publisher: updatedResource.publisher,
      youtubeUrl: updatedResource.youtube_url || undefined,
      content: updatedResource.content || undefined,
      category: updatedResource.category || undefined,
      views: updatedResource.views || 0,
      downloads: updatedResource.downloads || 0,
      createdAt: updatedResource.created_at || new Date().toISOString(),
      updatedAt: updatedResource.updated_at || new Date().toISOString(),
    };

    logInfo('Resource updated successfully', { resourceId, userId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Update resource service error', error);
    throw new AppError('Failed to update resource', 500);
  }
}

/**
 * Delete resource
 */
export async function deleteResource(resourceId: string, userId: string): Promise<void> {
  try {
    // First, get the resource to check permissions
    const resource = await getResourceById(resourceId, userId);

    // Check if user is the publisher or admin
    if (resource.publisher !== userId) {
      throw new AppError('You do not have permission to delete this resource', 403);
    }

    const supabase = getSupabaseClient();

    // If resource has a file URL, delete from storage
    if (resource.url) {
      try {
        // Extract bucket and path from URL if it's a Supabase Storage URL
        // This is a simplified version - adjust based on your URL format
        const urlParts = resource.url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const path = pathParts.join('/');
          await storageService.deleteFile(bucket, path);
        }
      } catch (storageError) {
        logError('Storage deletion error (continuing)', storageError);
        // Continue with resource deletion even if storage deletion fails
      }
    }

    // Delete resource record
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);

    if (error) {
      logError('Delete resource error', error);
      throw new AppError('Failed to delete resource', 500);
    }

    logInfo('Resource deleted successfully', { resourceId, userId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Delete resource service error', error);
    throw new AppError('Failed to delete resource', 500);
  }
}

/**
 * Track resource view
 */
export async function trackResourceView(
  resourceId: string,
  userId?: string
): Promise<{ views: number }> {
  try {
    const supabase = getSupabaseClient();

    // Get current resource
    const { data: currentResource } = await supabase
      .from('resources')
      .select('views')
      .eq('id', resourceId)
      .single();

    if (!currentResource) {
      return { views: 0 };
    }

    // Increment view count
    const { data: resource, error } = await supabase
      .from('resources')
      .update({
        views: (currentResource.views || 0) + 1,
      })
      .eq('id', resourceId)
      .select('views')
      .single();

    if (error || !resource) {
      logError('Track view error', error);
      // Don't throw error - tracking should be best-effort
      return { views: 0 };
    }

    // Optionally, track individual view records (for analytics)
    if (userId) {
      // You could insert into a views table here for detailed analytics
      // For now, we'll just increment the counter
    }

    logInfo('Resource view tracked', { resourceId, userId });

    return { views: resource.views || 0 };
  } catch (error) {
    logError('Track view service error', error);
    // Don't throw error - tracking should be best-effort
    return { views: 0 };
  }
}

/**
 * Track resource download
 */
export async function trackResourceDownload(resourceId: string): Promise<{ downloads: number }> {
  try {
    const supabase = getSupabaseClient();

    // Get current resource
    const { data: currentResource } = await supabase
      .from('resources')
      .select('downloads')
      .eq('id', resourceId)
      .single();

    if (!currentResource) {
      return { downloads: 0 };
    }

    // Increment download count
    const { data: resource, error } = await supabase
      .from('resources')
      .update({
        downloads: (currentResource.downloads || 0) + 1,
      })
      .eq('id', resourceId)
      .select('downloads')
      .single();

    if (error || !resource) {
      logError('Track download error', error);
      // Don't throw error - tracking should be best-effort
      return { downloads: 0 };
    }

    logInfo('Resource download tracked', { resourceId });

    return { downloads: resource.downloads || 0 };
  } catch (error) {
    logError('Track download service error', error);
    // Don't throw error - tracking should be best-effort
    return { downloads: 0 };
  }
}

/**
 * Get download URL for resource
 */
export async function getResourceDownloadUrl(
  resourceId: string,
  userId?: string
): Promise<{ downloadUrl: string; expiresIn: number }> {
  try {
    // Get resource
    const resource = await getResourceById(resourceId, userId);

    if (!resource.url) {
      throw new AppError('Resource does not have a downloadable file', 400);
    }

    // If URL is a Supabase Storage URL, generate signed URL
    // Otherwise, return the URL as-is
    const urlParts = resource.url.split('/storage/v1/object/public/');
    if (urlParts.length > 1) {
      const [bucket, ...pathParts] = urlParts[1].split('/');
      const path = pathParts.join('/');
      const expiresIn = 3600; // 1 hour
      const signedUrl = await storageService.getSignedUrl(bucket, path, expiresIn);

      // Track download
      await trackResourceDownload(resourceId);

      return {
        downloadUrl: signedUrl,
        expiresIn,
      };
    }

    // Track download
    await trackResourceDownload(resourceId);

    // Return original URL
    return {
      downloadUrl: resource.url,
      expiresIn: 0, // No expiration for external URLs
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get download URL service error', error);
    throw new AppError('Failed to get download URL', 500);
  }
}

