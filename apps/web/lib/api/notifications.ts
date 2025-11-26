import { cache } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getServiceClient } from '@/lib/supabase/service';

export type NotificationDeliveryStatus =
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'failed'
  | 'cancelled';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  typeKey?: string | null;
  channels: string[];
  isRead: boolean;
  deliveryStatus: NotificationDeliveryStatus;
  priority: NotificationPriority;
  scheduledFor?: string | null;
  deliveredAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  typeKey?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

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

export interface MarkNotificationsReadInput {
  notificationIds?: string[];
  markAll?: boolean;
}

export interface NotificationTypeConfig {
  key: string;
  name: string;
  description?: string | null;
  category: string;
  default_priority: NotificationPriority;
  default_channels: string[];
  default_delay_seconds: number;
  is_active: boolean;
}

export interface EnqueueNotificationOptions {
  userId: string;
  typeKey: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: Date | string | null;
  priority?: NotificationPriority;
  channels?: string[];
  deliveryStatus?: NotificationDeliveryStatus;
}

export interface MessageNotificationPayload {
  messageId: string;
}

export interface PatientAssignmentPayload {
  patientId: string;
  counselorId: string;
  assignedBy?: string | null;
    }

export interface SessionReminderPayload {
  sessionId: string;
  }

export class NotificationsApi {
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

  static async listNotifications(params?: NotificationQueryParams): Promise<ListNotificationsResponse> {
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

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (params?.typeKey) {
      query = query.eq('type_key', params.typeKey);
    }
    if (params?.isRead !== undefined) {
      query = query.eq('is_read', params.isRead);
        }

    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message || 'Failed to list notifications');
    }

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    return {
      notifications: (data ?? []).map(NotificationsApi.mapNotificationFromDb),
      total: count ?? 0,
      unreadCount: unreadCount ?? 0,
      limit,
      offset,
    };
  }

  static async markNotificationsRead(data: MarkNotificationsReadInput): Promise<void> {
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

    if (data.markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw new Error(error.message || 'Failed to mark notifications as read');
      }
      return;
    }

    if (data.notificationIds && data.notificationIds.length > 0) {
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

  private static mapNotificationFromDb(dbNotification: Record<string, unknown>): Notification {
    return {
      id: dbNotification.id as string,
      userId: dbNotification.user_id as string,
      title: dbNotification.title as string,
      message: dbNotification.message as string,
      typeKey: (dbNotification.type_key as string | null) ?? null,
      channels: (dbNotification.channels as string[]) ?? ['in_app'],
      isRead: Boolean(dbNotification.is_read),
      deliveryStatus: (dbNotification.delivery_status as NotificationDeliveryStatus) ?? 'pending',
      priority: (dbNotification.priority as NotificationPriority) ?? 'normal',
      scheduledFor: (dbNotification.scheduled_for as string | null) ?? null,
      deliveredAt: (dbNotification.delivered_at as string | null) ?? null,
      expiresAt: (dbNotification.expires_at as string | null) ?? null,
      metadata: (dbNotification.metadata as Record<string, unknown>) ?? {},
      createdAt: dbNotification.created_at as string,
      updatedAt: dbNotification.updated_at as string,
    };
  }
}

const preferenceKeyByType: Record<string, string> = {
  message_received: 'patientMessages',
  patient_assignment: 'systemAlerts',
  session_reminder: 'sessionReminders',
  system_alert: 'systemAlerts',
};

const getTypeCache = cache(() => new Map<string, NotificationTypeConfig>());

export class NotificationService {
  private static missingServiceWarningLogged = false;
  private static fallbackClient: SupabaseClient | null = null;

  private static async getServiceClient(): Promise<SupabaseClient | null> {
    const client = getServiceClient();
    if (client) {
      return client;
    }
    if (!NotificationService.missingServiceWarningLogged) {
      console.warn(
        '[NotificationService] Supabase service client is not configured. Falling back to standard client session.',
      );
      NotificationService.missingServiceWarningLogged = true;
    }
    if (!NotificationService.fallbackClient) {
      try {
        NotificationService.fallbackClient = createClient();
      } catch (error) {
        console.warn('[NotificationService] Failed to create fallback client:', error);
        return null;
      }
    }
    return NotificationService.fallbackClient;
  }

