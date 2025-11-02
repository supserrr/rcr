import React, { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { DashboardSidebar } from '../shared/DashboardSidebar';
import { TopBar } from '../shared/TopBar';
import { UserRole } from '../../../lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  user: {
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  notifications?: number;
  onNotificationClick?: () => void;
}

export function DashboardLayout({
  children,
  userRole,
  user,
  currentPath,
  onNavigate,
  onLogout,
  notifications = 0,
  onNotificationClick
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-sidebar">
      {/* Sidebar */}
      <DashboardSidebar
        userRole={userRole}
        currentPath={currentPath}
        onNavigate={onNavigate}
        className="h-full"
        open={isSidebarOpen}
        setOpen={setIsSidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onNavigate={onNavigate}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-sidebar">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
