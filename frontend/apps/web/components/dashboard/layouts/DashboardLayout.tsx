import React, { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Sidebar } from '../shared/Sidebar';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-0",
        "hidden md:block"
      )}>
        <Sidebar
          userRole={userRole}
          currentPath={currentPath}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          className="h-full"
        />
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <div className="fixed left-0 top-0 h-full w-64">
            <Sidebar
              userRole={userRole}
              currentPath={currentPath}
              onNavigate={(path) => {
                onNavigate(path);
                toggleSidebar();
              }}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
