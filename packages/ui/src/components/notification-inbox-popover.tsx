"use client";

import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverTrigger, PopoverContent } from "@workspace/ui/components/popover";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  Bell,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  Heart,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

interface Notification {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  unread: boolean;
  icon: LucideIcon;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    user: "Dr. Sarah Johnson",
    action: "sent you a message",
    target: "How are you feeling today?",
    timestamp: "10 minutes ago",
    unread: true,
    icon: MessageSquare,
  },
  {
    id: 2,
    user: "System",
    action: "reminder",
    target: "Your counseling session is tomorrow at 2:00 PM",
    timestamp: "30 minutes ago",
    unread: true,
    icon: Calendar,
  },
  {
    id: 3,
    user: "Support Team",
    action: "shared a resource",
    target: "Mindfulness Exercise Guide.pdf",
    timestamp: "2 hours ago",
    unread: false,
    icon: FileText,
  },
  {
    id: 4,
    user: "Dr. Michael Chen",
    action: "assigned you a task",
    target: "Complete daily mood journal",
    timestamp: "5 hours ago",
    unread: false,
    icon: Heart,
  },
  {
    id: 5,
    user: "Support Group",
    action: "new member joined",
    target: "Welcome to our community!",
    timestamp: "1 day ago",
    unread: false,
    icon: Users,
  },
  {
    id: 6,
    user: "System",
    action: "alert",
    target: "Scheduled maintenance tonight at 11 PM",
    timestamp: "3 days ago",
    unread: false,
    icon: AlertCircle,
  },
];

function NotificationInboxPopover() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [tab, setTab] = useState("all");

  const filtered = tab === "unread" ? notifications.filter((n) => n.unread) : notifications;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative h-12 w-12" aria-label="Open notifications">
          <Bell size={20} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-5 h-6 px-1 text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 rounded-lg border bg-background shadow-lg">
        {/* Header with Tabs + Mark All */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-sm">
                Unread {unreadCount > 0 && <Badge className="ml-1 text-xs">{unreadCount}</Badge>}
              </TabsTrigger>
            </TabsList>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left hover:bg-accent/50 transition-colors last:border-b-0"
                  >
                    <div className="mt-1 text-muted-foreground">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          n.unread ? "font-semibold text-foreground" : "text-foreground/80"
                        }`}
                      >
                        <span className="font-medium">{n.user}</span> {n.action}{" "}
                        <span className="font-medium text-primary">{n.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{n.timestamp}</p>
                    </div>
                    {n.unread && (
                      <span className="mt-2 inline-block size-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <Button variant="ghost" size="sm" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationInboxPopover };
