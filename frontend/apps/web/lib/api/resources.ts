/**
 * Resources API service
 * 
 * Handles all resource-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Resource type
 */
export type ResourceType = 'audio' | 'pdf' | 'video' | 'article';

/**
 * Resource interface
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
  publisherName?: string;
  youtubeUrl?: string;
  content?: string;
  category?: string;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create resource input
 */
export interface CreateResourceInput {
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  thumbnail?: string;
  tags: string[];
  isPublic?: boolean;
  youtubeUrl?: string;
  content?: string;
  category?: string;
}

/**
 * Update resource input
 */
export interface UpdateResourceInput {
  title?: string;
  description?: string;
  type?: ResourceType;
  url?: string;
  thumbnail?: string;
  tags?: string[];
  isPublic?: boolean;
  youtubeUrl?: string;
  content?: string;
  category?: string;
}

/**
 * Resource query parameters
 */
export interface ResourceQueryParams {
  type?: ResourceType;
  category?: string;
  tag?: string;
  search?: string;
  isPublic?: boolean;
  publisher?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'created_at' | 'views' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

/**
 * List resources response
 */
export interface ListResourcesResponse {
  resources: Resource[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

/**
 * Resources API service
 */
export class ResourcesApi {
  /**
   * Create a new resource using Supabase
   */
  static async createResource(data: CreateResourceInput): Promise<Resource> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user for publisher
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        thumbnail: data.thumbnail,
        tags: data.tags,
        is_public: data.isPublic ?? true,
        publisher: user.id,
        youtube_url: data.youtubeUrl,
        content: data.content,
        category: data.category,
        views: 0,
        downloads: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create resource');
    }

    return this.mapResourceFromDb(resource);
  }

  /**
   * Create a resource with file upload using Supabase Storage
   */
  static async createResourceWithFile(
    file: File,
    data: Omit<CreateResourceInput, 'url'>
  ): Promise<Resource> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user for publisher
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || 'Failed to upload file');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    // Create resource with file URL
    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        title: data.title,
        description: data.description,
        type: data.type,
        url: publicUrl,
        thumbnail: data.thumbnail,
        tags: data.tags,
        is_public: data.isPublic ?? true,
        publisher: user.id,
        youtube_url: data.youtubeUrl,
        content: data.content,
        category: data.category,
        views: 0,
        downloads: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create resource');
    }

    return this.mapResourceFromDb(resource);
  }

  /**
   * Get a resource by ID using Supabase
   */
  static async getResource(resourceId: string): Promise<Resource> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to get resource');
    }

    return this.mapResourceFromDb(resource);
  }

  /**
   * List resources using Supabase
   */
  static async listResources(params?: ResourceQueryParams): Promise<ListResourcesResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let query = supabase.from('resources').select('*', { count: 'exact' });

    if (params?.type) {
      query = query.eq('type', params.type);
    }
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.tag) {
      query = query.contains('tags', [params.tag]);
    }
    if (params?.isPublic !== undefined) {
      query = query.eq('is_public', params.isPublic);
    }
    if (params?.publisher) {
      query = query.eq('publisher', params.publisher);
    }
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Apply sorting
    const sortBy = params?.sortBy || 'created_at';
    const sortOrder = params?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: resources, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list resources');
    }

    return {
      resources: (resources || []).map(r => this.mapResourceFromDb(r)),
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Update a resource using Supabase
   */
  static async updateResource(
    resourceId: string,
    data: UpdateResourceInput
  ): Promise<Resource> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.youtubeUrl !== undefined) updateData.youtube_url = data.youtubeUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;

    const { data: resource, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update resource');
    }

    return this.mapResourceFromDb(resource);
  }

  /**
   * Delete a resource using Supabase
   */
  static async deleteResource(resourceId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      throw new Error(error.message || 'Failed to delete resource');
    }
  }

  /**
   * Get download URL for a resource using Supabase Storage
   */
  static async getDownloadUrl(resourceId: string): Promise<DownloadUrlResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: resource } = await supabase
      .from('resources')
      .select('url')
      .eq('id', resourceId)
      .single();

    if (!resource?.url) {
      throw new Error('Resource URL not found');
    }

    // Generate signed URL for download (valid for 1 hour)
    const { data: signedUrlData, error } = await supabase.storage
      .from('resources')
      .createSignedUrl(resource.url, 3600);

    if (error || !signedUrlData) {
      throw new Error(error?.message || 'Failed to generate download URL');
    }

    return {
      downloadUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  /**
   * Track resource view using Supabase
   */
  static async trackView(resourceId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Increment views count
    const { error } = await supabase.rpc('increment_resource_views', {
      resource_id: resourceId,
    });

    // If RPC function doesn't exist, update directly
    if (error) {
      const { data: resource } = await supabase
        .from('resources')
        .select('views')
        .eq('id', resourceId)
        .single();

      if (resource) {
        await supabase
          .from('resources')
          .update({ views: (resource.views || 0) + 1 })
          .eq('id', resourceId);
      }
    }
  }

  /**
   * Map database resource to API resource format
   */
  private static mapResourceFromDb(dbResource: Record<string, unknown>): Resource {
    return {
      id: dbResource.id as string,
      title: dbResource.title as string,
      description: dbResource.description as string,
      type: dbResource.type as ResourceType,
      url: dbResource.url as string | undefined,
      thumbnail: dbResource.thumbnail as string | undefined,
      tags: (dbResource.tags as string[]) || [],
      isPublic: dbResource.is_public as boolean,
      publisher: dbResource.publisher as string,
      publisherName: dbResource.publisher_name as string | undefined,
      youtubeUrl: dbResource.youtube_url as string | undefined,
      content: dbResource.content as string | undefined,
      category: dbResource.category as string | undefined,
      views: dbResource.views as number || 0,
      downloads: dbResource.downloads as number || 0,
      createdAt: dbResource.created_at as string,
      updatedAt: dbResource.updated_at as string,
    };
  }
}

