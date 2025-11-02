"use client";

import React, { useState } from 'react';
import { Plus, Search, Pencil, MessageSquare, Clock, Archive, MoreVertical } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  archived?: boolean;
}

interface ChatThreadsSidebarProps {
  threads?: ChatThread[];
  activeThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
  onNewThread?: () => void;
  className?: string;
}

// Mock threads data - replace with real data later
const mockThreads: ChatThread[] = [
  {
    id: '1',
    title: 'Cancer Treatment Questions',
    lastMessage: 'Thank you for the information about treatment options.',
    timestamp: new Date('2024-01-15T10:30:00'),
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Support Resources',
    lastMessage: 'Are there any local support groups available?',
    timestamp: new Date('2024-01-14T14:20:00'),
  },
  {
    id: '3',
    title: 'Appointment Scheduling',
    lastMessage: 'I would like to schedule a consultation.',
    timestamp: new Date('2024-01-13T09:15:00'),
    unreadCount: 1,
  },
  {
    id: '4',
    title: 'Financial Assistance',
    lastMessage: 'How can I apply for financial aid?',
    timestamp: new Date('2024-01-12T16:45:00'),
  },
  {
    id: '5',
    title: 'Family Support',
    lastMessage: 'Resources for my family members',
    timestamp: new Date('2024-01-10T11:30:00'),
  },
  {
    id: '6',
    title: 'Old Consultation',
    lastMessage: 'Previous consultation notes',
    timestamp: new Date('2024-01-05T09:00:00'),
    archived: true,
  },
];

export function ChatThreadsSidebar({
  threads = mockThreads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
  className,
}: ChatThreadsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'archived'>('all');

  // Filter threads based on active tab
  const filteredByTab = threads.filter((thread) => {
    if (activeTab === 'archived') return thread.archived;
    if (activeTab === 'recent') {
      const daysSince = Math.floor((new Date().getTime() - thread.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return !thread.archived && daysSince <= 7;
    }
    return !thread.archived;
  });

  // Filter by search query
  const filteredThreads = filteredByTab.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn("flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-r-3xl border-r border-primary/20 shadow-sm w-full lg:w-64 relative overflow-hidden", className)} style={{ height: '100%' }}>
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
      
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-primary/20 space-y-2 md:space-y-3 relative z-10">
        {/* New Chat Button */}
        <Button
          variant="default"
          size="sm"
          onClick={onNewThread}
          className="w-full justify-start font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background border-border text-foreground"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8 md:h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 
               activeTab === 'archived' ? 'No archived conversations' :
               activeTab === 'recent' ? 'No recent conversations' :
               'No conversations yet'}
            </p>
            {!searchQuery && activeTab === 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewThread}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2 md:p-3 space-y-1">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "group relative flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  activeThreadId === thread.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground"
                )}
                onClick={() => onThreadSelect?.(thread.id)}
              >
                <MessageSquare className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  activeThreadId === thread.id 
                    ? "text-sidebar-primary-foreground" 
                    : "text-muted-foreground group-hover:text-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-sm truncate">
                      {thread.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
