/**
 * Notifications API service
 * 
 * Handles all notification-related API calls using Supabase
 */

import { createClient } from '@/lib/supabase/client';

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

export interface NotificationSummary {
  total: number;
  unread: number;
  latestNotification?: Notification;
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
   * Create a new notification using Supabase
   */
  static async createNotification(data: CreateNotificationInput): Promise<Notification> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        metadata: data.metadata,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create notification');
    }

    return this.mapNotificationFromDb(notification);
  }

  /**
   * Get notification summary for the current user
   */
  static async getNotificationSummary(): Promise<NotificationSummary> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const [{ count: total }, { count: unread }, { data: latestNotifications, error }] =
      await Promise.all([
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

    if (error) {
      throw new Error(error.message || 'Failed to load notification summary');
    }

    const latest = latestNotifications && latestNotifications.length > 0
      ? this.mapNotificationFromDb(latestNotifications[0])
      : undefined;

    return {
      total: total || 0,
      unread: unread || 0,
      latestNotification: latest,
    };
  }

  /**
   * Get a notification by ID using Supabase
   */
  static async getNotification(notificationId: string): Promise<Notification> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to get notification');
    }

    return this.mapNotificationFromDb(notification);
  }

  /**
   * List notifications using Supabase
   */
  static async listNotifications(params?: NotificationQueryParams): Promise<ListNotificationsResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase.from('notifications').select('*', { count: 'exact' });

    query = query.eq('user_id', user.id);

    if (params?.type) {
      query = query.eq('type', params.type);
    }
    if (params?.isRead !== undefined) {
      query = query.eq('is_read', params.isRead);
        }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: notifications, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list notifications');
    }

    // Count unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    return {
      notifications: (notifications || []).map(n => this.mapNotificationFromDb(n)),
      total: count || 0,
      unreadCount: unreadCount || 0,
      limit,
      offset,
    };
  }

  /**
   * Mark notifications as read using Supabase
   */
  static async markNotificationsRead(
    data: MarkNotificationsReadInput
  ): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (data.markAll) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw new Error(error.message || 'Failed to mark notifications as read');
      }
    } else if (data.notificationIds && data.notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', data.notificationIds)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message || 'Failed to mark notifications as read');
      }
    }
  }

  /**
   * Delete a notification using Supabase
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  /**
   * Map database notification to API notification format
   */
  private static mapNotificationFromDb(dbNotification: Record<string, unknown>): Notification {
    return {
      id: dbNotification.id as string,
      userId: dbNotification.user_id as string,
      title: dbNotification.title as string,
      message: dbNotification.message as string,
      type: dbNotification.type as NotificationType,
      link: dbNotification.link as string | undefined,
      isRead: dbNotification.is_read as boolean,
      metadata: dbNotification.metadata as Record<string, unknown> | undefined,
      createdAt: dbNotification.created_at as string,
      updatedAt: dbNotification.updated_at as string,
    };
  }
}

