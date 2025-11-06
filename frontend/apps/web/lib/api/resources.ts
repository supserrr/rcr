/**
 * Resources API service
 * 
 * Handles all resource-related API calls
 */

import { api } from './client';

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
   * Create a new resource
   */
  static async createResource(data: CreateResourceInput): Promise<Resource> {
    return api.post<Resource>('/resources', data);
  }

  /**
   * Create a resource with file upload
   */
  static async createResourceWithFile(
    file: File,
    data: Omit<CreateResourceInput, 'url'>
  ): Promise<Resource> {
    return api.upload<Resource>('/resources', file, data);
  }

  /**
   * Get a resource by ID
   */
  static async getResource(resourceId: string): Promise<Resource> {
    return api.get<Resource>(`/resources/${resourceId}`);
  }

  /**
   * List resources
   */
  static async listResources(params?: ResourceQueryParams): Promise<ListResourcesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => queryParams.append('tag', tag));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/resources?${queryString}` : '/resources';
    
    return api.get<ListResourcesResponse>(endpoint);
  }

  /**
   * Update a resource
   */
  static async updateResource(
    resourceId: string,
    data: UpdateResourceInput
  ): Promise<Resource> {
    return api.put<Resource>(`/resources/${resourceId}`, data);
  }

  /**
   * Delete a resource
   */
  static async deleteResource(resourceId: string): Promise<void> {
    return api.delete<void>(`/resources/${resourceId}`);
  }

  /**
   * Get download URL for a resource
   */
  static async getDownloadUrl(resourceId: string): Promise<DownloadUrlResponse> {
    return api.get<DownloadUrlResponse>(`/resources/${resourceId}/download`);
  }

  /**
   * Track resource view
   */
  static async trackView(resourceId: string): Promise<void> {
    return api.post<void>(`/resources/${resourceId}/view`, { resourceId });
  }
}

