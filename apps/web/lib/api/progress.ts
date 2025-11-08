/**
 * Patient progress API service
 *
 * Provides utilities for reading and updating patient learning/program progress
 */

import { createClient } from '@/lib/supabase/client';

export type PatientProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';
export type PatientProgressItemStatus = 'not_started' | 'in_progress' | 'completed';

export interface PatientProgressItem {
  id: string;
  progressId: string;
  itemKey?: string;
  title: string;
  status: PatientProgressItemStatus;
  orderIndex: number;
  completedAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProgressModule {
  id: string;
  patientId: string;
  assignedCounselorId?: string;
  programId?: string;
  moduleId: string;
  moduleTitle?: string;
  status: PatientProgressStatus;
  progressPercent: number;
  startedAt?: string;
  completedAt?: string;
  lastActivityAt: string;
  metadata: Record<string, unknown>;
  items: PatientProgressItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProgressInput {
  moduleId: string;
  programId?: string;
  moduleTitle?: string;
  status?: PatientProgressStatus;
  progressPercent?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateProgressItemInput {
  title?: string;
  status?: PatientProgressItemStatus;
  orderIndex?: number;
  completedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export class ProgressApi {
  /**
   * List patient progress modules for the current user (or specified patient)
   */
  static async listPatientProgress(
    patientId?: string,
    options?: { includeItems?: boolean }
  ): Promise<PatientProgressModule[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    let targetPatientId = patientId;

    if (!targetPatientId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      targetPatientId = user.id;
    }

    const includeItems = options?.includeItems ?? true;
    const selectColumns = includeItems ? '*, patient_progress_items(*)' : '*';

    let query = supabase
      .from('patient_progress')
      .select(selectColumns)
      .eq('patient_id', targetPatientId)
      .order('updated_at', { ascending: false });

    if (includeItems) {
      query = query.order('order_index', {
        ascending: true,
        foreignTable: 'patient_progress_items',
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list patient progress modules');
    }

    return (data || []).map((row) => this.mapProgressModuleFromDb(row, includeItems));
  }

  /**
   * Get a single module progress record
   */
  static async getPatientProgressModule(
    moduleId: string,
    patientId?: string,
    options?: { includeItems?: boolean }
  ): Promise<PatientProgressModule | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    let targetPatientId = patientId;

    if (!targetPatientId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      targetPatientId = user.id;
    }

    const includeItems = options?.includeItems ?? true;
    const selectColumns = includeItems ? '*, patient_progress_items(*)' : '*';

    let query = supabase
      .from('patient_progress')
      .select(selectColumns)
      .eq('patient_id', targetPatientId)
      .eq('module_id', moduleId)
      .limit(1);

    if (includeItems) {
      query = query.order('order_index', {
        ascending: true,
        foreignTable: 'patient_progress_items',
      });
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to get patient progress module');
    }

    if (!data) {
      return null;
    }

    return this.mapProgressModuleFromDb(data, includeItems);
  }

  /**
   * Upsert a progress module (create or update)
   */
  static async upsertPatientProgress(
    moduleId: string,
    input: UpsertProgressInput,
    patientId?: string
  ): Promise<PatientProgressModule> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    let targetPatientId = patientId;

    if (!targetPatientId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      targetPatientId = user.id;
    }

    const payload: Record<string, unknown> = {
      patient_id: targetPatientId,
      module_id: moduleId,
      program_id: input.programId ?? null,
      module_title: input.moduleTitle ?? null,
      status: input.status ?? 'in_progress',
      progress_percent: input.progressPercent ?? 0,
      metadata: input.metadata ?? {},
    };

    if (input.startedAt !== undefined) {
      payload.started_at = input.startedAt;
    }
    if (input.completedAt !== undefined) {
      payload.completed_at = input.completedAt;
    }

    const { data, error } = await supabase
      .from('patient_progress')
      .upsert(payload, { onConflict: 'patient_id,module_id' })
      .select('*, patient_progress_items(*)')
      .eq('patient_id', targetPatientId)
      .eq('module_id', moduleId)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to upsert patient progress module');
    }

    return this.mapProgressModuleFromDb(data, true);
  }

  /**
   * Update progress module fields
   */
  static async updatePatientProgress(
    progressId: string,
    input: UpsertProgressInput
  ): Promise<PatientProgressModule> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    const updateData: Record<string, unknown> = {};

    if (input.programId !== undefined) updateData.program_id = input.programId;
    if (input.moduleTitle !== undefined) updateData.module_title = input.moduleTitle;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.progressPercent !== undefined) updateData.progress_percent = input.progressPercent;
    if (input.startedAt !== undefined) updateData.started_at = input.startedAt;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const { data, error } = await supabase
      .from('patient_progress')
      .update(updateData)
      .eq('id', progressId)
      .select('*, patient_progress_items(*)')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update patient progress module');
    }

    return this.mapProgressModuleFromDb(data, true);
  }

