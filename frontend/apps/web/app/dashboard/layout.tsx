'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PatientLayout } from '../../components/dashboard/layouts/PatientLayout';
import { CounselorLayout } from '../../components/dashboard/layouts/CounselorLayout';
import { AdminLayout } from '../../components/dashboard/layouts/AdminLayout';
import { UserRole } from '../../lib/types';
import { useAuth } from '../../components/auth/AuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    role: UserRole;
  }>;
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/signin');
    return null;
  }

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const notifications = 3;

  // Use the actual user data from auth context
  const userData = {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '/avatars/default.jpg'
  };

  switch (user.role) {
    case 'patient':
      return (
        <PatientLayout
          user={userData}
          currentPath={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        >
          {children}
        </PatientLayout>
      );
    
    case 'counselor':
      return (
        <CounselorLayout
          user={userData}
          currentPath={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        >
          {children}
        </CounselorLayout>
      );
    
    case 'admin':
      return (
        <AdminLayout
          user={userData}
          currentPath={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        >
          {children}
        </AdminLayout>
      );
    
    default:
      return <div>Invalid role</div>;
  }
}
