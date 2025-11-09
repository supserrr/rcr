/**
 * Admin API service
 * 
 * Handles all admin-related API calls using Supabase
 * Requires admin role
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Admin user interface
 */
export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'patient' | 'counselor' | 'admin';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  metadata?: Record<string, unknown>;
  specialty?: string;
  experience?: number;
  availability?: 'available' | 'busy' | 'offline' | string;
  avatarUrl?: string;
  phoneNumber?: string;
  location?: string;
  languages?: string[];
  bio?: string;
  credentials?: string | string[];
}

/**
 * Analytics data
 */
export interface Analytics {
  users: {
    total: number;
    patients: number;
    counselors: number;
    admins: number;
    newThisMonth: number;
    activeThisMonth: number;
  };
  sessions: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
  };
  resources: {
    total: number;
    public: number;
    private: number;
    views: number;
    downloads: number;
  };
  chats: {
    total: number;
    active: number;
    messages: number;
    unread: number;
  };
  notifications: {
    total: number;
    unread: number;
    byType: Record<string, number>;
  };
}

/**
 * System health status
 */
export interface SystemHealthStatus {
  id: string;
  component: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  severity: 'info' | 'warning' | 'critical';
  summary?: string;
  details?: string;
  telemetry: Record<string, unknown>;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin activity entry
 */
export interface AdminActivityEntry {
  id: string;
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  summary?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Update user role input
 */
export interface UpdateUserRoleInput {
  role: 'patient' | 'counselor' | 'admin';
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * User query parameters
 */
export interface UserQueryParams {
  role?: 'patient' | 'counselor' | 'admin';
  search?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * List users response
 */
export interface ListUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Admin API service
 */
export class AdminApi {
  /**
   * Get analytics data using Supabase
   */
  static async getAnalytics(params?: AnalyticsQueryParams): Promise<Analytics> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const [
      { count: totalUsers },
      { count: patients },
      { count: counselors },
      { count: admins },
      { count: totalSessions },
      { count: scheduledSessions },
      { count: completedSessions },
      { count: cancelledSessions },
      { count: totalResources },
      { count: publicResources },
      resourceSummaryResult,
      { count: totalChats },
      { count: totalMessages },
      { count: unreadMessages },
      { count: totalNotifications },
      { count: unreadNotifications },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'counselor'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled'),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled'),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('resource_summary_metrics').select('total_views,total_downloads'),
      supabase.from('chats').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
    ]);

    if (resourceSummaryResult.error) {
      throw new Error(resourceSummaryResult.error.message || 'Failed to load resource metrics');
    }

    const resourceAggregate = (resourceSummaryResult.data || []).reduce(
      (acc, row) => ({
        views: acc.views + Number(row.total_views ?? 0),
        downloads: acc.downloads + Number(row.total_downloads ?? 0),
      }),
      { views: 0, downloads: 0 }
    );

    return {
      users: {
        total: totalUsers || 0,
        patients: patients || 0,
        counselors: counselors || 0,
        admins: admins || 0,
        newThisMonth: 0, // Would need date filtering
        activeThisMonth: 0, // Would need date filtering
      },
      sessions: {
        total: totalSessions || 0,
        scheduled: scheduledSessions || 0,
        completed: completedSessions || 0,
        cancelled: cancelledSessions || 0,
        thisMonth: 0, // Would need date filtering
      },
      resources: {
        total: totalResources || 0,
        public: publicResources || 0,
        private: (totalResources || 0) - (publicResources || 0),
        views: resourceAggregate.views,
        downloads: resourceAggregate.downloads,
      },
      chats: {
        total: totalChats || 0,
        active: totalChats || 0,
        messages: totalMessages || 0,
        unread: unreadMessages || 0,
      },
      notifications: {
        total: totalNotifications || 0,
        unread: unreadNotifications || 0,
        byType: {}, // Would need grouping
      },
    };
  }

  /**
   * List system health records
   */
  static async listSystemHealth(): Promise<SystemHealthStatus[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('system_health')
      .select('*')
      .order('component', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Failed to load system health');
    }

    return (data || []).map((row) => this.mapSystemHealthFromDb(row));
  }

  /**
   * Upsert a system health record for a component
   */
  static async upsertSystemHealth(
    component: string,
    input: Partial<Omit<SystemHealthStatus, 'id' | 'component' | 'createdAt' | 'updatedAt' | 'lastCheckedAt'>> & {
      status: SystemHealthStatus['status'];
      severity?: SystemHealthStatus['severity'];
      lastCheckedAt?: string;
    }
  ): Promise<SystemHealthStatus> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const payload: Record<string, unknown> = {
      component,
      status: input.status,
      severity: input.severity ?? 'info',
      summary: input.summary ?? null,
      details: input.details ?? null,
      telemetry: input.telemetry ?? {},
      last_checked_at: input.lastCheckedAt ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('system_health')
      .upsert(payload, { onConflict: 'component' })
      .select('*')
      .eq('component', component)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to upsert system health');
    }

