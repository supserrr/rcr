/**
 * Admin API service
 * 
 * Handles all admin-related API calls using Supabase
 * Requires admin role
 */

import { createClient } from '@/lib/supabase/client';
import { getServiceClient } from '@/lib/supabase/service';
import { NotificationService } from './notifications';
import type {
  VisibilitySettings,
  CounselorApprovalStatus,
  CounselorProfileRecord,
  CounselorAvailabilityStatus,
} from '../types';

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
  updatedAt?: string;
  totalSessions?: number;
  scheduledSessions?: number;
  upcomingSessions?: number;
  completedSessions?: number;
  cancelledSessions?: number;
  nextSessionAt?: string;
  lastCompletedSessionAt?: string;
  sessionStats?: {
    totalSessions?: number;
    scheduledSessions?: number;
    upcomingSessions?: number;
    completedSessions?: number;
    cancelledSessions?: number;
    nextSessionAt?: string;
    lastCompletedSessionAt?: string;
  };
  metadata?: Record<string, unknown>;
  preferredLanguage?: string;
  age?: number;
  gender?: string;
  cancerType?: string;
  diagnosisDate?: string;
  currentTreatment?: string;
  treatmentStage?: string;
  supportNeeds?: string;
  familySupport?: string;
  consultationType?: string;
  specialRequests?: string;
  specialty?: string;
  experience?: number;
  experienceYears?: number;
  availability?: 'available' | 'busy' | 'offline' | string;
  availabilityStatus?: CounselorAvailabilityStatus | string;
  avatarUrl?: string;
  phoneNumber?: string;
  contactPhone?: string;
  location?: string;
  languages?: string[];
  bio?: string;
  credentials?: string | string[];
  consultationTypes?: string[];
  specializations?: string[];
  demographicsServed?: string[];
  approachSummary?: string;
  previousEmployers?: string;
  highestDegree?: string;
  university?: string;
  graduationYear?: string | number;
  additionalCertifications?: string[];
  practiceName?: string;
  practiceLocation?: string;
  serviceRegions?: string[];
  supportedTimezones?: string[];
  acceptingNewPatients?: boolean;
  waitlistEnabled?: boolean;
  sessionModalities?: string[];
  sessionDurations?: number[];
  telehealthOffered?: boolean;
  inPersonOffered?: boolean;
  professionalHighlights?: string[];
  educationHistory?: CounselorProfileRecord['educationHistory'];
  licenseNumber?: string;
  licenseJurisdiction?: string;
  licenseExpiry?: string;
  licenseDocumentUrl?: string;
  resumeUrl?: string;
  certificationDocuments?: CounselorProfileRecord['certificationDocuments'];
  professionalReferences?: CounselorProfileRecord['professionalReferences'];
  motivationStatement?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  documents?: Array<{ label: string; url: string; type?: string; storagePath?: string }>;
  visibilitySettings?: VisibilitySettings;
  approvalStatus?: CounselorApprovalStatus;
  approvalSubmittedAt?: string;
  approvalReviewedAt?: string;
  approvalNotes?: string;
  counselorProfile?: CounselorProfileRecord;
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

export interface PlatformMetricsOverview {
  totalUsers: number;
  patientUsers: number;
  counselorUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
  activeUsersLast30Days: number;
  totalSessions: number;
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  sessionsThisMonth: number;
  sessionCompletionRate: number;
  totalResources: number;
  publicResources: number;
  privateResources: number;
  resourceViews: number;
  resourceDownloads: number;
  totalChats: number;
  totalMessages: number;
  unreadMessages: number;
  totalNotifications: number;
  unreadNotifications: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResolutionHours: number;
  overdueTickets: number;
}

export interface PlatformTrendPoint {
  day: string;
  newUsers: number;
  activeUsers: number;
  sessionsTotal: number;
  sessionsCompleted: number;
  sessionsCancelled: number;
  messagesSent: number;
  ticketsCreated: number;
  ticketsResolved: number;
}

export interface TopResourceMetric {
  id: string;
  title: string;
  type: string;
  isPublic: boolean;
  category: string | null;
  views: number;
  downloads: number;
  createdAt: string;
  totalViews: number;
  totalDownloads: number;
  lastViewedAt: string | null;
  lastDownloadedAt: string | null;
}

export interface UserSummary {
  totals: {
    total: number;
    patients: number;
    counselors: number;
    admins: number;
    newThisMonth: number;
    activeLast30Days: number;
  };
  verification: {
    verified: number;
    unverified: number;
  };
}

export interface SupportSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  avgResolutionHours: number;
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

let mapToAdminUserRef: ((raw: any) => AdminUser) | undefined;

// Declare the function type so it's available throughout the file
declare function mapToAdminUser(raw: any): AdminUser;

function ensureMapToAdminUser(): (raw: any) => AdminUser {
  if (!mapToAdminUserRef) {
    throw new Error('mapToAdminUserRef is not initialized');
  }
  return mapToAdminUserRef;
}

/**
 * Admin API service
 */
export class AdminApi {
  static mapOverviewRow(row: Record<string, unknown> | null): PlatformMetricsOverview {
    const data = row ?? {};
    return {
      totalUsers: Number(data.total_users ?? 0),
      patientUsers: Number(data.total_patients ?? 0),
      counselorUsers: Number(data.total_counselors ?? 0),
      adminUsers: Number(data.total_admins ?? 0),
      newUsersThisMonth: Number(data.new_users_this_month ?? 0),
      activeUsersLast30Days: Number(data.active_users_last_30_days ?? 0),
      totalSessions: Number(data.total_sessions ?? 0),
      scheduledSessions: Number(data.scheduled_sessions ?? 0),
      completedSessions: Number(data.completed_sessions ?? 0),
      cancelledSessions: Number(data.cancelled_sessions ?? 0),
      sessionsThisMonth: Number(data.sessions_this_month ?? 0),
      sessionCompletionRate: Number(data.session_completion_rate ?? 0),
      totalResources: Number(data.total_resources ?? 0),
      publicResources: Number(data.public_resources ?? 0),
      privateResources: Number(data.private_resources ?? 0),
      resourceViews: Number(data.resource_views ?? 0),
      resourceDownloads: Number(data.resource_downloads ?? 0),
      totalChats: Number(data.total_chats ?? 0),
      totalMessages: Number(data.total_messages ?? 0),
      unreadMessages: Number(data.unread_messages ?? 0),
      totalNotifications: Number(data.total_notifications ?? 0),
      unreadNotifications: Number(data.unread_notifications ?? 0),
      totalTickets: Number(data.total_tickets ?? 0),
      openTickets: Number(data.open_tickets ?? 0),
      inProgressTickets: Number(data.in_progress_tickets ?? 0),
      resolvedTickets: Number(data.resolved_tickets ?? 0),
      closedTickets: Number(data.closed_tickets ?? 0),
      avgResolutionHours: Number(data.avg_resolution_hours ?? 0),
      overdueTickets: Number(data.overdue_tickets ?? 0),
    };
  }

