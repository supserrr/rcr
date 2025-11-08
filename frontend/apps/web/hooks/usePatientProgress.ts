/**
 * Hook to manage patient progress modules
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PatientProgressModule,
  ProgressApi,
  UpsertProgressInput,
  UpdateProgressItemInput,
  PatientProgressItem,
} from '@/lib/api/progress';
import { ApiError } from '@/lib/api/client';

export interface UsePatientProgressOptions {
  patientId?: string;
  includeItems?: boolean;
}

export interface UsePatientProgressReturn {
  modules: PatientProgressModule[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateModule: (progressId: string, input: UpsertProgressInput) => Promise<PatientProgressModule>;
  upsertModule: (moduleId: string, input: UpsertProgressInput) => Promise<PatientProgressModule>;
  createItem: (
    progressId: string,
    input: Omit<UpdateProgressItemInput, 'status'> & { title: string; status?: PatientProgressItem['status'] }
  ) => Promise<PatientProgressItem>;
  updateItem: (itemId: string, input: UpdateProgressItemInput) => Promise<PatientProgressItem>;
  deleteItem: (itemId: string) => Promise<void>;
}

export function usePatientProgress(
  options?: UsePatientProgressOptions
): UsePatientProgressReturn {
  const [modules, setModules] = useState<PatientProgressModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patientId = options?.patientId;
  const includeItems = options?.includeItems ?? true;

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ProgressApi.listPatientProgress(patientId, { includeItems });
      setModules(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load progress modules';
      setError(message);
      console.error('Error loading patient progress:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, includeItems]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const refresh = useCallback(async () => {
    await fetchModules();
  }, [fetchModules]);

  const updateModule = useCallback(
    async (progressId: string, input: UpsertProgressInput) => {
      const module = await ProgressApi.updatePatientProgress(progressId, input);
      setModules((prev) =>
        prev.map((existing) => (existing.id === module.id ? module : existing))
      );
      return module;
    },
    []
  );

  const upsertModule = useCallback(
    async (moduleId: string, input: UpsertProgressInput) => {
      const module = await ProgressApi.upsertPatientProgress(moduleId, input, patientId);
      setModules((prev) => {
        const exists = prev.some((item) => item.id === module.id);
        if (exists) {
          return prev.map((item) => (item.id === module.id ? module : item));
        }
        return [module, ...prev];
      });
      return module;
    },
    [patientId]
  );

  const createItem = useCallback(
    async (
      progressId: string,
      input: Omit<UpdateProgressItemInput, 'status'> & {
        title: string;
        status?: PatientProgressItem['status'];
      }
    ) => {
      const item = await ProgressApi.createProgressItem(progressId, input);
      setModules((prev) =>
        prev.map((module) =>
          module.id === progressId
            ? { ...module, items: [...module.items, item].sort((a, b) => a.orderIndex - b.orderIndex) }
            : module
        )
      );
      return item;
    },
    []
  );

  const updateItem = useCallback(
    async (itemId: string, input: UpdateProgressItemInput) => {
      const item = await ProgressApi.updateProgressItem(itemId, input);
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          items: module.items.map((existing) => (existing.id === item.id ? item : existing)),
        }))
      );
      return item;
    },
    []
  );

  const deleteItem = useCallback(async (itemId: string) => {
    await ProgressApi.deleteProgressItem(itemId);
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        items: module.items.filter((item) => item.id !== itemId),
      }))
    );
  }, []);

  return useMemo(
    () => ({
      modules,
      loading,
      error,
      refresh,
      updateModule,
      upsertModule,
      createItem,
      updateItem,
      deleteItem,
    }),
    [modules, loading, error, refresh, updateModule, upsertModule, createItem, updateItem, deleteItem]
  );
}

