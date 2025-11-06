/**
 * Admin API service
 * 
 * Handles all admin-related API calls
 * Requires admin role
 */

import { api } from './client';

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
   * Get analytics data
   */
  static async getAnalytics(params?: AnalyticsQueryParams): Promise<Analytics> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/analytics?${queryString}`
      : '/admin/analytics';
    
    return api.get<Analytics>(endpoint);
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<AdminUser> {
    return api.get<AdminUser>(`/admin/users/${userId}`);
  }

  /**
   * List users
   */
  static async listUsers(params?: UserQueryParams): Promise<ListUsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/users?${queryString}`
      : '/admin/users';
    
    return api.get<ListUsersResponse>(endpoint);
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<AdminUser> {
    return api.put<AdminUser>(`/admin/users/${userId}/role`, data);
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    return api.delete<void>(`/admin/users/${userId}`);
  }
}

