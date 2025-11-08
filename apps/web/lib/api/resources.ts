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
 * Aggregated resource summary metric (from resource_summary_metrics view)
 */
export interface ResourceSummaryMetric {
  resourceId: string;
  title: string;
  type: ResourceType;
  category?: string;
  isPublic: boolean;
  totalViews: number;
  totalDownloads: number;
  lastViewedAt?: string;
  lastDownloadedAt?: string;
}

/**
 * User-specific resource engagement metrics
 */
export interface ResourceEngagementMetric {
  resourceId: string;
  userId: string | null;
  viewsCount: number;
  downloadsCount: number;
  firstViewedAt?: string;
  lastViewedAt?: string;
  lastDownloadedAt?: string;
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
   * List aggregated resource metrics for dashboard displays
   */
  static async listResourceSummaries(params?: {
    isPublic?: boolean;
    limit?: number;
    orderBy?: 'views' | 'downloads' | 'recent';
  }): Promise<ResourceSummaryMetric[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let query = supabase.from('resource_summary_metrics').select('*');

    if (params?.isPublic !== undefined) {
      query = query.eq('is_public', params.isPublic);
    }

    const order = params?.orderBy ?? 'views';
    switch (order) {
      case 'downloads':
        query = query.order('total_downloads', { ascending: false });
        break;
      case 'recent':
        query = query.order('last_viewed_at', { ascending: false });
        break;
      default:
        query = query.order('total_views', { ascending: false });
        break;
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list resource summaries');
    }

    return (data || []).map((row) => this.mapResourceSummaryFromDb(row));
  }

  /**
   * Get aggregated resource metric for a specific resource
   */
  static async getResourceSummary(resourceId: string): Promise<ResourceSummaryMetric | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('resource_summary_metrics')
      .select('*')
      .eq('resource_id', resourceId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to get resource summary');
    }

    if (!data) {
      return null;
    }

    return this.mapResourceSummaryFromDb(data);
  }

  /**
   * Get resource engagement metrics for the current user (or provided user)
   */
  static async getResourceEngagement(
    resourceId: string,
    userId?: string | null
  ): Promise<ResourceEngagementMetric | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    let targetUserId = userId ?? null;

    if (userId === undefined) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id ?? null;
    }

    let query = supabase
      .from('resource_metrics')
      .select('*')
      .eq('resource_id', resourceId)
      .limit(1);

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to get resource engagement metrics');
    }

    if (!data) {
      return null;
    }

    return this.mapResourceEngagementFromDb(data);
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

    const nowIso = new Date().toISOString();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await this.upsertResourceMetric({
      resourceId,
      userId: user?.id ?? null,
      incrementViews: true,
      timestamp: nowIso,
    });

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
   * Track resource download using Supabase
   */
  static async trackDownload(resourceId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const nowIso = new Date().toISOString();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await this.upsertResourceMetric({
      resourceId,
      userId: user?.id ?? null,
      incrementDownloads: true,
      timestamp: nowIso,
    });

    // Update downloads counter on resources table as a fallback
    const { data: resource } = await supabase
      .from('resources')
      .select('downloads')
      .eq('id', resourceId)
      .single();

    if (resource) {
      await supabase
        .from('resources')
        .update({ downloads: (resource.downloads || 0) + 1 })
        .eq('id', resourceId);
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

  private static mapResourceSummaryFromDb(
    dbSummary: Record<string, unknown>
  ): ResourceSummaryMetric {
    return {
      resourceId: dbSummary.resource_id as string,
      title: dbSummary.title as string,
      type: dbSummary.type as ResourceType,
      category: dbSummary.category as string | undefined,
      isPublic: Boolean(dbSummary.is_public),
      totalViews: Number(dbSummary.total_views ?? 0),
      totalDownloads: Number(dbSummary.total_downloads ?? 0),
      lastViewedAt: dbSummary.last_viewed_at
        ? new Date(dbSummary.last_viewed_at as string).toISOString()
        : undefined,
      lastDownloadedAt: dbSummary.last_downloaded_at
        ? new Date(dbSummary.last_downloaded_at as string).toISOString()
        : undefined,
    };
  }

  private static mapResourceEngagementFromDb(
    dbMetric: Record<string, unknown>
  ): ResourceEngagementMetric {
    return {
      resourceId: dbMetric.resource_id as string,
      userId: (dbMetric.user_id as string | null) ?? null,
      viewsCount: Number(dbMetric.views_count ?? 0),
      downloadsCount: Number(dbMetric.downloads_count ?? 0),
      firstViewedAt: dbMetric.first_viewed_at
        ? new Date(dbMetric.first_viewed_at as string).toISOString()
        : undefined,
      lastViewedAt: dbMetric.last_viewed_at
        ? new Date(dbMetric.last_viewed_at as string).toISOString()
        : undefined,
      lastDownloadedAt: dbMetric.last_downloaded_at
        ? new Date(dbMetric.last_downloaded_at as string).toISOString()
        : undefined,
    };
  }

  private static async upsertResourceMetric(params: {
    resourceId: string;
    userId: string | null;
    incrementViews?: boolean;
    incrementDownloads?: boolean;
    timestamp: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { resourceId, userId, incrementViews, incrementDownloads, timestamp } = params;

    const shouldIncrementViews = Boolean(incrementViews);
    const shouldIncrementDownloads = Boolean(incrementDownloads);

    if (!shouldIncrementViews && !shouldIncrementDownloads) {
      return;
    }

    let query = supabase
      .from('resource_metrics')
      .select('id,views_count,downloads_count,first_viewed_at,last_viewed_at,last_downloaded_at')
      .eq('resource_id', resourceId)
      .limit(1);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data: existing, error: selectError } = await query.maybeSingle();

    if (selectError) {
      throw new Error(selectError.message || 'Failed to load resource metrics');
    }

    if (existing) {
      const update: Record<string, unknown> = {};

      if (shouldIncrementViews) {
        update.views_count = Number(existing.views_count ?? 0) + 1;
        update.last_viewed_at = timestamp;
        if (!existing.first_viewed_at) {
          update.first_viewed_at = timestamp;
        }
      }

      if (shouldIncrementDownloads) {
        update.downloads_count = Number(existing.downloads_count ?? 0) + 1;
        update.last_downloaded_at = timestamp;
      }

      if (Object.keys(update).length > 0) {
        const { error: updateError } = await supabase
          .from('resource_metrics')
          .update(update)
          .eq('id', existing.id);

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update resource metrics');
        }
      }
    } else {
      const newRow: Record<string, unknown> = {
        resource_id: resourceId,
        user_id: userId,
        views_count: shouldIncrementViews ? 1 : 0,
        downloads_count: shouldIncrementDownloads ? 1 : 0,
      };

      if (shouldIncrementViews) {
        newRow.first_viewed_at = timestamp;
        newRow.last_viewed_at = timestamp;
      }

      if (shouldIncrementDownloads) {
        newRow.last_downloaded_at = timestamp;
      }

      const { error: insertError } = await supabase.from('resource_metrics').insert(newRow);

      if (insertError) {
        throw new Error(insertError.message || 'Failed to insert resource metrics');
      }
    }
  }
}

