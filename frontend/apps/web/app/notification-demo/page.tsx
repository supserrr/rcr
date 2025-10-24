"use client";

import { NotificationInboxPopover } from "@workspace/ui/components/notification-inbox-popover";

export default function NotificationDemoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Demo</h1>
          <p className="text-muted-foreground">
            Click the bell icon to see the improved notification popover
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <NotificationInboxPopover />
        </div>
        
        <div className="text-sm text-muted-foreground max-w-md">
          <p>Features:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Tabbed interface (All / Unread)</li>
            <li>Mark individual notifications as read</li>
            <li>Mark all as read functionality</li>
            <li>Responsive design</li>
            <li>Smooth animations</li>
            <li>Cancer care themed notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
