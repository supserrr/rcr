/**
 * Notifications service layer
 * 
 * Handles all notification-related business logic using Supabase
 */

import { getSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import type {
  CreateNotificationInput,
  NotificationQueryParams,
  MarkNotificationsReadInput,
} from '../schemas/notifications.schema';

/**
 * Notification type
 */
export type NotificationType = 'session' | 'message' | 'system' | 'resource';

/**
 * Notification data returned from operations
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

/**
 * Create a notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  try {
    const supabase = getSupabaseClient();
    const { userId, title, message, type, link, metadata } = input;

    // Create notification record
    const notificationData = {
      user_id: userId,
      title,
      message,
      type,
      link: link || null,
      metadata: metadata || null,
      is_read: false,
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      logError('Create notification error', error);
      throw new AppError('Failed to create notification', 500);
    }

    const result: Notification = {
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link || undefined,
      metadata: (notification.metadata as Record<string, unknown>) || undefined,
      isRead: notification.is_read || false,
      createdAt: notification.created_at || new Date().toISOString(),
    };

    logInfo('Notification created successfully', {
      notificationId: result.id,
      userId,
      type,
    });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Create notification service error', error);
    throw new AppError('Failed to create notification', 500);
  }
}

/**
 * Get notification by ID
 */
export async function getNotificationById(
  notificationId: string,
  userId: string
): Promise<Notification> {
  try {
    const supabase = getSupabaseClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error || !notification) {
      logError('Get notification error', error);
      throw new AppError('Notification not found', 404);
    }

    // Check if user owns this notification
    if (notification.user_id !== userId) {
      throw new AppError('Access denied to this notification', 403);
    }

    const result: Notification = {
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link || undefined,
      metadata: (notification.metadata as Record<string, unknown>) || undefined,
      isRead: notification.is_read || false,
      createdAt: notification.created_at || new Date().toISOString(),
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get notification service error', error);
    throw new AppError('Failed to get notification', 500);
  }
}

/**
 * List notifications for a user
 */
export async function listNotifications(
  userId: string,
  query: NotificationQueryParams
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  try {
    const supabase = getSupabaseClient();

    let queryBuilder = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.isRead !== undefined) {
      queryBuilder = queryBuilder.eq('is_read', query.isRead);
    }

    // Order by created_at descending (newest first)
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    // Apply pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data: notifications, error, count } = await queryBuilder;

    if (error) {
      logError('List notifications error', error);
      throw new AppError('Failed to list notifications', 500);
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    const mappedNotifications: Notification[] = (notifications || []).map((notification) => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link || undefined,
      metadata: (notification.metadata as Record<string, unknown>) || undefined,
      isRead: notification.is_read || false,
      createdAt: notification.created_at || new Date().toISOString(),
    }));

    return {
      notifications: mappedNotifications,
      total: count || 0,
      unreadCount: unreadCount || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('List notifications service error', error);
    throw new AppError('Failed to list notifications', 500);
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  input: MarkNotificationsReadInput
): Promise<{ updated: number }> {
  try {
    const supabase = getSupabaseClient();
    const { notificationIds, markAll } = input;

    let updateQuery = supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);

    if (markAll) {
      // Mark all notifications as read
      updateQuery = updateQuery.eq('is_read', false);
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      updateQuery = updateQuery.in('id', notificationIds);
    } else {
      throw new AppError('Either notificationIds or markAll must be provided', 400);
    }

    const { error, count } = await updateQuery.select('id');

    if (error) {
      logError('Mark notifications as read error', error);
      throw new AppError('Failed to mark notifications as read', 500);
    }

    logInfo('Notifications marked as read', { userId, count });

    return {
      updated: count || 0,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Mark notifications as read service error', error);
    throw new AppError('Failed to mark notifications as read', 500);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    // First, get the notification to check permissions
    await getNotificationById(notificationId, userId);

    const supabase = getSupabaseClient();

    // Delete notification
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

    if (error) {
      logError('Delete notification error', error);
      throw new AppError('Failed to delete notification', 500);
    }

    logInfo('Notification deleted successfully', { notificationId, userId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Delete notification service error', error);
    throw new AppError('Failed to delete notification', 500);
  }
}

