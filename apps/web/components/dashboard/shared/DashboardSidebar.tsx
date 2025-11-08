"use client";

import React from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@workspace/ui/components/ui/sidebar";
import { RCRLogo } from "@workspace/ui/components/rcr-logo";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Bot,
  Settings,
  UserCheck,
  UserPlus,
  GraduationCap,
  HelpCircle,
  Server,
  ClipboardList,
} from "lucide-react";
import { UserRole, NavigationItem } from '../../../lib/types';
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardSidebarProps {
  userRole: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const navigationItems: NavigationItem[] = [
  // Patient navigation
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard/patient',
    roles: ['patient']
  },
  {
    id: 'counselors',
    label: 'Counselors',
    icon: 'Users',
    path: '/dashboard/patient/counselors',
    roles: ['patient']
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: 'BookOpen',
    path: '/dashboard/patient/resources',
    roles: ['patient']
  },
  {
    id: 'sessions',
    label: 'Sessions',
    icon: 'Calendar',
    path: '/dashboard/patient/sessions',
    roles: ['patient']
  },
  {
    id: 'chat',
    label: 'Messages',
    icon: 'MessageCircle',
    path: '/dashboard/patient/chat',
    roles: ['patient'],
    badge: 2
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: 'Bot',
    path: '/dashboard/patient/ai-chat',
    roles: ['patient']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/dashboard/patient/settings',
    roles: ['patient']
  },

  // Counselor navigation
  {
    id: 'counselor-dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard/counselor',
    roles: ['counselor']
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: 'Users',
    path: '/dashboard/counselor/patients',
    roles: ['counselor']
  },
  {
    id: 'counselor-resources',
    label: 'Resources',
    icon: 'BookOpen',
    path: '/dashboard/counselor/resources',
    roles: ['counselor']
  },
  {
    id: 'counselor-training',
    label: 'Professional Development',
    icon: 'GraduationCap',
    path: '/dashboard/counselor/training',
    roles: ['counselor']
  },
  {
    id: 'counselor-sessions',
    label: 'Sessions',
    icon: 'Calendar',
    path: '/dashboard/counselor/sessions',
    roles: ['counselor']
  },
  {
    id: 'counselor-chat',
    label: 'Messages',
    icon: 'MessageCircle',
    path: '/dashboard/counselor/chat',
    roles: ['counselor'],
    badge: 1
  },
  {
    id: 'counselor-ai-chat',
    label: 'AI Chat',
    icon: 'Bot',
    path: '/dashboard/counselor/ai-chat',
    roles: ['counselor']
  },
  {
    id: 'counselor-settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/dashboard/counselor/settings',
    roles: ['counselor']
  },

  // Admin navigation
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard/admin',
    roles: ['admin']
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: 'UserCheck',
    path: '/dashboard/admin/users',
    roles: ['admin']
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: 'UserPlus',
    path: '/dashboard/admin/approvals',
    roles: ['admin'],
    badge: 3
  },
  {
    id: 'resources-review',
    label: 'Resources Review',
    icon: 'ClipboardList',
    path: '/dashboard/admin/resources-review',
    roles: ['admin']
  },
  {
    id: 'training-resources',
    label: 'Training Resources',
    icon: 'GraduationCap',
    path: '/dashboard/admin/training-resources',
    roles: ['admin']
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'HelpCircle',
    path: '/dashboard/admin/support',
    roles: ['admin'],
    badge: 3
  },
  {
    id: 'systems',
    label: 'Systems',
    icon: 'Server',
    path: '/dashboard/admin/systems',
    roles: ['admin']
  },
  {
    id: 'admin-settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/dashboard/admin/settings',
    roles: ['admin']
  }
];

const iconMap = {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Bot,
  Settings,
  UserCheck,
  UserPlus,
  GraduationCap,
  HelpCircle,
  Server,
  ClipboardList,
};

export function DashboardSidebar({ 
  userRole, 
  currentPath, 
  onNavigate, 
  className,
  open,
  setOpen
}: DashboardSidebarProps) {
  
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || LayoutDashboard;
  };

  const links = filteredItems.map((item) => {
    const Icon = getIcon(item.icon);
    const isActive = currentPath === item.path;
    
    return {
      label: item.label,
      href: item.path,
      icon: (
        <Icon 
          className={cn(
            "text-sidebar-foreground h-5 w-5 flex-shrink-0",
            isActive && "text-sidebar-primary"
          )} 
        />
      ),
    };
  });

  return (
    <div className={cn("h-full", className)}>
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10" hideMobileTrigger>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <RCRLogoComponent />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link}
                  as={Link}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    currentPath === link.href && "bg-sidebar-accent text-sidebar-primary"
                  )}
                />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const RCRLogoComponent = () => {
  const { open, animate } = useSidebar();
  
  return (
    <Link
      href="/"
      className="flex items-center justify-start gap-2 group/sidebar py-2"
    >
      <RCRLogo variant="simple" width={40} height={40} />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sidebar-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 font-medium font-sans"
      >
        Rwanda Cancer Relief
      </motion.span>
    </Link>
  );
};
