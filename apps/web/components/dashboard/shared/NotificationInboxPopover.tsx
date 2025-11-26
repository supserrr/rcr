"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertCircle,
  Bell,
  Calendar,
  FileText,
  LucideIcon,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';

import {
  NotificationsApi,
  type Notification,
} from '@/lib/api/notifications';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '../../auth/AuthProvider';
import {
  useNotifications as useRealtimeNotifications,
} from '../../../hooks/useRealtime';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { useRouter } from 'next/navigation';

type NotificationTab = 'all' | 'unread';

const iconMap: Record<string, LucideIcon> = {
  session_reminder: Calendar,
  message_received: MessageSquare,
  system_alert: AlertCircle,
  patient_assignment: UserCheck,
  resource_highlight: FileText,
};

const getIconForNotification = (typeKey?: string | null): LucideIcon => {
  if (!typeKey) {
    return Bell;
  }
  return iconMap[typeKey] ?? Bell;
};

const formatTimestamp = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return '';
  }
};

const mapRealtimeNotification = (notification: {
  id: string;
  user_id: string;
  type_key?: string | null;
  title: string;
  message: string;
  metadata?: unknown;
  channels?: unknown;
  delivery_status?: string;
  priority?: string;
  scheduled_for?: string | null;
  delivered_at?: string | null;
  expires_at?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}): Notification => ({
  id: notification.id,
  userId: notification.user_id,
  title: notification.title ?? 'Notification',
  message: notification.message ?? '',
  typeKey: notification.type_key ?? null,
  channels: Array.isArray(notification.channels)
    ? (notification.channels as string[])
    : ['in_app'],
  deliveryStatus: (notification.delivery_status as Notification['deliveryStatus']) ?? 'pending',
  priority: (notification.priority as Notification['priority']) ?? 'normal',
  scheduledFor: notification.scheduled_for ?? null,
  deliveredAt: notification.delivered_at ?? null,
  expiresAt: notification.expires_at ?? null,
  metadata:
    typeof notification.metadata === 'object' && notification.metadata !== null
      ? (notification.metadata as Record<string, unknown>)
      : {},
  isRead: notification.is_read ?? false,
  createdAt: notification.created_at,
  updatedAt: notification.updated_at ?? notification.created_at,
});

export function NotificationInboxPopover() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<NotificationTab>('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return tab === 'unread'
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;
  }, [notifications, tab]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await NotificationsApi.listNotifications({
        limit: 50,
      });

      setNotifications(response.notifications);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to load notifications';
      setError(message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useRealtimeNotifications(
    user?.id ?? null,
    (notification) => {
      setNotifications((prev) => {
        const mapped = mapRealtimeNotification(notification);
        const existingIndex = prev.findIndex(
          (item) => item.id === mapped.id
        );

        if (existingIndex !== -1) {
          const next = [...prev];
          next[existingIndex] = mapped;
          return next;
        }

        return [mapped, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      });
    },
    (err) => {
      console.error('Realtime notifications error:', err);
    }
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        setMarkingId(notificationId);
        const notification = notifications.find((n) => n.id === notificationId);
        
        await NotificationsApi.markNotificationsRead({
          notificationIds: [notificationId],
        });

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );

        // Navigate to relevant page based on notification type
        if (notification) {
          if (notification.typeKey === 'message_received') {
            const metadata = notification.metadata as Record<string, unknown> | undefined;
            const chatId = metadata?.chatId as string | undefined;
            if (chatId) {
              // Determine route based on user role (could be improved with role detection)
              const isCounselor = (user as any)?.user_metadata?.role === 'counselor';
              const route = isCounselor 
                ? `/dashboard/counselor/chat?chatId=${chatId}`
                : `/dashboard/patient/chat?chatId=${chatId}`;
              router.push(route);
            }
          } else if (notification.typeKey === 'patient_assignment') {
            const metadata = notification.metadata as Record<string, unknown> | undefined;
            const patientId = metadata?.patientId as string | undefined;
            const counselorId = metadata?.counselorId as string | undefined;
            if ((user as any)?.user_metadata?.role === 'counselor' && patientId) {
              router.push(`/dashboard/counselor/patients`);
            } else if ((user as any)?.user_metadata?.role === 'patient' && counselorId) {
              router.push(`/dashboard/patient/sessions`);
            }
          } else if (notification.typeKey === 'session_reminder') {
            const metadata = notification.metadata as Record<string, unknown> | undefined;
            const sessionId = metadata?.sessionId as string | undefined;
            if (sessionId) {
              const isCounselor = (user as any)?.user_metadata?.role === 'counselor';
              const route = isCounselor
                ? `/dashboard/counselor/sessions/session/${sessionId}`
                : `/dashboard/patient/sessions/session/${sessionId}`;
              router.push(route);
            }
          }
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
        toast.error('Failed to mark notification as read');
      } finally {
        setMarkingId(null);
      }
    },
    [notifications, router, user]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      setIsMarkingAll(true);
      await NotificationsApi.markNotificationsRead({ markAll: true });
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsMarkingAll(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-12 w-12"
          aria-label="Open notifications"
          onClick={handleRefresh}
        >
          <Bell size={20} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-5 h-6 px-1 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 rounded-lg border bg-background shadow-lg">
        <Tabs value={tab} onValueChange={(value) => setTab(value as NotificationTab)}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-sm">
                Unread{' '}
                {unreadCount > 0 && (
                  <Badge className="ml-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                disabled={isMarkingAll}
              >
                {isMarkingAll ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-sm text-muted-foreground">
                <Spinner variant="bars" size={24} className="text-primary" />
                <p>Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-destructive">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={handleRefresh}
                >
                  Try again
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getIconForNotification(notification.typeKey);
                const isMarkingThis =
                  markingId === notification.id;

                return (
                  <button
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left hover:bg-accent/50 transition-colors last:border-b-0"
                    disabled={notification.isRead}
                  >
                    <div className="mt-1 text-muted-foreground">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          notification.isRead
                            ? 'text-foreground/80'
                            : 'font-semibold text-foreground'
                        }`}
                      >
                        <span className="font-medium">
                          {notification.title}
                        </span>
                        {notification.message ? (
                          <>
                            {' '}
                            <span className="text-muted-foreground">
                              {notification.message}
                            </span>
                          </>
                        ) : null}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(notification.createdAt)}</span>
                        {notification.deliveryStatus !== 'pending' && notification.deliveryStatus !== 'cancelled' && (
                          <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
                            {notification.deliveryStatus}
                          </Badge>
                        )}
                        {notification.priority !== 'normal' && (
                          <Badge variant="secondary" className="uppercase tracking-wide text-[10px] bg-primary/10 text-primary border-primary/20">
                            {notification.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <span className="mt-2 inline-block size-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    {isMarkingThis && (
                      <Spinner variant="bars" size={16} className="text-primary mt-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Tabs>

        <div className="px-4 py-3 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


