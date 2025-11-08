/**
 * React hook for managing resources
 */

import { useState, useEffect, useCallback } from 'react';
import { ResourcesApi, type Resource, type CreateResourceInput, type UpdateResourceInput, type ResourceQueryParams } from '@/lib/api/resources';
import { ApiError } from '@/lib/api/client';

export interface UseResourcesReturn {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  total: number;
  createResource: (data: CreateResourceInput) => Promise<Resource>;
  createResourceWithFile: (file: File, data: Omit<CreateResourceInput, 'url'>) => Promise<Resource>;
  updateResource: (resourceId: string, data: UpdateResourceInput) => Promise<Resource>;
  deleteResource: (resourceId: string) => Promise<void>;
  refreshResources: () => Promise<void>;
}

export function useResources(params?: ResourceQueryParams): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ResourcesApi.listResources(params);
      setResources(response.resources);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load resources';
      setError(errorMessage);
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const createResource = useCallback(async (data: CreateResourceInput): Promise<Resource> => {
    try {
      const resource = await ResourcesApi.createResource(data);
      await fetchResources(); // Refresh list
      return resource;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create resource';
      throw new Error(errorMessage);
    }
  }, [fetchResources]);

  const createResourceWithFile = useCallback(async (file: File, data: Omit<CreateResourceInput, 'url'>): Promise<Resource> => {
    try {
      const resource = await ResourcesApi.createResourceWithFile(file, data);
      await fetchResources(); // Refresh list
      return resource;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to upload resource';
      throw new Error(errorMessage);
    }
  }, [fetchResources]);

  const updateResource = useCallback(async (resourceId: string, data: UpdateResourceInput): Promise<Resource> => {
    try {
      const resource = await ResourcesApi.updateResource(resourceId, data);
      await fetchResources(); // Refresh list
      return resource;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update resource';
      throw new Error(errorMessage);
    }
  }, [fetchResources]);

  const deleteResource = useCallback(async (resourceId: string): Promise<void> => {
    try {
      await ResourcesApi.deleteResource(resourceId);
      await fetchResources(); // Refresh list
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete resource';
      throw new Error(errorMessage);
    }
  }, [fetchResources]);

  return {
    resources,
    loading,
    error,
    total,
    createResource,
    createResourceWithFile,
    updateResource,
    deleteResource,
    refreshResources: fetchResources,
  };
}