  /**
   * Create a progress item
   */
  static async createProgressItem(
    progressId: string,
    input: Omit<UpdateProgressItemInput, 'status'> & { title: string; status?: PatientProgressItemStatus }
  ): Promise<PatientProgressItem> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    const { data, error } = await supabase
      .from('patient_progress_items')
      .insert({
        progress_id: progressId,
        title: input.title,
        status: input.status ?? 'not_started',
        order_index: input.orderIndex ?? 0,
        completed_at: input.completedAt ?? null,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create progress item');
    }

    return this.mapProgressItemFromDb(data);
  }

  /**
   * Update a progress item
   */
  static async updateProgressItem(
    itemId: string,
    input: UpdateProgressItemInput
  ): Promise<PatientProgressItem> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.orderIndex !== undefined) updateData.order_index = input.orderIndex;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const { data, error } = await supabase
      .from('patient_progress_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update progress item');
    }

    return this.mapProgressItemFromDb(data);
  }

  /**
   * Delete a progress item
   */
  static async deleteProgressItem(itemId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    const { error } = await supabase.from('patient_progress_items').delete().eq('id', itemId);

    if (error) {
      throw new Error(error.message || 'Failed to delete progress item');
    }
  }

  private static mapProgressModuleFromDb(
    dbModule: Record<string, any>,
    includeItems: boolean
  ): PatientProgressModule {
    const items = includeItems && Array.isArray(dbModule.patient_progress_items)
      ? (dbModule.patient_progress_items as Record<string, unknown>[]).map((item) =>
          this.mapProgressItemFromDb(item)
        )
      : [];

    return {
      id: dbModule.id as string,
      patientId: dbModule.patient_id as string,
      assignedCounselorId: dbModule.assigned_counselor_id as string | undefined,
      programId: dbModule.program_id as string | undefined,
      moduleId: dbModule.module_id as string,
      moduleTitle: dbModule.module_title as string | undefined,
      status: (dbModule.status as PatientProgressStatus) ?? 'not_started',
      progressPercent: Number(dbModule.progress_percent ?? 0),
      startedAt: dbModule.started_at ? new Date(dbModule.started_at as string).toISOString() : undefined,
      completedAt: dbModule.completed_at
        ? new Date(dbModule.completed_at as string).toISOString()
        : undefined,
      lastActivityAt: dbModule.last_activity_at
        ? new Date(dbModule.last_activity_at as string).toISOString()
        : dbModule.updated_at
        ? new Date(dbModule.updated_at as string).toISOString()
        : new Date().toISOString(),
      metadata: (dbModule.metadata as Record<string, unknown>) ?? {},
      items,
      createdAt: dbModule.created_at as string,
      updatedAt: dbModule.updated_at as string,
    };
  }

  private static mapProgressItemFromDb(dbItem: Record<string, unknown>): PatientProgressItem {
    return {
      id: dbItem.id as string,
      progressId: dbItem.progress_id as string,
      itemKey: dbItem.item_key as string | undefined,
      title: dbItem.title as string,
      status: (dbItem.status as PatientProgressItemStatus) ?? 'not_started',
      orderIndex: Number(dbItem.order_index ?? 0),
      completedAt: dbItem.completed_at
        ? new Date(dbItem.completed_at as string).toISOString()
        : undefined,
      metadata: (dbItem.metadata as Record<string, unknown>) ?? {},
      createdAt: dbItem.created_at as string,
      updatedAt: dbItem.updated_at as string,
    };
  }
}

