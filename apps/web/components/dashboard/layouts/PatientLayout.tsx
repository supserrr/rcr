import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { UserRole } from '../../../lib/types';

interface PatientLayoutProps {
  children: React.ReactNode;
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

export function PatientLayout({
  children,
  user,
  currentPath,
  onNavigate,
  onLogout,
  notifications = 0,
  onNotificationClick
}: PatientLayoutProps) {
  return (
    <DashboardLayout
      userRole="patient"
      user={user}
      currentPath={currentPath}
      onNavigate={onNavigate}
      onLogout={onLogout}
      notifications={notifications}
      onNotificationClick={onNotificationClick}
    >
      {children}
    </DashboardLayout>
  );
}