    return this.mapSystemHealthFromDb(data);
  }

  /**
   * List admin activity entries
   */
  static async listAdminActivity(params?: { limit?: number }): Promise<AdminActivityEntry[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const limit = params?.limit ?? 50;

    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message || 'Failed to load admin activity');
    }

    return (data || []).map((row) => this.mapAdminActivityFromDb(row));
  }

  /**
   * Get user by ID using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async getUser(userId: string): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'getUser', userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to get user');
    }

    // The Edge Function returns { success: true, data: { ... } }
    if (!data || !data.success || !data.data) {
      throw new Error(data?.error?.message || 'Failed to get user');
    }

    const user = data.data;
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.fullName || user.full_name,
      role: (user.role as AdminUser['role']) || 'patient',
      isVerified: user.isVerified || user.is_verified || false,
      createdAt: user.createdAt || user.created_at,
      lastLogin: user.lastLogin || user.last_login || undefined,
    };
  }

  /**
   * List users using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async listUsers(params?: UserQueryParams): Promise<ListUsersResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await supabase.auth.getUser();

    let currentRole: AdminUser['role'] | 'guest' = 'guest';

    if (currentUserError) {
      const normalizedMessage = currentUserError.message?.toLowerCase() ?? '';
      const isAuthMissing =
        normalizedMessage.includes('auth session missing') ||
        normalizedMessage.includes('session not found') ||
        normalizedMessage.includes('user not authenticated') ||
        normalizedMessage.includes('not authenticated') ||
        normalizedMessage.includes('sub claim in jwt does not exist');

      if (!isAuthMissing) {
        throw new Error(currentUserError.message || 'Failed to determine current user');
      }
    } else if (currentUser) {
      currentRole = (currentUser.user_metadata?.role as AdminUser['role']) || 'patient';
    }
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;

  const toString = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  };

  const toNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const toStringArray = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) {
      const normalized = value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return normalized.length > 0 ? normalized : undefined;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? [trimmed] : undefined;
    }
    return undefined;
  };

  const mapToAdminUser = (raw: any): AdminUser => {
    const metadata = (raw?.metadata ?? {}) as Record<string, any>;

    const specialty =
      toString(raw?.specialty) ??
      toString(metadata.specialty) ??
      toStringArray(metadata.specialties)?.[0] ??
      toString(metadata.expertise);

    const experienceValue =
      raw?.experience ??
      raw?.experience_years ??
      metadata.experience ??
      metadata.experienceYears ??
      metadata.experience_years;
    const experience = toNumber(experienceValue);

    const availabilityRaw = toString(raw?.availability) ?? toString(metadata.availability);
    const allowedAvailability = new Set(['available', 'busy', 'offline']);
    const availability = availabilityRaw && allowedAvailability.has(availabilityRaw)
      ? (availabilityRaw as 'available' | 'busy' | 'offline')
      : undefined;

    const avatarUrl =
      toString(raw?.avatarUrl) ??
      toString(raw?.avatar_url) ??
      toString(metadata.avatar_url) ??
      toString(metadata.avatar);

    const phoneNumber =
      toString(raw?.phoneNumber) ??
      toString(metadata.phoneNumber) ??
      toString(metadata.contact_phone) ??
      toString(metadata.phone);

    const location =
      toString(raw?.location) ??
      toString(metadata.location);

    const languages =
      toStringArray(raw?.languages) ??
      toStringArray(metadata.languages) ??
      toStringArray(metadata.language_preferences);

    const bio =
      toString(raw?.bio) ??
      toString(metadata.bio) ??
      toString(metadata.about);

    const credentialsValue =
      raw?.credentials ??
      metadata.credentials ??
      metadata.certifications ??
      metadata.licenses;

    const credentials =
      Array.isArray(credentialsValue)
        ? toStringArray(credentialsValue)
        : toString(credentialsValue);

    const name =
      toString(raw?.fullName) ??
      toString(raw?.full_name) ??
      toString(metadata.full_name) ??
      toString(metadata.name) ??
      '';

    const email =
      toString(raw?.email) ??
      toString(metadata.email) ??
      toString(metadata.contact_email) ??
      '';

    const createdAt =
      toString(raw?.createdAt) ??
      toString(raw?.created_at) ??
      toString(metadata.created_at) ??
      new Date().toISOString();

    const lastLogin =
      toString(raw?.lastLogin) ??
      toString(raw?.last_login) ??
      toString(metadata.last_login);

    return {
      id: raw?.id ?? '',
      email,
      fullName: name,
      role: (raw?.role as AdminUser['role']) || 'patient',
      isVerified: Boolean(raw?.isVerified ?? raw?.is_verified ?? metadata.is_verified),
      createdAt,
      lastLogin,
      metadata,
      specialty,
      experience: experience,
      availability: availability ?? availabilityRaw ?? undefined,
      avatarUrl,
      phoneNumber,
      location,
      languages,
      bio,
      credentials: credentials,
    };
  };

    if (currentRole === 'admin') {
      try {
        const { data, error } = await supabase.functions.invoke('admin', {
          method: 'POST',
          body: {
            action: 'listUsers',
            limit,
            offset,
            role: params?.role,
            isVerified: params?.isVerified,
            search: params?.search,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (error) {
          throw error;
        }

        if (data?.success && data.data) {
          const response = data.data;

          return {
            users: (response.users || []).map((u: any) =>
              mapToAdminUser(u),
            ),
            total: response.total || response.count || 0,
            limit: response.limit || limit,
            offset: response.offset || offset,
          };
        }
      } catch (functionError: any) {
        console.warn('[AdminApi.listUsers] Edge function unavailable, falling back to profiles query:', functionError?.message ?? functionError);
        // Continue to profiles fallback below
      }
    }

    // Non-admin users query the public.profiles table directly
    let profileQuery = supabase
      .from('profiles')
      .select(
        'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,created_at,updated_at',
        { count: 'exact' },
      );

    if (params?.role) {
      profileQuery = profileQuery.eq('role', params.role);
    }

    if (params?.isVerified !== undefined) {
      profileQuery = profileQuery.eq('is_verified', params.isVerified);
    }

    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      profileQuery = profileQuery.or(
        `full_name.ilike.${searchTerm},metadata->>email.ilike.${searchTerm},metadata->>contact_email.ilike.${searchTerm}`,
      );
    }

    profileQuery = profileQuery
      .order(params?.role === 'counselor' ? 'full_name' : 'created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: profiles, error: profilesError, count } = await profileQuery;

    if (profilesError) {
      throw new Error(profilesError.message || 'Failed to list users');
    }

    return {
      users: (profiles || []).map((profile) =>
        mapToAdminUser({
        id: profile.id,
        email:
          (profile.metadata?.email as string | undefined) ||
          (profile.metadata?.contact_email as string | undefined) ||
          '',
        fullName: profile.full_name || '',
          role: profile.role,
          isVerified: profile.is_verified,
          createdAt: profile.created_at,
          lastLogin: profile.updated_at,
          metadata: profile.metadata ?? {},
          specialty: profile.specialty,
          experience: profile.experience_years,
          availability: profile.availability,
          avatarUrl: profile.avatar_url,
        }),
      ),
      total: count ?? (profiles?.length ?? 0),
      limit,
      offset,
    };
  }

  /**
   * Update user role using Supabase Edge Function.
   * Uses the admin Edge Function with service role key.
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: result, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'updateUserRole', userId, role: data.role },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error || !result) {
      throw new Error(error?.message || result?.error?.message || 'Failed to update user role');
    }

    // The Edge Function returns { success: true, data: { ... } }
    if (!result.success || !result.data) {
      throw new Error(result?.error?.message || 'Failed to update user role');
    }

    const user = result.data;
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.fullName || user.full_name,
      role: (user.role as AdminUser['role']) || 'patient',
      isVerified: user.isVerified || user.is_verified || false,
      createdAt: user.createdAt || user.created_at,
      lastLogin: user.lastLogin || user.last_login || undefined,
    };
  }

  /**
   * Delete user using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async deleteUser(userId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'deleteUser', userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to delete user');
    }

    // The Edge Function returns { success: true, data: null }
    if (!data || !data.success) {
      throw new Error(data?.error?.message || 'Failed to delete user');
    }
  }
  private static mapSystemHealthFromDb(row: Record<string, unknown>): SystemHealthStatus {
    return {
      id: row.id as string,
      component: row.component as string,
      status: row.status as SystemHealthStatus['status'],
      severity: row.severity as SystemHealthStatus['severity'],
      summary: row.summary as string | undefined,
      details: row.details as string | undefined,
      telemetry: (row.telemetry as Record<string, unknown>) ?? {},
      lastCheckedAt: row.last_checked_at
        ? new Date(row.last_checked_at as string).toISOString()
        : new Date().toISOString(),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private static mapAdminActivityFromDb(row: Record<string, unknown>): AdminActivityEntry {
    return {
      id: row.id as string,
      actorId: row.actor_id as string | undefined,
      action: row.action as string,
      targetType: row.target_type as string | undefined,
      targetId: row.target_id as string | undefined,
      summary: row.summary as string | undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    };
  }
}

