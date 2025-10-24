import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { NotificationInboxPopover } from '@workspace/ui/components/notification-inbox-popover';
import { 
  LogOut, 
  Settings, 
  User, 
  Menu
} from 'lucide-react';
import { UserRole } from '../../../lib/types';

interface TopBarProps {
  user: {
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  onLogout: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  notifications?: number;
  onNotificationClick?: () => void;
}

export function TopBar({ 
  user, 
  onLogout, 
  onToggleSidebar,
  isSidebarOpen = true,
  notifications = 0,
  onNotificationClick
}: TopBarProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'counselor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'counselor':
        return 'Counselor';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between px-6 w-full">
        {/* Left side - Menu toggle and title */}
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleSidebar}
              className="md:hidden h-12 w-12"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold">Rwanda Cancer Relief</h1>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <NotificationInboxPopover />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge className={`w-fit text-xs ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
