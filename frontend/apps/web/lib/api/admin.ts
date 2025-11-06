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

    // Get user counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: patients } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');

    const { count: counselors } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'counselor');

    const { count: admins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    // Get session counts
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

    // Get resource counts
    const { count: totalResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    const { count: publicResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    // Get chat counts
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Get notification counts
    const { count: totalNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

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
        views: 0, // Would need aggregation
        downloads: 0, // Would need aggregation
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
   * Get user by ID using Supabase
   */
  static async getUser(userId: string): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: user, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !user.user) {
      throw new Error(error?.message || 'Failed to get user');
    }

    const userMetadata = user.user.user_metadata || {};

    return {
      id: user.user.id,
      email: user.user.email || '',
      fullName: userMetadata.full_name as string | undefined,
      role: (userMetadata.role as AdminUser['role']) || 'patient',
      isVerified: user.user.email_confirmed_at !== null,
      createdAt: user.user.created_at,
      lastLogin: user.user.last_sign_in_at || undefined,
    };
  }

  /**
   * List users using Supabase
   */
  static async listUsers(params?: UserQueryParams): Promise<ListUsersResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Note: This requires admin access. In production, you'd use Supabase Admin API
    // For now, we'll use a database view or RPC function
    // This is a simplified version - you may need to adjust based on your database schema

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;

    // Since we can't directly query auth.users, we'll need to use a database view
    // or RPC function that exposes user data. For now, this is a placeholder.
    // You'll need to create a database view or function that joins auth.users with user metadata.

    throw new Error('List users requires a database view or RPC function. Please implement a database view that exposes user data.');
  }

  /**
   * Update user role using Supabase
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user metadata
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError || !currentUser.user) {
      throw new Error(getUserError?.message || 'Failed to get user');
    }

    // Update user metadata with new role
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentUser.user.user_metadata,
        role: data.role,
      },
    });

    if (error || !user) {
      throw new Error(error?.message || 'Failed to update user role');
    }

    const userMetadata = user.user_metadata || {};

    return {
      id: user.id,
      email: user.email || '',
      fullName: userMetadata.full_name as string | undefined,
      role: (userMetadata.role as AdminUser['role']) || 'patient',
      isVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at,
      lastLogin: user.last_sign_in_at || undefined,
    };
  }

  /**
   * Delete user using Supabase
   */
  static async deleteUser(userId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }
}

