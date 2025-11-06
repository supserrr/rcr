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
   * Note: This requires a database view or RPC function that exposes user data.
   * Admin API methods require service role key which should not be exposed in frontend.
   */
  static async getUser(userId: string): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Use a database view or RPC function instead of admin API
    // For now, get user from auth.users via a database view
    // You'll need to create a view like:
    // CREATE VIEW public.user_profiles AS
    // SELECT id, email, raw_user_meta_data->>'full_name' as full_name,
    //        raw_user_meta_data->>'role' as role, email_confirmed_at IS NOT NULL as is_verified,
    //        created_at, last_sign_in_at
    // FROM auth.users;
    
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error(error?.message || 'Failed to get user. Please create a user_profiles view in your database.');
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.full_name,
      role: (user.role as AdminUser['role']) || 'patient',
      isVerified: user.is_verified || false,
      createdAt: user.created_at,
      lastLogin: user.last_sign_in_at || undefined,
    };
  }

  /**
   * List users using Supabase
   * Note: This requires a database view or RPC function that exposes user data.
   * Admin API methods require service role key which should not be exposed in frontend.
   */
  static async listUsers(params?: UserQueryParams): Promise<ListUsersResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Use a database view or RPC function instead of admin API
    // You'll need to create a view like:
    // CREATE VIEW public.user_profiles AS
    // SELECT id, email, raw_user_meta_data->>'full_name' as full_name,
    //        raw_user_meta_data->>'role' as role, email_confirmed_at IS NOT NULL as is_verified,
    //        created_at, last_sign_in_at
    // FROM auth.users;
    
    let query = supabase.from('user_profiles').select('*', { count: 'exact' });

    if (params?.role) {
      query = query.eq('role', params.role);
    }
    if (params?.isVerified !== undefined) {
      query = query.eq('is_verified', params.isVerified);
    }
    if (params?.search) {
      query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`);
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list users. Please create a user_profiles view in your database.');
    }

    return {
      users: (users || []).map(u => ({
        id: u.id,
        email: u.email || '',
        fullName: u.full_name,
        role: (u.role as AdminUser['role']) || 'patient',
        isVerified: u.is_verified || false,
        createdAt: u.created_at,
        lastLogin: u.last_sign_in_at || undefined,
      })),
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Update user role using Supabase
   * Note: This requires a database function or Edge Function with service role key.
   * Admin operations should be done server-side for security.
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Use a database function or Edge Function to update user role
    // For now, we'll call an Edge Function that handles this server-side
    // You'll need to create an Edge Function like: supabase/functions/update-user-role
    
    const { data: result, error } = await supabase.functions.invoke('update-user-role', {
      body: { userId, role: data.role },
    });

    if (error || !result) {
      throw new Error(error?.message || 'Failed to update user role. Please create an Edge Function for this operation.');
    }

    return result as AdminUser;
  }

  /**
   * Delete user using Supabase
   * Note: This requires a database function or Edge Function with service role key.
   * Admin operations should be done server-side for security.
   */
  static async deleteUser(userId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Use a database function or Edge Function to delete user
    // For now, we'll call an Edge Function that handles this server-side
    // You'll need to create an Edge Function like: supabase/functions/delete-user
    
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
    });

    if (error) {
      throw new Error(error.message || 'Failed to delete user. Please create an Edge Function for this operation.');
    }
  }
}

