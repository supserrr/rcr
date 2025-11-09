'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import {
  TrendingUp,
  Calendar,
  MessageCircle,
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  Play,
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useSessions } from '../../../hooks/useSessions';
import { useChat } from '../../../hooks/useChat';
import { usePatientProgress } from '../../../hooks/usePatientProgress';
import { useSessionStats } from '../../../hooks/useSessionStats';
import { useChatSummary } from '../../../hooks/useChatSummary';
import { useResourceSummaries } from '../../../hooks/useResourceMetrics';
import { AdminApi, type AdminUser } from '../../../lib/api/admin';
import { QuickBookingModal } from '@workspace/ui/components/quick-booking-modal';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(true);

  // Load patient progress modules
  const {
    modules: progressModules,
    loading: progressLoading,
    error: _progressError,
  } = usePatientProgress({
    includeItems: true,
  });

  // Load upcoming sessions
  const patientSessionParams = useMemo(
    () => (user?.id ? { patientId: user.id } : undefined),
    [user?.id]
  );

  const {
    sessions,
    loading: sessionsLoading,
    error: _sessionsError,
  } = useSessions(patientSessionParams, {
    enabled: Boolean(user?.id),
  });

  // Load aggregated session stats
  const {
    stats: sessionStats,
    loading: sessionStatsLoading,
    error: _sessionStatsError,
  } = useSessionStats({
    role: 'patient',
    userId: user?.id,
    enabled: Boolean(user?.id),
  });

  // Load chats for recent messages
  const chatParams = useMemo(
    () => (user?.id ? { participantId: user.id } : undefined),
    [user?.id]
  );

  const {
    chats,
    messages,
    loading: chatsLoading,
    error: _chatsError,
  } = useChat(chatParams);

  const [hasLoadedChats, setHasLoadedChats] = useState(false);
  useEffect(() => {
    if (!chatsLoading) {
      setHasLoadedChats(true);
    }
  }, [chatsLoading]);

  const {
    summary: chatSummary,
    loading: chatSummaryLoading,
    error: _chatSummaryError,
  } = useChatSummary({
    enabled: Boolean(user?.id),
  });

  // Load recommended resources (summary metrics)
  const {
    summaries: resourceSummaries,
    loading: resourceSummariesLoading,
    error: _resourceSummariesError,
  } = useResourceSummaries({
    isPublic: true,
    limit: 3,
    orderBy: 'views',
    enabled: Boolean(user?.id),
  });

  // Load counselors for quick booking
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setCounselorsLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        setCounselors(response.users);
      } catch (error) {
        console.error('Error fetching counselors:', error);
        toast.error('Failed to load counselors');
      } finally {
        setCounselorsLoading(false);
      }
    };

    if (user?.id) {
      fetchCounselors();
    } else {
      setCounselorsLoading(false);
    }
  }, [user?.id]);

  // Filter upcoming sessions
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((session) => {
        const sessionDate = new Date(`${session.date}T${session.time}`);
        return (
          ['scheduled', 'rescheduled'].includes(session.status) &&
          sessionDate.getTime() >= now.getTime()
        );
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
      )
      .slice(0, 3);
  }, [sessions]);

  // Get recent messages from all chats
  const recentMessages = useMemo(() => {
    // Get messages from all chats, sorted by most recent
    const allMessages = chats.flatMap(chat => {
      // Find messages for this chat
      const chatMessages = messages.filter(msg => msg.chatId === chat.id);
      return chatMessages;
    }).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 3); // Show only 3 most recent

    return allMessages;
  }, [chats, messages]);

  // Get recommended resources
  const recommendedResources = useMemo(() => {
    return resourceSummaries.slice(0, 3);
  }, [resourceSummaries]);

  const moduleProgressPercent = useMemo(() => {
    if (progressModules.length === 0) {
      return null;
    }
    const total = progressModules.reduce((sum, module) => sum + module.progressPercent, 0);
    return Math.round(total / progressModules.length);
  }, [progressModules]);

  const moduleChecklist = useMemo(() => {
    return progressModules
      .slice()
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
      )
      .slice(0, 4)
      .map((module) => ({
        id: module.id,
        title: module.moduleTitle || module.moduleId,
        status:
          module.status === 'completed'
            ? 'completed'
            : module.status === 'in_progress'
            ? 'in_progress'
            : 'not_started',
        summary:
          typeof module.metadata?.summary === 'string'
            ? (module.metadata.summary as string)
            : undefined,
      }));
  }, [progressModules]);

  const handleQuickBooking = () => {
    setIsQuickBookingOpen(true);
  };

  const handleConfirmQuickBooking = (bookingData: any) => {
    // Quick booking is handled by the QuickBookingModal component
    setIsQuickBookingOpen(false);
    toast.success('Session booking initiated!');
  };

  const handleCloseQuickBooking = () => {
    setIsQuickBookingOpen(false);
  };

  const handleMessageClick = (message: any) => {
    // Navigate to chat page with the chat ID
    if (message.chatId) {
      router.push(`/dashboard/patient/chat?chatId=${message.chatId}`);
    } else {
      // Fallback: just navigate to chat page
      router.push('/dashboard/patient/chat');
    }
  };

  // Get counselor name from message
  const getCounselorName = (message: any) => {
    // Try to find counselor from chat
    const chat = chats.find(c => c.id === message.chatId);
    if (chat) {
      const counselorId = chat.participants.find(id => id !== user?.id);
      const counselor = counselors.find(c => c.id === counselorId);
      return counselor?.fullName || counselor?.email || 'Counselor';
    }
    return 'Counselor';
  };

  const statsLoading =
    authLoading ||
    progressLoading ||
    sessionStatsLoading ||
    chatSummaryLoading ||
    resourceSummariesLoading ||
    counselorsLoading;

  const modulesLoading = authLoading || progressLoading;
  const upcomingSessionsLoading = authLoading || sessionsLoading || counselorsLoading;
  const messagesLoading = !hasLoadedChats && (authLoading || chatsLoading);
  const resourcesLoading = authLoading || resourceSummariesLoading;

  const renderLoader = useCallback(
    (message = 'Loading...') => (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Spinner variant="bars" size={32} className="text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    ),
    []
  );

  const upcomingSessionsDescription = useMemo(() => {
    if (!sessionStats || sessionStats.upcomingSessions === 0 || !sessionStats.nextSessionAt) {
      return 'No upcoming sessions scheduled';
    }
    const nextSessionDate = new Date(sessionStats.nextSessionAt);
    return `Next session on ${nextSessionDate.toLocaleDateString(undefined, {
      dateStyle: 'medium',
    })} at ${nextSessionDate.toLocaleTimeString(undefined, { timeStyle: 'short' })}`;
  }, [sessionStats]);

  const unreadChatCount = chatSummary?.unreadMessages ?? 0;
  const unreadChatConversations = chatSummary?.unreadChats ?? 0;

  const resourceTotalViews = useMemo(() => {
    return resourceSummaries.reduce((sum, resource) => sum + resource.totalViews, 0);
  }, [resourceSummaries]);

  const formattedResourceViews = useMemo(() => {
    return resourceTotalViews.toLocaleString();
  }, [resourceTotalViews]);

  const upcomingSessionCount = sessionStats?.upcomingSessions ?? upcomingSessions.length;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Here's an overview of your progress and upcoming activities"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Module Progress"
          value={statsLoading ? '—' : moduleProgressPercent ?? '—'}
          description={
            statsLoading
              ? 'Loading…'
              : moduleProgressPercent !== null
              ? 'Your overall progress'
              : 'Progress will appear once your plan begins'
          }
          icon={TrendingUp}
          delay={0.1}
          animateValue={!statsLoading && moduleProgressPercent !== null}
        />
        <AnimatedStatCard
          title="Upcoming Sessions"
          value={statsLoading ? '—' : upcomingSessionCount}
          description={statsLoading ? 'Loading…' : upcomingSessionsDescription}
          icon={Calendar}
          delay={0.2}
          animateValue={!statsLoading}
        />
        <AnimatedStatCard
          title="Messages"
          value={statsLoading ? '—' : unreadChatConversations}
          description={statsLoading ? 'Loading…' : `${unreadChatCount} unread`}
          icon={MessageCircle}
          delay={0.3}
          animateValue={!statsLoading}
        />
        <AnimatedStatCard
          title="Resources"
          value={statsLoading ? '—' : resourceSummaries.length}
          description={
            statsLoading
              ? 'Loading…'
              : resourceSummaries.length > 0
              ? `${formattedResourceViews} total views`
              : 'Explore new resources'
          }
          icon={BookOpen}
          delay={0.4}
          animateValue={!statsLoading}
        />
      </div>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Module Progress */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Module Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">
                  {moduleProgressPercent !== null ? (
                    <SlidingNumber
                      number={moduleProgressPercent}
                      fromNumber={0}
                      transition={{ stiffness: 200, damping: 20, mass: 0.4 }}
                    />
                  ) : (
                    '—'
                  )}
                  {moduleProgressPercent !== null ? '%' : ''}
                </span>
              </div>
              <Progress value={moduleProgressPercent ?? 0} className="h-2" />
            </div>

            {modulesLoading ? (
              renderLoader('Preparing your personalized modules')
            ) : moduleChecklist.length > 0 ? (
              <div className="space-y-3">
                {moduleChecklist.map((module) => {
                  const isCompleted = module.status === 'completed';
                  const isInProgress = module.status === 'in_progress';

                  return (
                    <div key={module.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isInProgress ? (
                          <Clock className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm">{module.title}</span>
                          {module.summary ? (
                            <span className="text-xs text-muted-foreground">{module.summary}</span>
                          ) : null}
                        </div>
                      </div>
                      <Badge
                        variant={isCompleted ? 'secondary' : 'outline'}
                        className={
                          !isCompleted && !isInProgress ? 'opacity-70 border-dashed' : undefined
                        }
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
                Personalized modules will appear once your care plan begins.
              </div>
            )}

            <Button className="w-full" onClick={() => router.push('/dashboard/patient/resources')}>
              <Play className="h-4 w-4 mr-2" />
              Explore Resources
            </Button>
          </CardContent>
        </AnimatedCard>

        {/* Upcoming Sessions */}
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessionsLoading ? (
              renderLoader('Fetching your upcoming sessions')
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  // Get counselor name
                  const counselorId = session.counselorId;
                  const counselor = counselors.find(c => c.id === counselorId);
                  const counselorName = counselor?.fullName || counselor?.email || 'Counselor';
                  const sessionDateTime = new Date(`${session.date}T${session.time}`);

                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Session with {counselorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sessionDateTime.toLocaleDateString(undefined, { dateStyle: 'medium' })}{' '}
                          at {sessionDateTime.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/patient/sessions/session/${session.id}`)}
                      >
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming sessions</p>
                <Button className="mt-2" size="sm" onClick={handleQuickBooking}>
                  Book a Session
                </Button>
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Recent Messages */}
        <AnimatedCard delay={0.9}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              renderLoader('Loading your recent messages')
            ) : recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id} 
                    onClick={() => handleMessageClick(message)}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getCounselorName(message)}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent messages</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Recommended Resources */}
        <AnimatedCard delay={1.1}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resourcesLoading ? (
                renderLoader('Gathering recommended resources')
              ) : recommendedResources.length > 0 ? (
                recommendedResources.map((resource) => (
                  <div 
                    key={resource.resourceId} 
                    onClick={() => router.push(`/dashboard/patient/resources?resourceId=${resource.resourceId}`)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors duration-200">
                      {resource.type === 'audio' || resource.type === 'video' ? (
                        <Play className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type.toUpperCase()} • {resource.totalViews.toLocaleString()} views
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/patient/resources?resourceId=${resource.resourceId}`,
                        );
                      }}
                      className="group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary dark:group-hover:text-primary transition-all duration-200"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No resources available</p>
                </div>
              )}
            </div>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={handleCloseQuickBooking}
        onConfirmBooking={handleConfirmQuickBooking}
        counselors={counselors.map(counselor => ({
          id: counselor.id,
          name: counselor.fullName || counselor.email || 'Counselor',
          avatar: undefined,
          specialty: (counselor as any).specialty || 'General Counseling',
          availability: (counselor as any).availability || 'available',
        }))}
      />
    </div>
  );
}
