'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import {
  Users,
  Calendar,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CircleDot,
  Circle,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useSessions } from '../../../hooks/useSessions';
import { useChat } from '../../../hooks/useChat';
import { useSessionStats } from '../../../hooks/useSessionStats';
import { useChatSummary } from '../../../hooks/useChatSummary';
import { AdminApi, type AdminUser } from '../../../lib/api/admin';
import { ProgressApi } from '../../../lib/api/progress';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export default function CounselorDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientProgressMap, setPatientProgressMap] = useState<Record<
    string,
    { average: number; completed: number; total: number }
  >>({});
  const [patientProgressLoading, setPatientProgressLoading] = useState(false);

  // Load upcoming sessions
  const counselorSessionParams = useMemo(
    () => (user?.id ? { counselorId: user.id } : undefined),
    [user?.id]
  );

  const { sessions, loading: sessionsLoading, error: _sessionsError } = useSessions(
    counselorSessionParams,
    {
      enabled: Boolean(user?.id),
    }
  );

  const {
    stats: sessionStats,
    loading: sessionStatsLoading,
    error: _sessionStatsError,
  } = useSessionStats({
    role: 'counselor',
    userId: user?.id,
    enabled: Boolean(user?.id),
  });

  // Load chats for recent messages
  const chatParams = useMemo(
    () => (user?.id ? { participantId: user.id } : undefined),
    [user?.id]
  );

  const { chats, messages, loading: chatsLoading, error: _chatsError } = useChat(chatParams);
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

  // Load assigned patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        // Get all patients who have sessions with this counselor
        const response = await AdminApi.listUsers({ role: 'patient' });
        // Filter to get unique patients from sessions
        const patientIds = new Set(
          sessions.map(session => session.patientId)
        );
        const assignedPatientsList = response.users.filter(p => patientIds.has(p.id));
        setPatients(assignedPatientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setPatientsLoading(false);
      }
    };

    if (!user?.id) {
      setPatients([]);
      setPatientsLoading(false);
      return;
    }

    if (sessions.length > 0) {
      fetchPatients();
    } else {
      setPatients([]);
      setPatientsLoading(false);
    }
  }, [user?.id, sessions]);

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

  // Get unique assigned patients from sessions
  const assignedPatients = useMemo(() => {
    const patientIds = new Set(sessions.map((session) => session.patientId));
    return patients.filter((p) => patientIds.has(p.id));
  }, [sessions, patients]);

  useEffect(() => {
    const loadPatientProgress = async () => {
      if (!user?.id || assignedPatients.length === 0) {
        setPatientProgressMap({});
        setPatientProgressLoading(false);
        return;
      }

      try {
        setPatientProgressLoading(true);
        const results = await Promise.all(
          assignedPatients.map(async (patient) => {
            try {
              const modules = await ProgressApi.listPatientProgress(patient.id, {
                includeItems: false,
              });
              if (modules.length === 0) {
                return { patientId: patient.id, average: 0, completed: 0, total: 0 };
              }
              const average =
                Math.round(
                  modules.reduce((sum, module) => sum + module.progressPercent, 0) /
                    modules.length
                ) || 0;
              const completed = modules.filter((module) => module.status === 'completed').length;
              return {
                patientId: patient.id,
                average,
                completed,
                total: modules.length,
              };
            } catch (error) {
              console.error('Error fetching progress for patient', patient.id, error);
              return { patientId: patient.id, average: 0, completed: 0, total: 0 };
            }
          })
        );

        const nextMap: Record<string, { average: number; completed: number; total: number }> = {};
        for (const entry of results) {
          nextMap[entry.patientId] = {
            average: entry.average,
            completed: entry.completed,
            total: entry.total,
          };
        }
        setPatientProgressMap(nextMap);
      } catch (error) {
        console.error('Error loading patient progress summary:', error);
        toast.error('Failed to load patient progress summary');
      } finally {
        setPatientProgressLoading(false);
      }
    };

    loadPatientProgress();
  }, [assignedPatients, user?.id]);

  const patientSessionStats = useMemo(() => {
    const stats = new Map<
      string,
      { total: number; completed: number; pending: number; cancelled: number }
    >();

    sessions.forEach((session) => {
      const entry =
        stats.get(session.patientId) ?? {
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        };

      entry.total += 1;

      if (session.status === 'completed') {
        entry.completed += 1;
      } else if (session.status === 'cancelled') {
        entry.cancelled += 1;
      } else if (session.status === 'scheduled' || session.status === 'rescheduled') {
        entry.pending += 1;
      }

      stats.set(session.patientId, entry);
    });

    return stats;
  }, [sessions]);

  const statsLoading =
    authLoading ||
    sessionsLoading ||
    sessionStatsLoading ||
    chatSummaryLoading ||
    patientsLoading ||
    patientProgressLoading;

  const upcomingSessionsLoading = authLoading || sessionsLoading;
  const messagesLoading = !hasLoadedChats && (authLoading || chatsLoading);
  const patientOverviewLoading =
    authLoading || patientProgressLoading || patientsLoading || sessionsLoading;

  const upcomingSessionCount = sessionStats?.upcomingSessions ?? upcomingSessions.length;

  const averagePatientProgress = useMemo(() => {
    const entries = Object.values(patientProgressMap);
    if (entries.length === 0) {
      return null;
    }
    const total = entries.reduce((sum, entry) => sum + entry.average, 0);
    return Math.round(total / entries.length);
  }, [patientProgressMap]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.fullName || patient?.email || 'Unknown Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    // AdminUser doesn't have avatar, return undefined
    return undefined;
  };

  const handleMessageClick = (message: any) => {
    // Navigate to chat page with the chat ID
    if (message.chatId) {
      router.push(`/dashboard/counselor/chat?chatId=${message.chatId}`);
    } else {
      // Fallback: just navigate to chat page
      router.push('/dashboard/counselor/chat');
    }
  };

  const handleAvailabilityChange = (newAvailability: 'available' | 'busy' | 'offline') => {
    setAvailability(newAvailability);
    // In a real app, this would update the availability in the backend
    // For now, we'll just update local state
    toast.success(`Availability set to ${newAvailability}`);
  };

  // Get patient name from message
  const getPatientNameFromMessage = (message: any) => {
    // Try to find patient from chat
    const chat = chats.find(c => c.id === message.chatId);
    if (chat) {
      const patientId = chat.participants.find(id => id !== user?.id);
      const patient = patients.find(p => p.id === patientId);
      return patient?.fullName || patient?.email || 'Patient';
    }
    return 'Patient';
  };

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

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'available':
        return CircleDot;
      case 'busy':
        return Circle;
      case 'offline':
        return Minus;
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title={`Welcome back, ${user?.name || 'Counselor'}`}
        description="Here's an overview of your patients and upcoming sessions"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Active Patients"
          value={statsLoading ? '—' : assignedPatients.length}
          description={
            statsLoading
              ? 'Loading…'
              : averagePatientProgress !== null
              ? `Average progress ${averagePatientProgress}%`
              : 'Currently assigned'
          }
          icon={Users}
          delay={0.1}
          animateValue={!statsLoading}
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
        
        {/* Availability Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group">
            {/* Decorative gradient blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
            
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Availability Status
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="p-2 rounded-full bg-primary/10"
                >
                  {React.createElement(getAvailabilityIcon(), { className: 'h-4 w-4 text-primary' })}
                </motion.div>
              </div>
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-2xl font-bold"
                >
                  {availability.charAt(0).toUpperCase() + availability.slice(1)}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  Change status below
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="mt-4 pt-4 border-t border-border/20"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={availability === 'available' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'available' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleAvailabilityChange('available')}
                    >
                      <CircleDot className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={availability === 'busy' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'busy' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      onClick={() => handleAvailabilityChange('busy')}
                    >
                      <Circle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={availability === 'offline' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'offline' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                      onClick={() => handleAvailabilityChange('offline')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Upcoming Sessions */}
        <AnimatedCard delay={0.5}>
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
                  const sessionDateTime = new Date(`${session.date}T${session.time}`);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getPatientAvatar(session.patientId)} alt={getPatientName(session.patientId)} />
                          <AvatarFallback>
                            {getPatientName(session.patientId).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getPatientName(session.patientId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {sessionDateTime.toLocaleDateString(undefined, { dateStyle: 'medium' })}{' '}
                            at {sessionDateTime.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{session.duration} min</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/dashboard/counselor/sessions/session/${session.id}`)}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Patient Progress Overview */}
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Patient Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientOverviewLoading ? (
              renderLoader('Summarising patient progress')
            ) : assignedPatients.length > 0 ? (
              <div className="space-y-4">
                {assignedPatients.map((patient) => {
                  const stats = patientSessionStats.get(patient.id);
                  const moduleProgress = patientProgressMap[patient.id];
                  const modulesCompleted = moduleProgress?.completed ?? 0;
                  const modulesTotal = moduleProgress?.total ?? 0;
                  const completionPercent =
                    moduleProgress !== undefined
                      ? moduleProgress.average
                      : stats && stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0;

                  let badgeLabel = 'No sessions yet';
                  let badgeVariant: 'secondary' | 'outline' | 'ghost' = 'outline';

                  if (stats) {
                    if (stats.pending > 0) {
                      badgeLabel = `${stats.pending} upcoming`;
                    } else if (stats.completed === stats.total && stats.total > 0) {
                      badgeLabel = 'All sessions completed';
                      badgeVariant = 'secondary';
                    } else if (stats.completed > 0) {
                      badgeLabel = `${stats.completed} completed`;
                    } else if (stats.cancelled === stats.total && stats.total > 0) {
                      badgeLabel = 'All sessions cancelled';
                    }
                  }

                  return (
                    <div key={patient.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={undefined} alt={patient.fullName || patient.email} />
                            <AvatarFallback>
                              {(patient.fullName || patient.email || 'P')
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {patient.fullName || patient.email}
                          </span>
                        </div>
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </div>
                      <Progress value={completionPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Progress {completionPercent}% • Sessions {stats?.completed ?? 0}/{stats?.total ?? 0}
                        {modulesTotal > 0 ? ` • Modules ${modulesCompleted}/${modulesTotal}` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No assigned patients yet</p>
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
              renderLoader('Loading recent conversations')
            ) : recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => {
                  const isFromCounselor = message.senderId === user?.id;
                  const patientName = getPatientNameFromMessage(message);
                  
                  return (
                    <div 
                      key={message.id} 
                      onClick={() => handleMessageClick(message)}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-200"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{patientName}</p>
                          <div className="flex items-center gap-2">
                            {isFromCounselor && (
                              <Badge variant="secondary" className="text-xs">Sent</Badge>
                            )}
                            {!message.isRead && !isFromCounselor && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent messages</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard delay={1.1}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/counselor/sessions')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/counselor/chat')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message to Patient
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                // In a real app, this would open a support ticket or issue reporting modal
                alert('Report Issue feature - would open issue reporting form');
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>
    </div>
  );
}