  /**
   * Fetch aggregated platform metrics for admin overview.
   */
  static async getPlatformMetrics(): Promise<PlatformMetricsOverview> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('admin_metrics_overview')
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to load admin metrics overview');
    }

    return this.mapOverviewRow(data);
  }

  /**
   * Get analytics data mapped to legacy Analytics shape.
   */
  static async getAnalytics(_params?: AnalyticsQueryParams): Promise<Analytics> {
    const overview = await this.getPlatformMetrics();

    return {
      users: {
        total: overview.totalUsers,
        patients: overview.patientUsers,
        counselors: overview.counselorUsers,
        admins: overview.adminUsers,
        newThisMonth: overview.newUsersThisMonth,
        activeThisMonth: overview.activeUsersLast30Days,
      },
      sessions: {
        total: overview.totalSessions,
        scheduled: overview.scheduledSessions,
        completed: overview.completedSessions,
        cancelled: overview.cancelledSessions,
        thisMonth: overview.sessionsThisMonth,
      },
      resources: {
        total: overview.totalResources,
        public: overview.publicResources,
        private: overview.privateResources,
        views: overview.resourceViews,
        downloads: overview.resourceDownloads,
      },
      chats: {
        total: overview.totalChats,
        active: overview.totalChats,
        messages: overview.totalMessages,
        unread: overview.unreadMessages,
      },
      notifications: {
        total: overview.totalNotifications,
        unread: overview.unreadNotifications,
        byType: {},
      },
    };
  }

  /**
   * Retrieve daily trend metrics for the last 30 days.
   */
  static async getDailyTrends(): Promise<PlatformTrendPoint[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('admin_metrics_daily_trends')
      .select('*')
      .order('day', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Failed to load daily trend metrics');
    }

    return (data ?? []).map((row) => ({
      day: row.day as string,
      newUsers: Number(row.new_users ?? 0),
      activeUsers: Number(row.active_users ?? 0),
      sessionsTotal: Number(row.sessions_total ?? 0),
      sessionsCompleted: Number(row.sessions_completed ?? 0),
      sessionsCancelled: Number(row.sessions_cancelled ?? 0),
      messagesSent: Number(row.messages_sent ?? 0),
      ticketsCreated: Number(row.tickets_created ?? 0),
      ticketsResolved: Number(row.tickets_resolved ?? 0),
    }));
  }

  /**
   * Fetch top resources by engagement.
   */
  static async getTopResources(): Promise<TopResourceMetric[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('admin_metrics_top_resources')
      .select('*')
      .order('total_views', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to load top resources');
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: (row.title as string) ?? '',
      type: (row.type as string) ?? '',
      isPublic: Boolean(row.is_public),
      category: (row.category as string) ?? null,
      views: Number(row.views ?? 0),
      downloads: Number(row.downloads ?? 0),
      createdAt: row.created_at as string,
      totalViews: Number(row.total_views ?? 0),
      totalDownloads: Number(row.total_downloads ?? 0),
      lastViewedAt: (row.last_viewed_at as string) ?? null,
      lastDownloadedAt: (row.last_downloaded_at as string) ?? null,
    }));
  }

  /**
   * Provide a summary for user management dashboard.
   */
  static async getUserSummary(): Promise<UserSummary> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const overview = await this.getPlatformMetrics();

    const [verifiedResult, unverifiedResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('is_verified', true),
    ]);

    let adminUsers: any[] | null = null;
    let adminUsersTotal: number | null = null;

    try {
      const fetchedUsers: any[] = [];
      const pageSize = 500;
      let offsetCursor = 0;
      let expectedTotal: number | undefined;

      while (true) {
        const result = await this.invokeAdminFunction<{
          users?: any[];
          total?: number;
          count?: number;
          limit?: number;
          offset?: number;
        }>(
          supabase,
          {
            action: 'listUsers',
            limit: pageSize,
            offset: offsetCursor,
          },
          'listUsers(summary)',
        );

        const pageUsers = Array.isArray(result.users) ? result.users : [];
        fetchedUsers.push(...pageUsers);

        const totalFromResult = result.total ?? result.count;
        if (expectedTotal === undefined && typeof totalFromResult === 'number') {
          expectedTotal = totalFromResult;
        }

        if (pageUsers.length < pageSize) {
          break;
        }

        offsetCursor += pageSize;

        if (expectedTotal !== undefined && fetchedUsers.length >= expectedTotal) {
          break;
        }
      }

      adminUsers = fetchedUsers;
      adminUsersTotal = expectedTotal ?? fetchedUsers.length;
    } catch (error) {
      console.warn(
        '[AdminApi.getUserSummary] Unable to fetch users via admin function:',
        error instanceof Error ? error.message : error,
      );
    }

    const resolveRole = (user: any): AdminUser['role'] | undefined => {
      return (
        this.normalizeRoleValue(user?.role) ??
        (user?.metadata ? this.normalizeRoleValue(user.metadata.role) : undefined)
      );
    };

    const isUserVerified = (user: any): boolean => {
      const direct =
        user?.is_verified ??
        user?.isVerified ??
        user?.metadata?.is_verified ??
        user?.metadata?.isVerified;

      if (typeof direct === 'boolean') {
        return direct;
      }

      if (typeof direct === 'number') {
        return direct === 1;
      }

      if (typeof direct === 'string') {
        const normalized = direct.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes';
      }

      return false;
    };

    const totalUsers =
      adminUsersTotal !== null ? adminUsersTotal : overview.totalUsers;
    const patientUsers =
      adminUsers !== null
        ? adminUsers.filter((user) => resolveRole(user) === 'patient').length
        : overview.patientUsers;
    const counselorUsers =
      adminUsers !== null
        ? adminUsers.filter((user) => resolveRole(user) === 'counselor').length
        : overview.counselorUsers;
    const adminRoleUsers =
      adminUsers !== null
        ? adminUsers.filter((user) => resolveRole(user) === 'admin').length
        : overview.adminUsers;

    const verifiedUsers =
      adminUsers !== null
        ? adminUsers.filter((user) => isUserVerified(user)).length
        : verifiedResult.count ?? 0;
    const unverifiedUsers =
      adminUsers !== null
        ? Math.max(0, (adminUsersTotal ?? adminUsers.length) - verifiedUsers)
        : unverifiedResult.count ?? 0;

    return {
      totals: {
        total: totalUsers,
        patients: patientUsers,
        counselors: counselorUsers,
        admins: adminRoleUsers,
        newThisMonth: overview.newUsersThisMonth,
        activeLast30Days: overview.activeUsersLast30Days,
      },
      verification: {
        verified: verifiedUsers,
        unverified: unverifiedUsers,
      },
    };
  }

  /**
   * Provide support ticket summary for admin dashboards.
   */
  static async getSupportSummary(): Promise<SupportSummary> {
    const overview = await this.getPlatformMetrics();
    return {
      total: overview.totalTickets,
      open: overview.openTickets,
      inProgress: overview.inProgressTickets,
      resolved: overview.resolvedTickets,
      closed: overview.closedTickets,
      overdue: overview.overdueTickets,
      avgResolutionHours: overview.avgResolutionHours,
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

    let user: any;
    try {
      user = await this.invokeAdminFunction<any>(
        supabase,
        { action: 'getUser', userId },
        'getUser',
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user');
    }

    // Use mapToAdminUser to get all normalized data including documents and counselor_profiles
    // The function is hoisted, so it should be available at runtime
    // Initialize the reference if not already done
    if (!mapToAdminUserRef) {
      // Function declarations are hoisted, so mapToAdminUser should be available
      // Access it directly - the function is defined in this file and hoisted
      const func = mapToAdminUser;
      if (func && typeof func === 'function') {
        mapToAdminUserRef = func;
      } else {
        // If direct access fails, the function might not be hoisted in this context
        // This should not happen, but we'll throw a helpful error
        throw new Error('mapToAdminUser function is not available. This indicates a module loading or hoisting issue.');
      }
    }
    
    // Use the reference to map the user data
    if (user && user.data) {
      return mapToAdminUserRef(user.data);
    }
    return mapToAdminUserRef(user);
  }

  /**
   * Get basic user profile information without admin access
   * This method queries profiles directly and works with RLS policies
   */
  static async getUserProfile(userId: string): Promise<Partial<AdminUser>> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, metadata')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile) {
        throw new Error('User not found');
      }

      // Get email from metadata (we can't access other users' emails from auth)
      const email = (profile.metadata as any)?.email || (profile.metadata as any)?.contact_email || '';

      return {
        id: profile.id,
        email,
        fullName: profile.full_name || (profile.metadata as any)?.fullName,
        role: this.normalizeRoleValue(profile.role) || (profile.metadata as any)?.role || 'patient',
        avatarUrl: profile.avatar_url,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error instanceof Error ? error : new Error('Failed to get user profile');
    }
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
    let lastAdminFunctionError: Error | null = null;

    if (typeof window !== 'undefined') {
      const storedRole = window.localStorage.getItem('user-role');
      if (storedRole === 'admin' || storedRole === 'counselor' || storedRole === 'patient') {
        currentRole = storedRole;
      }
    }

    const deriveRoleFromUser = (userRecord: unknown): AdminUser['role'] | undefined => {
      if (!userRecord || typeof userRecord !== 'object') {
        return undefined;
      }

      const record = userRecord as {
        user_metadata?: Record<string, unknown>;
        app_metadata?: Record<string, unknown>;
      };

      const candidates: unknown[] = [
        record.user_metadata?.role,
        record.user_metadata?.roles,
        record.app_metadata?.role,
        record.app_metadata?.roles,
        record.user_metadata?.appRole,
        record.user_metadata?.app_role,
      ];

      for (const candidate of candidates) {
        const role = AdminApi.normalizeRoleValue(candidate);
        if (role) {
          return role;
        }
      }

      return undefined;
    };

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
      currentRole = deriveRoleFromUser(currentUser) ?? 'patient';
      
      // If role is still not determined, try querying the profiles table directly
      if (currentRole !== 'admin' && currentRole !== 'counselor') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          if (profile?.role === 'admin' || profile?.role === 'counselor') {
            currentRole = profile.role;
          }
        } catch (profileError) {
          // If we can't query the profile, continue with the fallback
          console.warn('[AdminApi.listUsers] Could not query profile for role:', profileError);
        }
      }
    }
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;

  const toString = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
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

  const toNumberLoose = (value: unknown): number | undefined => {
    const strict = toNumber(value);
    if (typeof strict === 'number') {
      return strict;
    }
    if (typeof value === 'string') {
      const match = value.match(/\d+(\.\d+)?/);
      if (match) {
        const parsed = Number.parseFloat(match[0]);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  };

  const toBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', 't', '1', 'yes', 'y'].includes(normalized)) {
        return true;
      }
      if (['false', 'f', '0', 'no', 'n'].includes(normalized)) {
        return false;
      }
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

  const toNumberArray = (value: unknown): number[] | undefined => {
    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => toNumberLoose(item))
        .filter((item): item is number => typeof item === 'number');
      return normalized.length > 0 ? normalized : undefined;
    }
    return undefined;
  };

  const toRecord = (value: unknown): Record<string, unknown> | undefined => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return undefined;
  };

  const parseSessionStats = (
    value: unknown,
  ): {
    totalSessions?: number;
    scheduledSessions?: number;
    upcomingSessions?: number;
    completedSessions?: number;
    cancelledSessions?: number;
    nextSessionAt?: string;
    lastCompletedSessionAt?: string;
  } | undefined => {
    const record = toRecord(value);
    if (!record) {
      return undefined;
    }

    const totalSessions = toNumberLoose(
      record.totalSessions ??
        record.total_sessions ??
        record.total ??
        record.count,
    );
    const scheduledSessions = toNumberLoose(
      record.scheduledSessions ??
        record.scheduled_sessions ??
        record.totalScheduled ??
        record.total_scheduled,
    );
    const upcomingSessions = toNumberLoose(
      record.upcomingSessions ??
        record.upcoming_sessions ??
        record.upcoming ??
        record.totalUpcoming ??
        record.total_upcoming,
    );
    const completedSessions = toNumberLoose(
      record.completedSessions ??
        record.completed_sessions ??
        record.completed ??
        record.totalCompleted ??
        record.total_completed,
    );
    const cancelledSessions = toNumberLoose(
      record.cancelledSessions ??
        record.cancelled_sessions ??
        record.canceledSessions ??
        record.canceled_sessions ??
        record.cancelled ??
        record.totalCancelled ??
        record.total_cancelled,
    );

    return {
      totalSessions,
      scheduledSessions,
      upcomingSessions,
      completedSessions,
      cancelledSessions,
      nextSessionAt: toString(
        record.nextSessionAt ??
          record.next_session_at ??
          record.nextSession ??
          record.next_session,
      ),
      lastCompletedSessionAt: toString(
        record.lastCompletedSessionAt ??
          record.last_completed_session_at ??
          record.lastCompleted ??
          record.last_completed,
      ),
    };
  };

  const mapCounselorProfile = (raw: any): CounselorProfileRecord | undefined => {
    if (!raw || typeof raw !== 'object') {
      return undefined;
    }

    const profileId = toString((raw as any).profile_id ?? (raw as any).profileId);
    if (!profileId) {
      return undefined;
    }

    const serviceRegions = toStringArray(raw.service_regions ?? raw.serviceRegions) ?? [];
    const supportedTimezones =
      toStringArray(raw.supported_timezones ?? raw.supportedTimezones) ?? [];
    const sessionModalities =
      toStringArray(raw.session_modalities ?? raw.sessionModalities) ?? ['chat', 'video', 'phone'];
    const sessionDurations = toNumberArray(raw.session_durations ?? raw.sessionDurations) ?? [];
    const specializations = toStringArray(raw.specializations) ?? [];
    const languages = toStringArray(raw.languages) ?? [];
    const demographicsServed = toStringArray(raw.demographics_served ?? raw.demographicsServed) ?? [];
    const highlights = toStringArray(raw.professional_highlights ?? raw.professionalHighlights) ?? [];
    const educationHistory = Array.isArray(raw.education_history ?? raw.educationHistory)
      ? (raw.education_history ?? raw.educationHistory)
      : [];
    const certificationDocuments = Array.isArray(raw.certification_documents ?? raw.certificationDocuments)
      ? (raw.certification_documents ?? raw.certificationDocuments)
      : [];
    const professionalReferences = Array.isArray(raw.professional_references ?? raw.professionalReferences)
      ? (raw.professional_references ?? raw.professionalReferences)
      : [];

    const availabilityRaw =
      toString(raw.availability_status ?? raw.availabilityStatus) ?? 'available';
    const allowedAvailability: CounselorAvailabilityStatus[] = [
      'available',
      'limited',
      'waitlist',
      'unavailable',
    ];
    const availabilityStatus: CounselorAvailabilityStatus = allowedAvailability.includes(
      availabilityRaw as CounselorAvailabilityStatus,
    )
      ? (availabilityRaw as CounselorAvailabilityStatus)
      : 'available';

    return {
      profileId,
      practiceName: toString(raw.practice_name ?? raw.practiceName),
      practiceLocation: toString(raw.practice_location ?? raw.practiceLocation),
      serviceRegions,
      primaryTimezone: toString(raw.primary_timezone ?? raw.primaryTimezone),
      supportedTimezones,
      acceptingNewPatients:
        toBoolean(raw.accepting_new_patients ?? raw.acceptingNewPatients) ?? true,
      waitlistEnabled: toBoolean(raw.waitlist_enabled ?? raw.waitlistEnabled) ?? false,
      availabilityStatus,
      sessionModalities,
      sessionDurations,
      telehealthOffered: toBoolean(raw.telehealth_offered ?? raw.telehealthOffered) ?? true,
      inPersonOffered: toBoolean(raw.in_person_offered ?? raw.inPersonOffered) ?? false,
      languages,
      specializations,
      demographicsServed,
      approachSummary: toString(raw.approach_summary ?? raw.approachSummary),
      bio: toString(raw.bio),
      yearsExperience: toNumber(raw.years_experience ?? raw.yearsExperience),
      professionalHighlights: highlights,
      educationHistory,
      licenseNumber: toString(raw.license_number ?? raw.licenseNumber),
      licenseJurisdiction: toString(raw.license_jurisdiction ?? raw.licenseJurisdiction),
      licenseExpiry: toString(raw.license_expiry ?? raw.licenseExpiry),
      licenseDocumentUrl: toString(raw.license_document_url ?? raw.licenseDocumentUrl),
      resumeUrl: toString(raw.resume_url ?? raw.resumeUrl),
      certificationDocuments,
      cpdStatus: toString(raw.cpd_status ?? raw.cpdStatus),
      cpdRenewalDueAt: toString(raw.cpd_renewal_due_at ?? raw.cpdRenewalDueAt),
      professionalReferences,
      motivationStatement: toString(raw.motivation_statement ?? raw.motivationStatement),
      emergencyContactName: toString(raw.emergency_contact_name ?? raw.emergencyContactName),
      emergencyContactPhone: toString(raw.emergency_contact_phone ?? raw.emergencyContactPhone),
      metadata: toRecord(raw.metadata) ?? {},
      createdAt:
        toString(raw.created_at ?? raw.createdAt) ?? new Date().toISOString(),
      updatedAt:
        toString(raw.updated_at ?? raw.updatedAt) ?? new Date().toISOString(),
    };
  };

  const toAbsoluteAvatarUrl = (value: string | undefined): string | undefined => {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);

    if (!supabaseUrl) {
      return trimmed;
    }

    const normalizedPath = trimmed.replace(/^\/+/, '');

    if (normalizedPath.startsWith('storage/v1/object/public/')) {
      return `${supabaseUrl.replace(/\/+$/, '')}/${normalizedPath}`;
    }

    return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${normalizedPath}`;
  };

  const normalizeMetadata = (input: unknown): Record<string, unknown> => {
    if (!input) {
      return {};
    }

    if (typeof input === 'object' && !Array.isArray(input)) {
      return input as Record<string, unknown>;
    }

    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Swallow JSON errors and fall through to empty object.
      }

      return {};
    }

    return {};
  };

  const resolveAvatarUrl = (
    raw: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ): string | undefined => {
    const candidateValues: unknown[] = [
      raw?.avatarUrl,
      raw?.avatar_url,
      raw?.avatar,
      metadata?.avatarUrl,
      metadata?.avatar_url,
      metadata?.avatar,
      metadata?.profile &&
        typeof metadata.profile === 'object' &&
        (metadata.profile as Record<string, unknown>).avatarUrl,
      metadata?.profile &&
        typeof metadata.profile === 'object' &&
        (metadata.profile as Record<string, unknown>).avatar_url,
      raw?.counselor_profile &&
        typeof raw.counselor_profile === 'object' &&
        (raw.counselor_profile as Record<string, unknown>).avatarUrl,
      raw?.counselor_profile &&
        typeof raw.counselor_profile === 'object' &&
        (raw.counselor_profile as Record<string, unknown>).avatar_url,
      raw?.counselor_profiles &&
        Array.isArray(raw.counselor_profiles) &&
        raw.counselor_profiles.length > 0 &&
        typeof raw.counselor_profiles[0] === 'object' &&
        (raw.counselor_profiles[0] as Record<string, unknown>).avatarUrl,
      raw?.counselor_profiles &&
        Array.isArray(raw.counselor_profiles) &&
        raw.counselor_profiles.length > 0 &&
        typeof raw.counselor_profiles[0] === 'object' &&
        (raw.counselor_profiles[0] as Record<string, unknown>).avatar_url,
    ];

    for (const value of candidateValues) {
      const normalized = toString(value);
      if (normalized) {
        return toAbsoluteAvatarUrl(normalized);
      }
    }

    return undefined;
  };

  function mapToAdminUser(raw: any): AdminUser {
    // This function is defined here and will be hoisted
    const metadata = normalizeMetadata(raw?.metadata);

    const sessionStats =
      parseSessionStats(raw?.session_stats) ??
      parseSessionStats(raw?.sessionStats) ??
      parseSessionStats(metadata.sessionStats) ??
      parseSessionStats(metadata.session_stats);

    const totalSessions =
      toNumberLoose(
        raw?.totalSessions ??
          raw?.total_sessions ??
          metadata.totalSessions ??
          metadata.total_sessions,
      ) ?? sessionStats?.totalSessions;

    const scheduledSessions =
      toNumberLoose(
        raw?.scheduledSessions ??
          raw?.scheduled_sessions ??
          metadata.scheduledSessions ??
          metadata.scheduled_sessions,
      ) ?? sessionStats?.scheduledSessions;

    const upcomingSessions =
      toNumberLoose(
        raw?.upcomingSessions ??
          raw?.upcoming_sessions ??
          metadata.upcomingSessions ??
          metadata.upcoming_sessions,
      ) ?? sessionStats?.upcomingSessions;

    const completedSessions =
      toNumberLoose(
        raw?.completedSessions ??
          raw?.completed_sessions ??
          metadata.completedSessions ??
          metadata.completed_sessions,
      ) ?? sessionStats?.completedSessions;

    const cancelledSessions =
      toNumberLoose(
        raw?.cancelledSessions ??
          raw?.cancelled_sessions ??
          raw?.canceledSessions ??
          raw?.canceled_sessions ??
          metadata.cancelledSessions ??
          metadata.cancelled_sessions ??
          metadata.canceledSessions ??
          metadata.canceled_sessions,
      ) ?? sessionStats?.cancelledSessions;

    const nextSessionAt =
      toString(
        raw?.nextSessionAt ??
          raw?.next_session_at ??
          metadata.nextSessionAt ??
          metadata.next_session_at,
      ) ?? sessionStats?.nextSessionAt;

    const lastCompletedSessionAt =
      toString(
        raw?.lastCompletedSessionAt ??
          raw?.last_completed_session_at ??
          metadata.lastCompletedSessionAt ??
          metadata.last_completed_session_at,
      ) ?? sessionStats?.lastCompletedSessionAt;

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
      metadata.experience_years ??
      metadata.yearsOfExperience ??
      metadata.years_of_experience;
    const experience = toNumberLoose(experienceValue);

    const availabilityRaw = toString(raw?.availability) ?? toString(metadata.availability);
    const allowedAvailability = new Set(['available', 'busy', 'offline']);
    const availability = availabilityRaw && allowedAvailability.has(availabilityRaw)
      ? (availabilityRaw as 'available' | 'busy' | 'offline')
      : undefined;

    const avatarUrl = resolveAvatarUrl(raw ?? {}, metadata);

    const phoneNumber =
      toString(raw?.phoneNumber) ??
      toString(raw?.phone_number) ??
      toString(metadata.phoneNumber) ??
      toString(metadata.contactPhone) ??
      toString(metadata.contact_phone) ??
      toString(metadata.phone);

    const contactPhoneValue =
      toString(raw?.contactPhone) ??
      toString(raw?.contact_phone) ??
      toString(metadata.contactPhone) ??
      toString(metadata.contact_phone) ??
      phoneNumber;

    const location =
      toString(raw?.location) ??
      toString(metadata.location) ??
      toString(metadata.city) ??
      toString(metadata.region) ??
      toString(metadata.country);

    const preferredLanguage =
      toString(raw?.preferredLanguage) ??
      toString(raw?.preferred_language) ??
      toString(metadata.preferredLanguage ?? metadata.preferred_language ?? metadata.language);

    const age = toNumberLoose(raw?.age ?? metadata.age);
    const gender = toString(raw?.gender ?? metadata.gender);
    const cancerType = toString(raw?.cancerType ?? metadata.cancerType);
    const diagnosisDate = toString(raw?.diagnosisDate ?? metadata.diagnosisDate);
    const currentTreatment = toString(raw?.currentTreatment ?? metadata.currentTreatment);
    const treatmentStageValue =
      toString(raw?.treatmentStage ?? metadata.treatmentStage ?? metadata.treatment_stage);
    const supportNeeds = toString(raw?.supportNeeds ?? metadata.supportNeeds);
    const familySupport = toString(raw?.familySupport ?? metadata.familySupport);
    const consultationType = toString(raw?.consultationType ?? metadata.consultationType);
    const specialRequests = toString(raw?.specialRequests ?? metadata.specialRequests);

    let languages =
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

    const visibilitySettings =
      (raw?.visibilitySettings as VisibilitySettings | undefined) ??
      (raw?.visibility_settings as VisibilitySettings | undefined) ??
      (metadata.visibilitySettings as VisibilitySettings | undefined);

    const approvalStatus =
      (toString(raw?.approvalStatus ?? raw?.approval_status) as CounselorApprovalStatus | undefined) ??
      (toString(metadata.approvalStatus) as CounselorApprovalStatus | undefined);

    const approvalSubmittedAt =
      toString(raw?.approval_submitted_at ?? raw?.approvalSubmittedAt ?? metadata.approvalSubmittedAt);

    const approvalReviewedAt =
      toString(raw?.approval_reviewed_at ?? raw?.approvalReviewedAt ?? metadata.approvalReviewedAt);

    const approvalNotes =
      toString(raw?.approval_notes ?? raw?.approvalNotes ?? metadata.approvalNotes);

    // Handle counselor_profiles as array (from edge function) or single object
    const counselorProfileRaw = raw?.counselor_profile ?? 
      (Array.isArray(raw?.counselor_profiles) && raw.counselor_profiles.length > 0 
        ? raw.counselor_profiles[0] 
        : raw?.counselor_profiles) ?? 
      metadata.counselorProfile;
    const counselorProfile = mapCounselorProfile(counselorProfileRaw);

    if ((!languages || languages.length === 0) && counselorProfile?.languages?.length) {
      languages = counselorProfile.languages;
    }

    const specializations =
      toStringArray(metadata.specializations) ??
      counselorProfile?.specializations ??
      (specialty ? [specialty] : undefined);

    const consultationTypes =
      toStringArray(metadata.consultationTypes ?? metadata.consultation_types) ??
      counselorProfile?.sessionModalities ??
      undefined;

    const demographicsServed =
      toStringArray(metadata.demographicsServed ?? metadata.demographics_served) ??
      counselorProfile?.demographicsServed ??
      undefined;

    const additionalCertifications =
      toStringArray(metadata.additionalCertifications ?? metadata.additional_certifications) ?? undefined;

    const previousEmployers =
      toString(metadata.previousEmployers ?? metadata.previous_employers) ?? undefined;

    const highestDegree =
      toString(metadata.highestDegree ?? metadata.highest_degree) ??
      counselorProfile?.educationHistory?.[0]?.degree ??
      undefined;

    const university =
      toString(metadata.university ?? metadata.institution ?? metadata.school) ??
      counselorProfile?.educationHistory?.[0]?.institution ??
      undefined;

    const graduationYear =
      toString(metadata.graduationYear ?? metadata.graduation_year) ??
      (counselorProfile?.educationHistory?.[0]?.graduationYear
        ? String(counselorProfile.educationHistory[0].graduationYear)
        : undefined);

    const experienceYears =
      counselorProfile?.yearsExperience ??
      toNumberLoose(
        metadata.yearsOfExperience ??
          metadata.years_of_experience ??
          metadata.yearsExperience ??
          metadata.years_experience ??
          metadata.experienceYears ??
          metadata.experience_years,
      ) ??
      experience ??
      undefined;

    const availabilityStatus =
      counselorProfile?.availabilityStatus ??
      toString(metadata.availability_status ?? metadata.availabilityStatus) ??
      availability ??
      undefined;

    const practiceName =
      counselorProfile?.practiceName ??
      toString(metadata.practiceName ?? metadata.practice_name);

    const practiceLocation =
      counselorProfile?.practiceLocation ??
      toString(metadata.practiceLocation ?? metadata.practice_location ?? metadata.location);

    const serviceRegions =
      counselorProfile?.serviceRegions && counselorProfile.serviceRegions.length > 0
        ? counselorProfile.serviceRegions
        : toStringArray(metadata.serviceRegions ?? metadata.service_regions);

    const supportedTimezones =
      counselorProfile?.supportedTimezones && counselorProfile.supportedTimezones.length > 0
        ? counselorProfile.supportedTimezones
        : toStringArray(metadata.supportedTimezones ?? metadata.supported_timezones);

    const acceptingNewPatients =
      counselorProfile?.acceptingNewPatients ??
      toBoolean(metadata.acceptingNewPatients ?? metadata.accepting_new_patients) ??
      undefined;

    const waitlistEnabled =
      counselorProfile?.waitlistEnabled ??
      toBoolean(metadata.waitlistEnabled ?? metadata.waitlist_enabled) ??
      undefined;

    const sessionModalities =
      counselorProfile?.sessionModalities && counselorProfile.sessionModalities.length
        ? counselorProfile.sessionModalities
        : toStringArray(metadata.sessionModalities ?? metadata.session_modalities);

    const sessionDurations =
      counselorProfile?.sessionDurations && counselorProfile.sessionDurations.length
        ? counselorProfile.sessionDurations
        : toNumberArray(metadata.sessionDurations ?? metadata.session_durations);

    const telehealthOffered =
      counselorProfile?.telehealthOffered ??
      toBoolean(metadata.telehealthOffered ?? metadata.telehealth_offered) ??
      undefined;

    const inPersonOffered =
      counselorProfile?.inPersonOffered ??
      toBoolean(metadata.inPersonOffered ?? metadata.in_person_offered) ??
      undefined;

    const professionalHighlights =
      counselorProfile?.professionalHighlights && counselorProfile.professionalHighlights.length
        ? counselorProfile.professionalHighlights
        : toStringArray(metadata.professionalHighlights ?? metadata.professional_highlights);

    const educationHistory =
      counselorProfile?.educationHistory && counselorProfile.educationHistory.length
        ? counselorProfile.educationHistory
        : Array.isArray(metadata.educationHistory ?? metadata.education_history)
          ? ((metadata.educationHistory ?? metadata.education_history) as Array<Record<string, unknown>>).map(
              (entry) => ({
                degree: toString(entry?.degree ?? entry?.qualification),
                institution: toString(entry?.institution ?? entry?.school),
                graduationYear: toNumber(entry?.graduationYear ?? entry?.graduation_year),
              }),
            )
          : undefined;

    const licenseNumber =
      counselorProfile?.licenseNumber ??
      toString(metadata.licenseNumber ?? metadata.license_number);

    const licenseJurisdiction =
      counselorProfile?.licenseJurisdiction ??
      toString(metadata.licenseJurisdiction ?? metadata.license_jurisdiction);

    const licenseExpiry =
      counselorProfile?.licenseExpiry ??
      toString(metadata.licenseExpiry ?? metadata.license_expiry);

    let licenseDocumentUrl =
      toAbsoluteAvatarUrl(
        counselorProfile?.licenseDocumentUrl ??
          toString(metadata.licenseDocumentUrl ?? metadata.license_document_url),
      ) ?? undefined;

    let resumeUrl =
      toAbsoluteAvatarUrl(
        counselorProfile?.resumeUrl ??
          toString(metadata.resumeUrl ?? metadata.resume_url),
      ) ?? undefined;

    let professionalReferences: Array<Record<string, unknown>> | undefined =
      Array.isArray(counselorProfile?.professionalReferences)
        ? (counselorProfile?.professionalReferences as Array<Record<string, unknown>>)
        : undefined;

    if (
      !professionalReferences &&
      Array.isArray(metadata.professionalReferences ?? metadata.professional_references)
    ) {
      professionalReferences = (metadata.professionalReferences ?? metadata.professional_references) as Array<
        Record<string, unknown>
      >;
    }

    const rawProfessionalReferences =
      toString(metadata.professionalReferencesRaw ?? metadata.professional_references_raw);
    if ((!professionalReferences || professionalReferences.length === 0) && rawProfessionalReferences) {
      const entries = rawProfessionalReferences
        .split(/\n{2,}|\r?\n\r?\n/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      if (entries.length > 0) {
        professionalReferences = entries.map((entry) => ({
          name: entry,
        }));
      }
    }

    const motivationStatement =
      counselorProfile?.motivationStatement ??
      toString(metadata.motivationStatement ?? metadata.motivation);

    const emergencyContactName =
      counselorProfile?.emergencyContactName ??
      toString(metadata.emergencyContactName ?? metadata.emergency_contact_name);

    const emergencyContactPhone =
      counselorProfile?.emergencyContactPhone ??
      toString(metadata.emergencyContactPhone ?? metadata.emergency_contact_phone ?? metadata.emergencyContact);

    const approachSummary =
      counselorProfile?.approachSummary ??
      toString(metadata.approachSummary ?? metadata.approach_summary);

    let certificationDocuments =
      counselorProfile?.certificationDocuments ??
      (Array.isArray(metadata.certificationDocuments ?? metadata.certification_documents)
        ? (metadata.certificationDocuments ?? metadata.certification_documents)
        : undefined);

    const metadataDocuments = metadata.documents;

    const documents: Array<{ label: string; url: string; type?: string; storagePath?: string }> = [];

    const pushDocument = (
      label: string,
      value: unknown,
      options?: { type?: string },
    ) => {
      const normalized = toString(value);
      if (!normalized) {
        return;
      }
      const url = toAbsoluteAvatarUrl(normalized);
      if (!url) {
        return;
      }
      if (!documents.some((doc) => doc.url === url)) {
        documents.push({
          label,
          url,
          type: options?.type,
          storagePath: normalized.startsWith('http') ? undefined : normalized,
        });
      }
    };

    if (Array.isArray(metadata.uploadedDocuments)) {
      (metadata.uploadedDocuments as Array<Record<string, unknown>>).forEach((doc) => {
        const urlValue = doc.url ?? doc.storagePath;
        const labelValue = doc.label ?? doc.name ?? doc.type ?? 'Document';
        const url = toAbsoluteAvatarUrl(toString(urlValue));
        if (url && !documents.some((existing) => existing.url === url)) {
          documents.push({
            label: toString(labelValue) ?? 'Document',
            url,
            type: toString(doc.type),
            storagePath: typeof urlValue === 'string' && !urlValue.startsWith('http') ? urlValue : undefined,
          });
        }
      });
    }

    if (Array.isArray(raw?.counselor_documents)) {
      raw.counselor_documents.forEach((doc: any) => {
        if (doc && typeof doc === 'object') {
          const storagePath = toString(doc.storage_path ?? doc.storagePath ?? doc.path);
          const url = toAbsoluteAvatarUrl(storagePath ?? toString(doc.url));
          if (url && !documents.some((existing) => existing.url === url)) {
            documents.push({
              label:
                toString(doc.display_name ?? doc.displayName ?? doc.documentType ?? doc.document_type) ??
                'Document',
              url,
              type: toString(doc.document_type ?? doc.documentType),
              storagePath: storagePath ?? undefined,
            });
          }
        }
      });
    }

    pushDocument('Resume', metadata.resumeFile ?? metadata.resume_file ?? resumeUrl, { type: 'resume' });
    pushDocument('License', metadata.licenseFile ?? metadata.license_file ?? licenseDocumentUrl, {
      type: 'license',
    });
    pushDocument(
      'Certifications',
      metadata.certificationsFile ?? metadata.certifications_file,
      { type: 'certification' },
    );

    if (Array.isArray(certificationDocuments)) {
      certificationDocuments.forEach((doc) => {
        const url = toAbsoluteAvatarUrl(toString((doc as Record<string, unknown>).url));
        if (url) {
          if (!documents.some((existing) => existing.url === url)) {
            documents.push({
              label: toString((doc as Record<string, unknown>).name) ?? 'Certification',
              url,
              type: 'certification',
              storagePath: toString((doc as Record<string, unknown>).url) ?? undefined,
            });
          }
        }
      });
    }

    if (Array.isArray(metadataDocuments)) {
      metadataDocuments.forEach((doc) => {
        if (doc && typeof doc === 'object') {
          const record = doc as Record<string, unknown>;
          const urlValue = record.url ?? record.fileUrl ?? record.path;
          const labelValue = record.label ?? record.name ?? record.type ?? 'Document';
          const url = toAbsoluteAvatarUrl(toString(urlValue));
          if (url && !documents.some((existing) => existing.url === url)) {
            documents.push({
              label: toString(labelValue) ?? 'Document',
              url,
              type: toString(record.type),
              storagePath: typeof urlValue === 'string' && !urlValue.startsWith('http') ? urlValue : undefined,
            });
          }
        }
      });
    }

    const resolvedLicenseDoc = documents.find((doc) => doc.type === 'license');
    const resolvedResumeDoc = documents.find((doc) => doc.type === 'resume');
    const resolvedCertificationDocs = documents.filter((doc) => doc.type === 'certification');

    if (!licenseDocumentUrl && resolvedLicenseDoc) {
      licenseDocumentUrl = resolvedLicenseDoc.url;
    }

    if (!resumeUrl && resolvedResumeDoc) {
      resumeUrl = resolvedResumeDoc.url;
    }

    if (
      (!certificationDocuments ||
        (Array.isArray(certificationDocuments) && certificationDocuments.length === 0)) &&
      resolvedCertificationDocs.length > 0
    ) {
      certificationDocuments = resolvedCertificationDocs.map((doc) => ({
        name: doc.label,
        url: doc.storagePath ?? doc.url,
      }));
    }

    const createdAt =
      toString(raw?.createdAt) ??
      toString(raw?.created_at) ??
      toString(metadata.created_at) ??
      new Date().toISOString();

    const updatedAt =
      toString(raw?.updatedAt) ??
      toString(raw?.updated_at) ??
      toString(metadata.updatedAt ?? metadata.updated_at);

    const lastLogin =
      toString(raw?.lastLogin) ??
      toString(raw?.last_login) ??
      toString(metadata.last_login);

    const role =
      AdminApi.normalizeRoleValue(raw?.role) ??
      AdminApi.normalizeRoleValue(metadata.role) ??
      ('patient' as AdminUser['role']);

    return {
      id: raw?.id ?? '',
      email,
      fullName: name,
      role,
      isVerified: Boolean(raw?.isVerified ?? raw?.is_verified ?? metadata.is_verified),
      createdAt,
      lastLogin,
      updatedAt,
      metadata,
      specialty,
      experience: experience,
      experienceYears,
      availability: availability ?? availabilityRaw ?? undefined,
      availabilityStatus,
      avatarUrl,
      phoneNumber,
      contactPhone: contactPhoneValue,
      location,
      totalSessions,
      scheduledSessions,
      upcomingSessions,
      completedSessions,
      cancelledSessions,
      nextSessionAt,
      lastCompletedSessionAt,
      sessionStats,
      preferredLanguage,
      age,
      gender,
      cancerType,
      diagnosisDate,
      currentTreatment,
      treatmentStage: treatmentStageValue,
      supportNeeds,
      familySupport,
      consultationType,
      specialRequests,
      languages,
      bio,
      credentials: credentials,
      consultationTypes,
      specializations,
      demographicsServed,
      additionalCertifications,
      previousEmployers,
      highestDegree,
      university,
      graduationYear,
      practiceName,
      practiceLocation,
      serviceRegions,
      supportedTimezones,
      acceptingNewPatients,
      waitlistEnabled,
      sessionModalities,
      sessionDurations,
      telehealthOffered,
      inPersonOffered,
      professionalHighlights,
      educationHistory,
      licenseNumber,
      licenseJurisdiction,
      licenseExpiry,
      licenseDocumentUrl,
      resumeUrl,
      certificationDocuments: certificationDocuments as CounselorProfileRecord['certificationDocuments'] | undefined,
      professionalReferences: professionalReferences as CounselorProfileRecord['professionalReferences'] | undefined,
      motivationStatement,
      emergencyContactName,
      emergencyContactPhone,
      approachSummary,
      documents: documents.length > 0 ? documents : undefined,
      visibilitySettings,
      approvalStatus,
      approvalSubmittedAt,
      approvalReviewedAt,
      approvalNotes,
      counselorProfile,
    };
  }

  // Initialize the reference immediately after the function is defined
  // The function declaration is hoisted, so it's available here at runtime
  // We must initialize it here so getUser can use it even if called before listUsers
  // Use a type-safe approach that works at runtime
  try {
    // Access the hoisted function - it should be available due to hoisting
    // We use a workaround to access it since TypeScript doesn't recognize hoisting
    const func = (() => {
      // Function declarations are hoisted to the top of their scope
      // At runtime, mapToAdminUser should be available here
      return typeof mapToAdminUser !== 'undefined' ? mapToAdminUser : null;
    })();
    
    if (func && typeof func === 'function') {
      mapToAdminUserRef = func;
    }
  } catch (e) {
    // If initialization fails, it will be done lazily in getUser or listUsers
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[AdminApi] Could not initialize mapToAdminUserRef at module load:', e);
    }
  }

    if (currentRole === 'admin') {
      const functionPayload: Record<string, unknown> = {
            action: 'listUsers',
            limit,
            offset,
      };

      if (params?.role !== undefined) {
        functionPayload.role = params.role;
      }

      if (params?.isVerified !== undefined) {
        functionPayload.isVerified = params.isVerified;
      }

      if (params?.search !== undefined && params.search.trim().length > 0) {
        functionPayload.search = params.search.trim();
      }

      try {
        const response = await this.invokeAdminFunction<{
          users?: any[];
          total?: number;
          count?: number;
          limit?: number;
          offset?: number;
        }>(supabase, functionPayload, 'listUsers');

        const usersFromResponse = Array.isArray(response.users) ? response.users : [];
        const mapper = ensureMapToAdminUser();

        if (process.env.NODE_ENV !== 'production') {
          console.info(
            '[AdminApi.listUsers] Edge function returned',
            usersFromResponse.length,
            'users',
          );
        }

          return {
          users: usersFromResponse.map((u: any) => mapper(u)),
          total: response.total ?? response.count ?? usersFromResponse.length,
          limit: response.limit ?? limit,
          offset: response.offset ?? offset,
          };
      } catch (error) {
        lastAdminFunctionError =
          error instanceof Error
            ? error
            : new Error(error ? String(error) : 'Unknown admin function error');
        console.warn(
          '[AdminApi.listUsers] Edge function unavailable, falling back to profiles query:',
          error instanceof Error ? error.message : error,
        );
      }
    }

    // Non-admin users query the public.profiles table directly
    let profileQuery = supabase
      .from('profiles')
      .select(
        'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,approval_notes,counselor_profiles(*)',
        { count: 'exact' },
      );

    if (params?.role) {
      profileQuery = profileQuery.eq('role', params.role);
    }

    if (params?.isVerified !== undefined) {
      if (params.isVerified) {
        profileQuery = profileQuery.eq('is_verified', true);
      } else {
        profileQuery = profileQuery.not('is_verified', 'is', true);
      }
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
      if (lastAdminFunctionError) {
        throw new Error(
          `${profilesError.message || 'Failed to list users'}; admin function error=${lastAdminFunctionError.message}`,
        );
      }
      throw new Error(profilesError.message || 'Failed to list users');
    }

    const sessionStatsByProfile = new Map<string, Record<string, unknown>>();
    const profileIds = Array.isArray(profiles) ? profiles.map((profile) => profile.id) : [];

    if (profileIds.length > 0 && (!params?.role || params.role === 'counselor')) {
      const { data: sessionStatsData, error: sessionStatsError } = await supabase
        .from('counselor_session_stats')
        .select(
          'user_id,total_sessions,total_scheduled,upcoming_sessions,completed_sessions,cancelled_sessions,next_session_at,last_completed_session_at',
        )
        .in('user_id', profileIds);

      if (sessionStatsError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[AdminApi.listUsers] Failed to load session stats via fallback query:',
            sessionStatsError.message || sessionStatsError,
          );
        }
      } else if (Array.isArray(sessionStatsData)) {
        sessionStatsData.forEach((stat) => {
          if (stat && typeof stat === 'object' && 'user_id' in stat) {
            sessionStatsByProfile.set(String((stat as Record<string, unknown>).user_id), stat as Record<string, unknown>);
          }
        });
      }
    }

    const mapper = ensureMapToAdminUser();

    return {
      users: (profiles || []).map((profile) =>
        mapper({
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
          visibility_settings: profile.visibility_settings,
          approval_status: profile.approval_status,
          approval_submitted_at: profile.approval_submitted_at,
          approval_reviewed_at: profile.approval_reviewed_at,
          approval_notes: profile.approval_notes,
          counselor_profiles: Array.isArray(profile.counselor_profiles)
            ? profile.counselor_profiles[0]
            : profile.counselor_profiles,
          session_stats: sessionStatsByProfile.get(profile.id),
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

    const accessToken = await this.getAccessToken(supabase);

    const { data: result, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'updateUserRole', userId, role: data.role },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

    const accessToken = await this.getAccessToken(supabase);

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'deleteUser', userId },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

  static async updateCounselorApproval(
    counselorId: string,
    input: {
      approvalStatus: CounselorApprovalStatus;
      approvalNotes?: string;
      visibilitySettings?: VisibilitySettings;
    },
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message || 'Failed to load current user');
    }

    if (!user) {
      throw new Error('You must be signed in as an administrator to change approval status.');
    }

    let updatedRaw: any;

    try {
      updatedRaw = await this.invokeAdminFunction<any>(
        supabase,
        {
          action: 'updateCounselorApproval',
          counselorId,
          approvalStatus: input.approvalStatus,
          approvalNotes: input.approvalNotes ?? null,
          visibilitySettings: input.visibilitySettings ?? null,
        },
        'updateCounselorApproval',
      );
    } catch (error) {
      console.warn(
        '[AdminApi.updateCounselorApproval] Falling back to direct update path:',
        error instanceof Error ? error.message : error,
      );

      let fallbackError: unknown = null;

      if (!updatedRaw) {
        try {
          let accessTokenForFallback: string | null = null;
          try {
            accessTokenForFallback = await this.getAccessToken(supabase);
          } catch (tokenError) {
            console.warn(
              '[AdminApi.updateCounselorApproval] Unable to retrieve access token for fallback API call:',
              tokenError,
            );
          }

          const fallbackRequestBody: Record<string, unknown> = {
            counselorId,
            approvalStatus: input.approvalStatus,
            approvalNotes: input.approvalNotes ?? null,
          };

          if (input.visibilitySettings != null) {
            fallbackRequestBody.visibilitySettings = input.visibilitySettings;
          }

          const fallbackResponse = await fetch('/api/admin/counselors/approval', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(accessTokenForFallback ? { Authorization: `Bearer ${accessTokenForFallback}` } : {}),
            },
            body: JSON.stringify(fallbackRequestBody),
          });

          if (!fallbackResponse.ok) {
            let errorMessage = `Fallback approval API returned status ${fallbackResponse.status}`;
            try {
              const errorPayload = await fallbackResponse.json();
              if (errorPayload?.error) {
                errorMessage = errorPayload.error;
              }
            } catch (_jsonError) {
              // Ignore JSON parse errors and use default message.
            }
            throw new Error(errorMessage);
          }

          const fallbackResponsePayload: { success: boolean; data?: unknown } = await fallbackResponse.json();
          if (!fallbackResponsePayload?.success || !fallbackResponsePayload.data) {
            throw new Error('Approval API response did not include updated data.');
          }

          updatedRaw = fallbackResponsePayload.data;
        } catch (fallbackApiError) {
          fallbackError = fallbackApiError;
          console.warn(
            '[AdminApi.updateCounselorApproval] Fallback API call failed:',
            fallbackApiError instanceof Error ? fallbackApiError.message : fallbackApiError,
          );
        }
      }

      if (!updatedRaw) {
        try {
          const updatePayload: Record<string, unknown> = {
      approval_status: input.approvalStatus,
      approval_reviewed_at: new Date().toISOString(),
      approval_reviewed_by: user.id,
      approval_notes: input.approvalNotes ?? null,
    };

          if (input.visibilitySettings !== undefined) {
            updatePayload.visibility_settings = input.visibilitySettings;
    }

          const serviceClient = getServiceClient();
          const client = serviceClient ?? supabase;

          const { data: updatedProfile, error: updateError } = await client
            .from('profiles')
            .update(updatePayload)
            .eq('id', counselorId)
            .select(
              'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
                'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
                'approval_notes,counselor_profiles(*)',
            )
            .maybeSingle();

          if (updateError || !updatedProfile) {
            throw updateError ?? new Error('Failed to update counselor approval status');
          }

          const { data: documents, error: documentsError } = await client
            .from('counselor_documents')
            .select('*')
            .eq('profile_id', counselorId);

          if (documentsError) {
            console.warn(
              '[AdminApi.updateCounselorApproval] Failed to load counselor documents during direct update:',
              documentsError,
            );
          }

          updatedRaw = Object.assign({}, updatedProfile, {
            counselor_documents: documents ?? [],
          });
        } catch (directUpdateError) {
          console.error(
            '[AdminApi.updateCounselorApproval] Direct profile update failed:',
            directUpdateError instanceof Error ? directUpdateError.message : directUpdateError,
          );
          if (fallbackError) {
            console.error(
              '[AdminApi.updateCounselorApproval] Fallback API error:',
              fallbackError instanceof Error ? fallbackError.message : fallbackError,
            );
          }
          throw directUpdateError instanceof Error
            ? directUpdateError
            : new Error('Failed to update counselor approval status');
    }
      }

      if (!updatedRaw) {
        throw fallbackError instanceof Error
          ? fallbackError
          : new Error('Failed to update counselor approval status.');
      }
    }

    const mapper = ensureMapToAdminUser();
    const updatedCounselor = mapper(updatedRaw);

    const approvalMessages: Record<CounselorApprovalStatus, { title: string; message: string }> = {
      approved: {
        title: 'Your counselor profile has been approved',
        message: 'Congratulations! Your counselor profile is live and you can now access the full dashboard.',
      },
      pending: {
        title: 'Your counselor profile is still under review',
        message: 'Our team is still reviewing your submission. We will notify you once a decision has been made.',
      },
      needs_more_info: {
        title: 'More information requested for your counselor profile',
        message: input.approvalNotes
          ? input.approvalNotes
          : 'We need a little more detail before we can approve your profile. Please review your application and update the requested information.',
      },
      rejected: {
        title: 'Your counselor profile could not be approved',
        message: input.approvalNotes
          ? input.approvalNotes
          : 'We were unable to approve your counselor profile at this time. Please contact support for more details.',
      },
      suspended: {
        title: 'Your counselor profile has been suspended',
        message: input.approvalNotes
          ? input.approvalNotes
          : 'Your counselor access has been suspended. Please reach out to the admin team for further assistance.',
      },
    };

    const notification = approvalMessages[input.approvalStatus];

    try {
      await NotificationService.enqueue({
        userId: counselorId,
        typeKey: 'counselor_approval',
        title: notification.title,
        message: notification.message,
        channels: ['email', 'in_app'],
        metadata: {
          approvalStatus: input.approvalStatus,
        },
      });
    } catch (notificationError) {
      console.warn('[AdminApi.updateCounselorApproval] Failed to enqueue approval notification', notificationError);
    }

    return updatedCounselor;
  }

  /**
   * Assign a patient to a counselor by updating the assigned_counselor_id field.
   * 
   * @param patientId - The ID of the patient to assign
   * @param counselorId - The ID of the counselor to assign the patient to (null to unassign)
   * @returns The updated patient user object
   */
  static async assignPatientToCounselor(
    patientId: string,
    counselorId: string | null
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Verify user is authenticated and get their role
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      throw new Error('You must be signed in to assign patients.');
    }

    // Try to verify user role (this may be blocked by RLS, but we'll try)
    let userRole: string | null = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();
      userRole = profile?.role || null;
    } catch (e) {
      // RLS may block this, that's okay - we'll proceed
      console.warn('[assignPatientToCounselor] Could not verify user role:', e);
    }

    // Use admin Edge Function for admin access (bypasses RLS)
    // TODO: Replace with proper RLS policies later
    let updatedUser: any;
    try {
      updatedUser = await this.invokeAdminFunction<any>(
        supabase,
        { 
          action: 'assignPatientToCounselor', 
          patientId,
          counselorId 
        },
        'assignPatientToCounselor',
      );
    } catch (error) {
      console.error('[assignPatientToCounselor] Edge function error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign patient to counselor';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Patient not found') || errorMessage.includes('not found or invalid')) {
        throw new Error(`Patient not found. Please ensure the patient ID is correct and the patient exists in the system.`);
      }
      if (errorMessage.includes('Counselor not found') || errorMessage.includes('Counselor not found or invalid')) {
        throw new Error(`Counselor not found. Please ensure the counselor ID is correct.`);
      }
      if (errorMessage.includes('permission') || errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        const roleInfo = userRole ? ` (Your role: ${userRole})` : '';
        throw new Error(
          `You do not have permission to assign patients${roleInfo}. ` +
          `The edge function may need to be deployed with the latest changes to allow counselors to assign patients. ` +
          `Please contact an administrator or ensure the admin edge function has been deployed.`
        );
      }
      
      throw new Error(errorMessage);
    }

    // Map to AdminUser format
    return {
      id: updatedUser.id,
      email: updatedUser.email || '',
      fullName: updatedUser.fullName || updatedUser.full_name || '',
      role: this.normalizeRoleValue(updatedUser.role) ?? ('patient' as AdminUser['role']),
      isVerified: updatedUser.isVerified || updatedUser.is_verified || false,
      createdAt: updatedUser.createdAt || updatedUser.created_at,
      lastLogin: updatedUser.lastLogin || updatedUser.last_login || undefined,
      metadata: updatedUser.metadata ?? {},
      specialty: updatedUser.specialty,
      experience: updatedUser.experience || updatedUser.experience_years,
      availability: updatedUser.availability,
      avatarUrl: updatedUser.avatarUrl || updatedUser.avatar_url,
      visibilitySettings: updatedUser.visibilitySettings || updatedUser.visibility_settings,
      approvalStatus: updatedUser.approvalStatus || updatedUser.approval_status,
      approvalSubmittedAt: updatedUser.approvalSubmittedAt || updatedUser.approval_submitted_at,
      approvalReviewedAt: updatedUser.approvalReviewedAt || updatedUser.approval_reviewed_at,
      approvalNotes: updatedUser.approvalNotes || updatedUser.approval_notes,
    };
  }

  private static normalizeRoleValue(value: unknown): AdminUser['role'] | undefined {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'patient' || normalized === 'counselor' || normalized === 'admin') {
        return normalized as AdminUser['role'];
      }
      return undefined;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const resolved = this.normalizeRoleValue(entry);
        if (resolved) {
          return resolved;
        }
      }
    }

    return undefined;
  }

  private static sanitizeFunctionPayload(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitizedEntries = Object.entries(payload).filter(([, value]) => value !== undefined);
    return Object.fromEntries(sanitizedEntries);
  }

  private static async invokeAdminFunction<T>(
    supabase: NonNullable<ReturnType<typeof createClient>>,
    payload: Record<string, unknown>,
    debugLabel?: string,
  ): Promise<T> {
    const accessToken = await this.getAccessToken(supabase);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      );
    }

    const sanitizedPayload = this.sanitizeFunctionPayload(payload);

    let primaryError: Error | null = null;

    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseAnonKey,
        },
        body: sanitizedPayload,
      });

      if (!error && data?.success) {
        return data.data as T;
      }

      const functionErrorMessage =
        error?.message ??
        data?.error?.message ??
        `Supabase function returned unexpected payload: ${JSON.stringify(data)}`;
      primaryError = new Error(functionErrorMessage);
    } catch (invokeError) {
      primaryError =
        invokeError instanceof Error
          ? invokeError
          : new Error(String(invokeError ?? 'Unknown error invoking edge function'));
    }

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/functions/v1/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(sanitizedPayload),
      });
    } catch (networkError) {
      const label = debugLabel ? ` (${debugLabel})` : '';
      const networkMessage =
        networkError instanceof Error ? networkError.message : String(networkError ?? 'Unknown network error');
      throw new Error(
        `Edge function${label} network error: ${networkMessage}${
          primaryError ? `; previous=${primaryError.message}` : ''
        }`,
      );
    }

    const responseBody = await response.text();
    let parsed: any = null;

    if (responseBody) {
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        const label = debugLabel ? ` (${debugLabel})` : '';
        throw new Error(
          `Edge function${label} returned invalid JSON: ${responseBody}`,
        );
      }
    }

    if (!response.ok) {
      const label = debugLabel ? ` (${debugLabel})` : '';
      let errorMessage = `Edge function${label} failed. status=${response.status}`;
      
      // Try to parse error message from response
      if (parsed?.error) {
        errorMessage += ` error=${parsed.error}`;
        if (typeof parsed.error === 'object' && parsed.error.message) {
          errorMessage = parsed.error.message;
        } else if (typeof parsed.error === 'string') {
          errorMessage = parsed.error;
        }
      } else if (responseBody) {
        errorMessage += ` body=${responseBody}`;
      }
      
      // Provide helpful messages for common status codes
      if (response.status === 403) {
        errorMessage = 'You do not have permission to perform this action. Please ensure you are logged in as a counselor or admin.';
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (response.status === 404 && errorMessage.includes('Patient not found')) {
        errorMessage = 'Patient not found. Please ensure the patient ID is correct.';
      }
      
      throw new Error(errorMessage);
    }

    if (!parsed?.success) {
      const label = debugLabel ? ` (${debugLabel})` : '';
      throw new Error(
        `Edge function${label} returned error: ${parsed?.error?.message ?? 'Unknown error'}${
          primaryError ? `; previous=${primaryError.message}` : ''
        }`,
      );
    }

    return parsed.data as T;
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

  private static async getAccessToken(
    supabase: NonNullable<ReturnType<typeof createClient>>,
  ): Promise<string> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    let accessToken: string | undefined | null = sessionData.session?.access_token;

    if ((!accessToken || sessionError) && typeof window !== 'undefined') {
      const storedToken = window.localStorage.getItem('auth-token');
      if (storedToken) {
        accessToken = storedToken;
      }
    }

    if (sessionError && !accessToken) {
      throw new Error(sessionError.message || 'Failed to retrieve auth session.');
    }

    if (!accessToken) {
      throw new Error('You must be signed in to perform this action.');
    }

    return accessToken;
  }
}