  private static async getTypeConfig(typeKey: string): Promise<NotificationTypeConfig | null> {
    const cacheMap = getTypeCache();
    if (cacheMap.has(typeKey)) {
      return cacheMap.get(typeKey) ?? null;
    }

    const service = await NotificationService.getServiceClient();
    if (!service) {
      return null;
    }
    const { data, error } = await service
      .from('notification_types')
      .select('*')
      .eq('key', typeKey)
      .is('is_active', true)
      .maybeSingle<NotificationTypeConfig>();

    if (error) {
      console.error('[NotificationService] Failed to load notification type config:', error);
      return null;
    }

    if (data) {
      cacheMap.set(typeKey, data);
    }

    return data ?? null;
  }

  private static async getUserPreferences(userId: string): Promise<Record<string, unknown>> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return {
        notificationPreferences: {},
        supportPreferences: {},
        fullName: '',
      };
    }
    const { data, error } = await service
      .from('profiles')
      .select('notification_preferences, support_preferences, full_name')
      .eq('id', userId)
      .maybeSingle<{
        notification_preferences?: Record<string, unknown> | null;
        support_preferences?: Record<string, unknown> | null;
        full_name?: string | null;
      }>();

    if (error) {
      console.error('[NotificationService] Failed to load user preferences:', error);
      return {};
    }

    return {
      notificationPreferences: data?.notification_preferences ?? {},
      supportPreferences: data?.support_preferences ?? {},
      fullName: data?.full_name ?? '',
    };
  }

  private static shouldDeliver(
    typeKey: string,
    preferences: Record<string, unknown>,
  ): boolean {
    const preferenceKey = preferenceKeyByType[typeKey];
    if (!preferenceKey) {
      return true;
    }

    const notificationPreferences = preferences.notificationPreferences as Record<string, unknown>;
    if (!notificationPreferences) {
      return true;
    }

    const rawValue = notificationPreferences[preferenceKey];
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    return true;
  }

  private static determineScheduledFor(
    options: EnqueueNotificationOptions,
    typeConfig: NotificationTypeConfig | null,
  ): string | null {
    if (options.scheduledFor) {
      return new Date(options.scheduledFor).toISOString();
    }

    if (!typeConfig) {
      return null;
    }

    if (typeConfig.default_delay_seconds <= 0) {
      return null;
    }

    const scheduled = new Date(Date.now() + typeConfig.default_delay_seconds * 1000);
    return scheduled.toISOString();
  }

  private static async insertNotification(payload: Partial<EnqueueNotificationOptions> & { userId: string; title: string; message: string; typeKey: string; deliveryStatus: NotificationDeliveryStatus; deliveredAt?: string; }): Promise<void> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return;
    }
    const insertData: Record<string, unknown> = {
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      type_key: payload.typeKey,
      metadata: payload.metadata ?? {},
      scheduled_for: payload.scheduledFor ?? null,
      delivery_status: payload.deliveryStatus,
      priority: payload.priority ?? 'normal',
      channels: payload.channels ?? ['in_app'],
    };

    // Set delivered_at if provided (for immediate in-app notifications)
    if (payload.deliveredAt) {
      insertData.delivered_at = payload.deliveredAt;
    }

    const { error } = await service.from('notifications').insert(insertData);

    if (error) {
      const message = typeof error?.message === 'string' && error.message.length > 0
        ? error.message
        : 'Unknown Supabase error';
      console.warn(
        `[NotificationService] Failed to enqueue notification (non-blocking): ${message}`,
        error,
      );
      return;
    }
  }

  static async enqueue(options: EnqueueNotificationOptions): Promise<{ status: NotificationDeliveryStatus }> {
    const typeConfig = await NotificationService.getTypeConfig(options.typeKey);
    const preferences = await NotificationService.getUserPreferences(options.userId);

    const shouldDeliver = NotificationService.shouldDeliver(options.typeKey, preferences);

    const scheduledFor = NotificationService.determineScheduledFor(options, typeConfig);
    let deliveryStatus: NotificationDeliveryStatus = 'pending';

    if (!shouldDeliver) {
      deliveryStatus = 'cancelled';
    } else if (scheduledFor && new Date(scheduledFor).getTime() > Date.now()) {
      deliveryStatus = 'scheduled';
    } else {
      // For in-app notifications without scheduling, mark as sent immediately
      // This ensures they appear in the notification inbox right away
      const channels = options.channels ?? typeConfig?.default_channels ?? ['in_app'];
      if (channels.includes('in_app') && !scheduledFor) {
        deliveryStatus = 'sent';
      }
    }

    const finalChannels = options.channels ?? typeConfig?.default_channels ?? ['in_app'];
    const nowIso = new Date().toISOString();

    await NotificationService.insertNotification({
      ...options,
      priority: options.priority ?? typeConfig?.default_priority ?? 'normal',
      channels: finalChannels,
      scheduledFor,
      deliveryStatus,
      deliveredAt: deliveryStatus === 'sent' ? nowIso : undefined,
    });

    return { status: deliveryStatus };
  }

  static async enqueueMessageNotifications(payload: MessageNotificationPayload): Promise<void> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return;
    }
    const { data: message, error } = await service
      .from('messages')
      .select('id, chat_id, sender_id, content, sender_name, sender_avatar, created_at')
      .eq('id', payload.messageId)
      .maybeSingle<{
        id: string;
        chat_id: string;
        sender_id: string;
        content: string;
        sender_name?: string | null;
        sender_avatar?: string | null;
        created_at: string;
      }>();

    if (error || !message) {
      console.error('[NotificationService] Message lookup failed:', error);
      return;
    }

    const { data: chatRecord, error: chatError } = await service
      .from('chats')
      .select('participants, participant_names')
      .eq('id', message.chat_id)
      .maybeSingle<{
        participants: string[];
        participant_names?: Record<string, string>;
      }>();

    if (chatError || !chatRecord) {
      console.error('[NotificationService] Chat lookup failed for message notification:', chatError);
      return;
    }

    const participants = chatRecord.participants ?? [];
    const senderName =
      message.sender_name ||
      chatRecord.participant_names?.[message.sender_id] ||
      'New message';

    const recipients = participants.filter((participantId) => participantId !== message.sender_id);

    await Promise.all(
      recipients.map((recipientId) =>
        NotificationService.enqueue({
          userId: recipientId,
          typeKey: 'message_received',
          title: `${senderName} sent you a message`,
          message: message.content.length > 140 ? `${message.content.slice(0, 137)}...` : message.content,
          metadata: {
            messageId: message.id,
            chatId: message.chat_id,
            senderId: message.sender_id,
            senderName,
            createdAt: message.created_at,
          },
          priority: 'high',
        }).catch((enqueueError) => {
          console.error('[NotificationService] Failed to enqueue message notification:', enqueueError);
        }),
      ),
    );
  }

  static async enqueuePatientAssignmentNotifications(payload: PatientAssignmentPayload): Promise<void> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return;
    }

    const { data: patientProfile } = await service
      .from('profiles')
      .select('id, full_name')
      .eq('id', payload.patientId)
      .maybeSingle<{ id: string; full_name?: string | null }>();

    const { data: counselorProfile } = await service
      .from('profiles')
      .select('id, full_name')
      .eq('id', payload.counselorId)
      .maybeSingle<{ id: string; full_name?: string | null }>();

    const patientName = patientProfile?.full_name ?? 'Patient';
    const counselorName = counselorProfile?.full_name ?? 'Counselor';

    await Promise.all([
      NotificationService.enqueue({
        userId: payload.counselorId,
        typeKey: 'patient_assignment',
        title: 'New patient assignment',
        message: `You have been assigned a new patient: ${patientName}.`,
        metadata: {
          patientId: payload.patientId,
          patientName,
          assignedBy: payload.assignedBy ?? null,
        },
        priority: 'high',
      }).catch((error) => console.error('[NotificationService] Failed to notify counselor assignment:', error)),
      NotificationService.enqueue({
        userId: payload.patientId,
        typeKey: 'patient_assignment',
        title: 'Your counselor has been assigned',
        message: `You have been paired with counselor ${counselorName}.`,
        metadata: {
          counselorId: payload.counselorId,
          counselorName,
          assignedBy: payload.assignedBy ?? null,
        },
        priority: 'normal',
      }).catch((error) => console.error('[NotificationService] Failed to notify patient assignment:', error)),
    ]);
  }

  static async ensureSessionReminderForSession(sessionId: string): Promise<void> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return;
    }
    const { data: session, error } = await service
      .from('sessions')
      .select('id, patient_id, counselor_id, date, time, status, type, duration')
      .eq('id', sessionId)
      .maybeSingle<{
        id: string;
        patient_id: string;
        counselor_id: string;
        date: string;
        time: string;
        status: string;
        type: string;
        duration: number;
      }>();

    if (error || !session) {
      console.error('[NotificationService] Failed to load session for reminder:', error);
      return;
    }

    if (session.status !== 'scheduled') {
      await service
        .from('notifications')
        .update({
          delivery_status: 'cancelled',
          scheduled_for: null,
          delivered_at: null,
        })
        .eq('type_key', 'session_reminder')
        .eq('metadata->>sessionId', session.id);
      return;
    }

    const sessionStart = new Date(`${session.date}T${session.time}`);
    if (Number.isNaN(sessionStart.getTime())) {
      console.error('[NotificationService] Invalid session datetime:', session);
      return;
    }

    const typeConfig = await NotificationService.getTypeConfig('session_reminder');
    const defaultLeadSeconds = typeConfig?.default_delay_seconds ?? 3600;

    const { data: profiles } = await service
      .from('profiles')
      .select('id, support_preferences')
      .in('id', [session.patient_id, session.counselor_id]);

    const buildReminderLead = (profileId: string) => {
      const profile = profiles?.find((p) => p.id === profileId);
      const supportPreferences = profile?.support_preferences as Record<string, unknown> | undefined;
      const reminderLeadTime = supportPreferences?.reminderLeadTime;
      const parsedLead = typeof reminderLeadTime === 'string' ? Number(reminderLeadTime) : Number(reminderLeadTime);
      if (!Number.isFinite(parsedLead) || parsedLead <= 0) {
        return defaultLeadSeconds;
      }
      return parsedLead * 60;
    };

    const participants = [session.patient_id, session.counselor_id];

    await Promise.all(
      participants.map(async (userId) => {
        const leadSeconds = buildReminderLead(userId);
        const scheduledFor = new Date(sessionStart.getTime() - leadSeconds * 1000);
        const scheduleIso =
          scheduledFor.getTime() > Date.now()
            ? scheduledFor.toISOString()
            : new Date().toISOString();

        const { data: existing } = await service
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type_key', 'session_reminder')
          .eq('metadata->>sessionId', session.id)
          .maybeSingle();

        if (existing) {
          await service
            .from('notifications')
            .update({
              scheduled_for: scheduleIso,
              delivery_status: scheduleIso && new Date(scheduleIso).getTime() > Date.now() ? 'scheduled' : 'pending',
              metadata: {
                sessionId: session.id,
                startsAt: sessionStart.toISOString(),
              },
            })
            .eq('id', existing.id);
          return;
        }

        await NotificationService.enqueue({
          userId,
          typeKey: 'session_reminder',
          title: 'Upcoming counseling session',
          message: 'You have an upcoming counseling session. Make sure you are prepared.',
          metadata: {
            sessionId: session.id,
            startsAt: sessionStart.toISOString(),
          },
          scheduledFor: scheduleIso,
          priority: 'normal',
        });
      }),
    );
  }

  static async seedUpcomingSessionReminders(windowMinutes = 1440): Promise<void> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return;
    }
    const from = new Date();
    const to = new Date(Date.now() + windowMinutes * 60 * 1000);

    const { data: sessions, error } = await service
      .from('sessions')
      .select('id')
      .eq('status', 'scheduled')
      .gte('date', from.toISOString().slice(0, 10))
      .lte('date', to.toISOString().slice(0, 10));

    if (error) {
      console.error('[NotificationService] Failed to query sessions for reminders:', error);
      return;
    }

    await Promise.all(
      (sessions ?? []).map((session) =>
        NotificationService.ensureSessionReminderForSession(session.id).catch((err) =>
          console.error('[NotificationService] Failed to seed session reminder:', err),
        ),
      ),
    );
  }

  static async dispatchDueNotifications(limit = 100): Promise<number> {
    const service = await NotificationService.getServiceClient();
    if (!service) {
      return 0;
    }
    const nowIso = new Date().toISOString();

    const { data: pending, error } = await service
      .from('notifications')
      .select('id')
      .in('delivery_status', ['pending', 'scheduled'])
      .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`)
      .limit(limit);

    if (error) {
      console.error('[NotificationService] Failed to query pending notifications:', error);
      return 0;
    }

    if (!pending || pending.length === 0) {
      return 0;
    }

    const { error: updateError } = await service
      .from('notifications')
      .update({
        delivery_status: 'sent',
        delivered_at: nowIso,
      })
      .in('id', pending.map((row) => row.id));

    if (updateError) {
      console.error('[NotificationService] Failed to mark notifications as sent:', updateError);
      return 0;
    }

    return pending.length;
  }
}