import React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Bot,
  Settings,
  UserCheck,
  HelpCircle,
  BarChart3,
  Shield,
  Heart,
  FileText,
  Video,
  Headphones,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserRole, NavigationItem } from '../../../lib/types';

interface SidebarProps {
  userRole: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
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
    label: 'Chat',
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
    id: 'counselor-sessions',
    label: 'Sessions',
    icon: 'Calendar',
    path: '/dashboard/counselor/sessions',
    roles: ['counselor']
  },
  {
    id: 'counselor-chat',
    label: 'Chat',
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
    id: 'support',
    label: 'Support',
    icon: 'HelpCircle',
    path: '/dashboard/admin/support',
    roles: ['admin'],
    badge: 3
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
  HelpCircle,
  BarChart3,
  Shield,
  Heart,
  FileText,
  Video,
  Headphones
};

export function Sidebar({ 
  userRole, 
  currentPath, 
  onNavigate, 
  isCollapsed = false,
  onToggleCollapse,
  className 
}: SidebarProps) {
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || LayoutDashboard;
  };

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="font-semibold">Rwanda Cancer Relief</span>
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = currentPath === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-2" : "px-3",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
                onClick={() => onNavigate(item.path)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <>
          <Separator />
          <div className="p-4">
            <div className="text-xs text-muted-foreground">
              <p>Rwanda Cancer Relief</p>
              <p>Supporting cancer patients and families</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
