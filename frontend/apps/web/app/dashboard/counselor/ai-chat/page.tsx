'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AIChatInterface } from '@workspace/ui/components/ai-chat-interface';
import { Sidebar } from '../../../../components/dashboard/shared/Sidebar';
import { useAuth } from '../../../../hooks/use-auth';

export default function CounselorAIChatPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleClose = () => {
    router.push('/dashboard/counselor');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  if (!user) return null;

  const userData = {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '/avatars/default.jpg'
  };

  return (
    <AIChatInterface 
      userName={user?.name || "Counselor"}
      onClose={handleClose}
      userRole={user.role}
      user={userData}
      currentPath="/dashboard/counselor/ai-chat"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      notifications={3}
      onNotificationClick={handleNotificationClick}
      sidebarComponent={({ isCollapsed, onToggleCollapse }) => (
        <Sidebar
          userRole={user.role}
          currentPath="/dashboard/counselor/ai-chat"
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          className="h-full"
        />
      )}
    />
  );
}