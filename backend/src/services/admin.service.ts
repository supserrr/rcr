/**
 * Admin service layer
 * 
 * Handles all admin-related business logic using Supabase
 */

import { getSupabaseClient, getSupabaseServiceClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import type {
  UpdateUserRoleInput,
  AnalyticsQueryParams,
  UserQueryParams,
} from '../schemas/admin.schema';

/**
 * User data for admin operations
 */
export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
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
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  input: UpdateUserRoleInput,
  adminId: string
): Promise<AdminUser> {
  try {
    const supabase = getSupabaseServiceClient();
    const { role } = input;

    // Update user metadata with new role
    const { data: user, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });

    if (error || !user.user) {
      logError('Update user role error', error);
      throw new AppError('Failed to update user role', 500);
    }

    const result: AdminUser = {
      id: user.user.id,
      email: user.user.email || '',
      fullName: user.user.user_metadata?.full_name as string | undefined,
      role: (user.user.user_metadata?.role as string) || 'patient',
      isVerified: user.user.email_confirmed_at !== null,
      createdAt: user.user.created_at || new Date().toISOString(),
      lastLogin: user.user.last_sign_in_at || undefined,
    };

    logInfo('User role updated', { userId, newRole: role, adminId });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Update user role service error', error);
    throw new AppError('Failed to update user role', 500);
  }
}

/**
 * Get user by ID (admin view)
 */
export async function getUserById(userId: string): Promise<AdminUser> {
  try {
    const supabase = getSupabaseServiceClient();

    const { data: user, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !user.user) {
      logError('Get user error', error);
      throw new AppError('User not found', 404);
    }

    const result: AdminUser = {
      id: user.user.id,
      email: user.user.email || '',
      fullName: user.user.user_metadata?.full_name as string | undefined,
      role: (user.user.user_metadata?.role as string) || 'patient',
      isVerified: user.user.email_confirmed_at !== null,
      createdAt: user.user.created_at || new Date().toISOString(),
      lastLogin: user.user.last_sign_in_at || undefined,
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get user service error', error);
    throw new AppError('Failed to get user', 500);
  }
}

/**
 * List users (admin only)
 */
export async function listUsers(query: UserQueryParams): Promise<{ users: AdminUser[]; total: number }> {
  try {
    const supabase = getSupabaseServiceClient();

    // Get all users from auth
    const { data: usersList, error } = await supabase.auth.admin.listUsers();

    if (error) {
      logError('List users error', error);
      throw new AppError('Failed to list users', 500);
    }

    let filteredUsers = usersList.users || [];

    // Apply filters
    if (query.role) {
      filteredUsers = filteredUsers.filter(
        (user) => (user.user_metadata?.role as string) === query.role
      );
    }

    if (query.isVerified !== undefined) {
      const isVerified = query.isVerified;
      filteredUsers = filteredUsers.filter(
        (user) => (user.email_confirmed_at !== null) === isVerified
      );
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm) ||
          (user.user_metadata?.full_name as string)?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    const mappedUsers: AdminUser[] = paginatedUsers.map((user) => ({
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name as string | undefined,
      role: (user.user_metadata?.role as string) || 'patient',
      isVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at || new Date().toISOString(),
      lastLogin: user.last_sign_in_at || undefined,
    }));

    return {
      users: mappedUsers,
      total: filteredUsers.length,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('List users service error', error);
    throw new AppError('Failed to list users', 500);
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string, adminId: string): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      logError('Delete user error', error);
      throw new AppError('Failed to delete user', 500);
    }

    logInfo('User deleted', { userId, adminId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Delete user service error', error);
    throw new AppError('Failed to delete user', 500);
  }
}

/**
 * Get analytics
 */
export async function getAnalytics(query: AnalyticsQueryParams): Promise<Analytics> {
  try {
    const supabase = getSupabaseClient();

    // Get date range
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    // Get users analytics
    const { count: totalUsers } = await supabase
      .from('_prisma_migrations')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    // Since we can't easily query auth users via PostgREST, we'll use service client for user counts
    // For now, we'll approximate based on data we have access to
    const { count: totalPatients } = await supabase
      .from('sessions')
      .select('patient_id', { count: 'exact', head: true });

    const { count: totalCounselors } = await supabase
      .from('sessions')
      .select('counselor_id', { count: 'exact', head: true });

    // Get sessions analytics
    const { count: totalSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    const { count: scheduledSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled');

    const { count: completedSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: cancelledSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    const { count: sessionsThisMonth } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonthISO);

    // Get resources analytics
    const { count: totalResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    const { count: publicResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    const { count: privateResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', false);

    // Get aggregated views and downloads
    const { data: resourceStats } = await supabase
      .from('resources')
      .select('views, downloads');

    let totalViews = 0;
    let totalDownloads = 0;

    if (resourceStats) {
      totalViews = resourceStats.reduce((sum, r) => sum + (r.views || 0), 0);
      totalDownloads = resourceStats.reduce((sum, r) => sum + (r.downloads || 0), 0);
    }

    // Get chats analytics
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });

    const { count: activeChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', startOfMonthISO);

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Get notifications analytics
    const { count: totalNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Get notifications by type
    const { data: notificationsByType } = await supabase
      .from('notifications')
      .select('type');

    const notificationsByTypeMap: Record<string, number> = {};
    if (notificationsByType) {
      notificationsByType.forEach((n) => {
        notificationsByTypeMap[n.type] = (notificationsByTypeMap[n.type] || 0) + 1;
      });
    }

    // For user counts, we'll need to use a different approach
    // Using service client to get actual user counts
    const supabaseService = getSupabaseServiceClient();
    const { data: allUsers } = await supabaseService.auth.admin.listUsers();

    const usersList = allUsers?.users || [];
    const patients = usersList.filter((u) => u.user_metadata?.role === 'patient').length;
    const counselors = usersList.filter((u) => u.user_metadata?.role === 'counselor').length;
    const admins = usersList.filter((u) => u.user_metadata?.role === 'admin').length;

    const newThisMonth = usersList.filter((u) => {
      const createdAt = new Date(u.created_at);
      return createdAt >= startOfMonth;
    }).length;

    const activeThisMonth = usersList.filter((u) => {
      const lastLogin = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
      return lastLogin && lastLogin >= startOfMonth;
    }).length;

    const result: Analytics = {
      users: {
        total: usersList.length,
        patients,
        counselors,
        admins,
        newThisMonth,
        activeThisMonth,
      },
      sessions: {
        total: totalSessions || 0,
        scheduled: scheduledSessions || 0,
        completed: completedSessions || 0,
        cancelled: cancelledSessions || 0,
        thisMonth: sessionsThisMonth || 0,
      },
      resources: {
        total: totalResources || 0,
        public: publicResources || 0,
        private: privateResources || 0,
        views: totalViews,
        downloads: totalDownloads,
      },
      chats: {
        total: totalChats || 0,
        active: activeChats || 0,
        messages: totalMessages || 0,
        unread: unreadMessages || 0,
      },
      notifications: {
        total: totalNotifications || 0,
        unread: unreadNotifications || 0,
        byType: notificationsByTypeMap,
      },
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get analytics service error', error);
    throw new AppError('Failed to get analytics', 500);
  }
}

