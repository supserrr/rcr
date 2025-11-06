/**
 * Notifications API service
 * 
 * Handles all notification-related API calls
 */

import { api } from './client';

/**
 * Notification type
 */
export type NotificationType = 'session' | 'message' | 'system' | 'resource';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create notification input
 */
export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification query parameters
 */
export interface NotificationQueryParams {
  type?: NotificationType;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * List notifications response
 */
export interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

/**
 * Mark notifications as read input
 */
export interface MarkNotificationsReadInput {
  notificationIds?: string[];
  markAll?: boolean;
}

/**
 * Notifications API service
 */
export class NotificationsApi {
  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationInput): Promise<Notification> {
    return api.post<Notification>('/notifications', data);
  }

  /**
   * Get a notification by ID
   */
  static async getNotification(notificationId: string): Promise<Notification> {
    return api.get<Notification>(`/notifications/${notificationId}`);
  }

  /**
   * List notifications
   */
  static async listNotifications(params?: NotificationQueryParams): Promise<ListNotificationsResponse> {
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
      ? `/notifications?${queryString}`
      : '/notifications';
    
    return api.get<ListNotificationsResponse>(endpoint);
  }

  /**
   * Mark notifications as read
   */
  static async markNotificationsRead(
    data: MarkNotificationsReadInput
  ): Promise<void> {
    return api.post<void>('/notifications/read', data);
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    return api.delete<void>(`/notifications/${notificationId}`);
  }
}

