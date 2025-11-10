/**
 * Admin API service
 * 
 * Handles all admin-related API calls using Supabase
 * Requires admin role
 */

import { createClient } from '@/lib/supabase/client';
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

    const [overviewRow, verifiedResult, unverifiedResult] = await Promise.all([
      supabase.from('admin_metrics_overview').select('total_users,total_patients,total_counselors,total_admins,new_users_this_month,active_users_last_30_days').maybeSingle(),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('is_verified', true),
    ]);

    if (overviewRow.error) {
      throw new Error(overviewRow.error.message || 'Failed to load user overview metrics');
    }

    const overview = overviewRow.data ?? {};

    return {
      totals: {
        total: Number(overview.total_users ?? 0),
        patients: Number(overview.total_patients ?? 0),
        counselors: Number(overview.total_counselors ?? 0),
        admins: Number(overview.total_admins ?? 0),
        newThisMonth: Number(overview.new_users_this_month ?? 0),
        activeLast30Days: Number(overview.active_users_last_30_days ?? 0),
      },
      verification: {
        verified: verifiedResult.count ?? 0,
        unverified: unverifiedResult.count ?? 0,
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
        .map((item) => toNumber(item))
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

    const counselorProfile =
      mapCounselorProfile(raw?.counselor_profile ?? raw?.counselor_profiles ?? metadata.counselorProfile);

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
      visibilitySettings,
      approvalStatus,
      approvalSubmittedAt,
      approvalReviewedAt,
      approvalNotes,
      counselorProfile,
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
        'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,approval_notes,counselor_profiles(*)',
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
          visibility_settings: profile.visibility_settings,
          approval_status: profile.approval_status,
          approval_submitted_at: profile.approval_submitted_at,
          approval_reviewed_at: profile.approval_reviewed_at,
          approval_notes: profile.approval_notes,
          counselor_profiles: Array.isArray(profile.counselor_profiles)
            ? profile.counselor_profiles[0]
            : profile.counselor_profiles,
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

  static async updateCounselorApproval(
    counselorId: string,
    input: {
      approvalStatus: CounselorApprovalStatus;
      approvalNotes?: string;
      visibilitySettings?: VisibilitySettings;
    },
  ): Promise<void> {
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

    const payload: Record<string, unknown> = {
      approval_status: input.approvalStatus,
      approval_reviewed_at: new Date().toISOString(),
      approval_reviewed_by: user.id,
      approval_notes: input.approvalNotes ?? null,
    };

    if (input.visibilitySettings) {
      payload.visibility_settings = input.visibilitySettings;
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', counselorId);

    if (error) {
      throw new Error(error.message || 'Failed to update counselor approval status');
    }

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

