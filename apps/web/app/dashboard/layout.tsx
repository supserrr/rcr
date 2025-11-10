'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PatientLayout } from '../../components/dashboard/layouts/PatientLayout';
import { CounselorLayout } from '../../components/dashboard/layouts/CounselorLayout';
import { AdminLayout } from '../../components/dashboard/layouts/AdminLayout';
import { useAuth } from '../../components/auth/AuthProvider';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/signin') {
      router.replace('/signin');
    }
  }, [isLoading, user, router, pathname]);

  useEffect(() => {
    if (isLoading || !user || user.role !== 'counselor') {
      return;
    }

    const pendingAllowedRoutes = ['/dashboard/counselor/pending', '/dashboard/counselor/settings'];
    const isPendingAllowedRoute = pendingAllowedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    const isPendingRoute = pathname === '/dashboard/counselor/pending';

    if (user.approvalStatus !== 'approved' && !isPendingAllowedRoute) {
      router.replace('/dashboard/counselor/pending');
    }

    if (user.approvalStatus === 'approved' && isPendingRoute) {
      router.replace('/dashboard/counselor');
    }
  }, [isLoading, user, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
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
    avatar: user.avatar || undefined,
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
