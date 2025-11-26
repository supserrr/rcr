'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { SessionCard } from '../../../../components/dashboard/shared/SessionCard';
import { SessionBookingModal } from '../../../../components/session/SessionBookingModal';
import { CounselorSelectionModal } from '../../../../components/session/CounselorSelectionModal';
import { RescheduleModal } from '../../../../components/session/RescheduleModal';
import { CancelSessionModal } from '../../../../components/session/CancelSessionModal';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Separator } from '@workspace/ui/components/separator';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  Plus,
  Filter,
  Search,
  AlertCircle,
  Info,
  User,
  Mic
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useSessions } from '../../../../hooks/useSessions';
import type { Session, RescheduleSessionInput } from '@/lib/api/sessions';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import type { Counselor } from '../../../../lib/types';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';

export default function PatientSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCounselorSelectionOpen, setIsCounselorSelectionOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(false);
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);

  // Load sessions using the hook
  const patientSessionsParams = useMemo(
    () => (user?.id ? { patientId: user.id } : undefined),
    [user?.id]
  );

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    rescheduleSession,
    cancelSession,
    refreshSessions,
  } = useSessions(patientSessionsParams, {
    enabled: Boolean(user?.id),
  });

  // Filter sessions based on tab
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(session => {
      if (session.status !== 'scheduled') return false;
      
      // Parse date (session.date is a string in YYYY-MM-DD format)
      const sessionDate = new Date(session.date);
      
      // If session has a time, combine date and time
      if (session.time) {
        // Parse time (format: HH:MM or HH:MM:SS)
        const [hours, minutes] = session.time.split(':').map(Number);
        const sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        // Session is upcoming if the datetime hasn't passed
        return sessionDateTime > now;
      }
      
      // If no time specified, check if date is today or in the future
      // Set to end of day for date-only comparison
      const endOfSessionDate = new Date(sessionDate);
      endOfSessionDate.setHours(23, 59, 59, 999);
      return endOfSessionDate > now;
    });
  }, [sessions]);

  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || session.status === 'cancelled'
  );

  const allSessions = sessions;

  // Load counselors on mount (for displaying names in session cards)
  useEffect(() => {
    if (counselors.length === 0 && !counselorsLoading && user?.id) {
      const loadCounselors = async () => {
        try {
          setCounselorsLoading(true);
          const response = await AdminApi.listUsers({ role: 'counselor' });
          
          // Map AdminUser to Counselor format
          const mappedCounselors: Counselor[] = response.users
            .filter((adminUser) => {
              // Filter counselors based on visibility and availability
              const metadata = (adminUser.metadata ?? {}) as Record<string, unknown>;
              const approvalStatus = metadata.approvalStatus || (adminUser.counselorProfile as any)?.approval_status;
              
              // Only show approved/active counselors (relaxed check)
              // If approval status exists and is not approved/active, filter out
              if (approvalStatus && approvalStatus !== 'approved' && approvalStatus !== 'active') {
                return false;
              }
              
              return true;
            })
            .map((adminUser): Counselor => {
              const metadata = (adminUser.metadata ?? {}) as Record<string, unknown>;
              const counselorProfile = adminUser.counselorProfile;
              
              // Extract title from metadata
              const professionalTitle = 
                (typeof metadata.professionalTitle === 'string' ? metadata.professionalTitle : undefined) ||
                (typeof metadata.professional_title === 'string' ? metadata.professional_title : undefined) ||
                (typeof metadata.title === 'string' ? metadata.title : undefined) ||
                undefined;
              
              const baseName = adminUser.fullName || 'Counselor';
              const displayName = professionalTitle 
                ? `${professionalTitle} ${baseName}`.trim()
                : baseName;

              return {
                id: adminUser.id,
                name: displayName,
                title: professionalTitle,
                email: adminUser.email || '',
                role: 'counselor',
                avatar: adminUser.avatarUrl || undefined,
                createdAt: new Date(adminUser.createdAt),
                lastLogin: adminUser.lastLogin ? new Date(adminUser.lastLogin) : undefined,
                metadata,
                specialty: adminUser.specialty || 'General Counseling',
                experience: adminUser.experience || 0,
                availability: (metadata.availability || (counselorProfile as any)?.availability_status || adminUser.availability || 'available') as 'available' | 'busy' | 'offline',
                phoneNumber: adminUser.phoneNumber || undefined,
                bio: (metadata.bio as string | undefined) || counselorProfile?.bio || undefined,
                credentials: (metadata.credentials as string | undefined) || (counselorProfile as any)?.credentials || undefined,
                languages: Array.isArray(metadata.languages) 
                  ? metadata.languages.filter((item): item is string => typeof item === 'string')
                  : undefined,
                location: (metadata.location as string | undefined) || adminUser.location || undefined,
                visibilitySettings: metadata.visibilitySettings as any,
                approvalStatus: metadata.approvalStatus as any,
                availabilityStatus: metadata.availabilityStatus as any,
              };
            });
          
          setCounselors(mappedCounselors);
        } catch (error) {
          console.error('Error loading counselors:', error);
          toast.error('Failed to load counselors');
        } finally {
          setCounselorsLoading(false);
        }
      };
      
      loadCounselors();
    }
  }, [counselors.length, counselorsLoading, user?.id]);

  // Check for counselorId in URL query params on mount
  useEffect(() => {
    const counselorId = searchParams.get('counselorId');
    if (counselorId) {
      // TODO: Load counselor from API
      // For now, we'll need to fetch counselor data
      // setSelectedCounselor(counselor);
      setIsBookingOpen(true);
      router.replace('/dashboard/patient/sessions', { scroll: false });
    }
  }, [searchParams, router]);

  // Get counselor name by ID
  const getCounselorName = (counselorId: string) => {
    const counselor = counselors.find(c => c.id === counselorId);
    return counselor?.name || 'Unknown Counselor';
  };

  const getCounselorSpecialty = (counselorId: string) => {
    const counselor = counselors.find(c => c.id === counselorId);
    return counselor?.specialty || 'Counselor';
  };

  const getCounselorAvatar = (counselorId: string) => {
    const counselor = counselors.find(c => c.id === counselorId);
    if (counselor?.avatar) {
      return normalizeAvatarUrl(counselor.avatar);
    }
    return undefined;
  };

  const getPatientAvatar = () => {
    // Patient's own avatar from auth user
    if (user?.avatar) {
      return normalizeAvatarUrl(user.avatar);
    }
    return undefined;
  };

  const handleJoinSession = (session: Session) => {
    router.push(`/dashboard/patient/sessions/session/${session.id}`);
  };

  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (
    sessionId: string | undefined, 
    newDate: Date, 
    newTime: string, 
    newDuration: number
  ) => {
    if (!sessionId) return;
    
    // Type guard: after the check above, sessionId is definitely a string
    // TypeScript doesn't narrow after return, so we use a type assertion
    const id = sessionId as string;
    
    try {
      const rescheduleData = {
        date: newDate.toISOString().split('T')[0],
        time: newTime,
      } as RescheduleSessionInput;
      await rescheduleSession(id as string, rescheduleData);
      toast.success('Session rescheduled successfully!');
      setIsRescheduleOpen(false);
      setSelectedSession(null);
      await refreshSessions();
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule session. Please try again.');
    }
  };

  const handleCancelSession = (session: Session) => {
    setSelectedSession(session);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async (sessionId: string, reason: string, notes?: string) => {
    try {
      await cancelSession(sessionId, { reason });
      toast.success('Session cancelled successfully! Your counselor has been notified.');
      setIsCancelOpen(false);
      setSelectedSession(null);
      await refreshSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel session. Please try again.');
    }
  };

  const handleQuickBooking = () => {
    setIsCounselorSelectionOpen(true);
  };

  const handleSelectCounselor = (counselor: any) => {
    setSelectedCounselor(counselor);
    setIsCounselorSelectionOpen(false);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (bookingData: any) => {
    try {
      if (!user?.id || !selectedCounselor?.id) {
        toast.error('Missing user or counselor information');
        return;
      }

      // Validate counselor exists in loaded counselors list
      const counselor = counselors.find(c => c.id === selectedCounselor.id);
      if (!counselor) {
        toast.error('Counselor not found. Please select a valid counselor.');
        return;
      }

      // Ensure counselors are loaded
      if (counselorsLoading) {
        toast.error('Counselor data is still loading. Please wait and try again.');
        return;
      }

      // Map 'in-person' to 'video' as database only supports 'video', 'audio', 'chat'
      const sessionType = bookingData.sessionType === 'in-person' 
        ? 'video' 
        : (bookingData.sessionType || 'video');
      
      // Validate session type
      if (!['video', 'audio', 'chat'].includes(sessionType)) {
        toast.error(`Invalid session type: ${sessionType}. Please select a valid session type.`);
        return;
      }

      await createSession({
        patientId: user.id,
        counselorId: selectedCounselor.id,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        type: sessionType as 'video' | 'audio' | 'chat',
        notes: bookingData.notes,
      });
      
      toast.success('Session booked successfully!');
      setIsBookingOpen(false);
      setSelectedCounselor(null);
      await refreshSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book session. Please try again.');
    }
  };

  const handleViewSessionInfo = (session: Session) => {
    setViewingSession(session);
    setIsSessionInfoOpen(true);
  };

  // Show loading state
  if (authLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="bars" size={32} className="text-primary" />
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (sessionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Sessions</h2>
          <p className="text-muted-foreground">{sessionsError}</p>
          <Button onClick={() => refreshSessions()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="My Sessions"
        description="Manage your counseling sessions and view your session history"
      />

      {/* Quick Stats */}
      <AnimatedGrid className="grid gap-4 md:grid-cols-3" staggerDelay={0.1}>
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingSessions.length > 0 && upcomingSessions[0]
                ? `Next session ${new Date(upcomingSessions[0].date).toLocaleDateString()}`
                : 'No upcoming sessions'
              }
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.6}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              Total sessions completed
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.7}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time sessions
            </p>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Sessions</h2>
        </div>
        <Button onClick={handleQuickBooking} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Book a Session
        </Button>
      </div>

      {/* Sessions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            All ({allSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    patientName={user?.name || 'Patient'}
                    patientAvatar={getPatientAvatar()}
                    patientId={session.patientId}
                    counselorName={getCounselorName(session.counselorId)}
                    counselorSpecialty={getCounselorSpecialty(session.counselorId)}
                    counselorAvatar={getCounselorAvatar(session.counselorId)}
                    counselorId={session.counselorId}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
                    onCancel={handleCancelSession}
                    onViewSessionInfo={handleViewSessionInfo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled sessions at the moment
                </p>
                <Button onClick={handleQuickBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book a Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {allSessions.length > 0 ? (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleQuickBooking} variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Book Another Session
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      patientName={user?.name || 'Patient'}
                      patientAvatar={getPatientAvatar()}
                      patientId={session.patientId}
                      counselorName={getCounselorName(session.counselorId)}
                      counselorSpecialty={getCounselorSpecialty(session.counselorId)}
                      counselorAvatar={getCounselorAvatar(session.counselorId)}
                      counselorId={session.counselorId}
                      onJoin={session.status === 'scheduled' ? handleJoinSession : undefined}
                      onReschedule={session.status === 'scheduled' ? handleRescheduleSession : undefined}
                      onCancel={session.status === 'scheduled' ? handleCancelSession : undefined}
                      onViewSessionInfo={handleViewSessionInfo}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your journey by booking your first session
                </p>
                <Button onClick={handleQuickBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book a Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Counselor Selection Modal */}
      <CounselorSelectionModal
        isOpen={isCounselorSelectionOpen}
        onClose={() => setIsCounselorSelectionOpen(false)}
        counselors={counselors}
        onSelectCounselor={handleSelectCounselor}
      />

      {/* Session Booking Modal */}
      {selectedCounselor && (
        <SessionBookingModal
          counselor={selectedCounselor}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedCounselor(null);
          }}
          onBookingConfirmed={handleConfirmBooking}
        />
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        onReschedule={handleConfirmReschedule as any}
      />

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        userRole="patient"
        onCancel={handleConfirmCancel as any}
      />

      {/* Session Info Modal */}
      {viewingSession && (
        <Dialog open={isSessionInfoOpen} onOpenChange={setIsSessionInfoOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Session Information</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Session Status */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={
                      viewingSession.status === 'scheduled' ? 'default' :
                      viewingSession.status === 'completed' ? 'default' :
                      viewingSession.status === 'cancelled' ? 'destructive' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {viewingSession.status.charAt(0).toUpperCase() + viewingSession.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Type</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {viewingSession.type === 'audio' && <Mic className="h-3 w-3 mr-1" />}
                    {viewingSession.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                    {viewingSession.type === 'chat' && <MessageCircle className="h-3 w-3 mr-1" />}
                    {viewingSession.type}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Counselor Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Counselor
                </h3>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={viewingSession.counselorId ? getCounselorAvatar(viewingSession.counselorId) : undefined} />
                    <AvatarFallback>
                      {getCounselorName(viewingSession.counselorId).split(' ').map(n => n[0]).join('') || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{getCounselorName(viewingSession.counselorId)}</p>
                    <p className="text-sm text-muted-foreground">{getCounselorSpecialty(viewingSession.counselorId)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient
                </h3>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getPatientAvatar()} />
                    <AvatarFallback>
                      {(user?.name || 'P').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.name || 'Patient'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Session Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold">
                      {new Date(viewingSession.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="font-semibold">{viewingSession.time || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold">{viewingSession.duration} minutes</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Session ID</p>
                    <p className="font-semibold text-xs font-mono">{viewingSession.id}</p>
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              {viewingSession.notes && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Notes</h3>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{viewingSession.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {viewingSession.status === 'scheduled' && (
                  <>
                    <Button 
                      onClick={() => {
                        setIsSessionInfoOpen(false);
                        handleJoinSession(viewingSession);
                      }}
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsSessionInfoOpen(false);
                        handleRescheduleSession(viewingSession);
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setIsSessionInfoOpen(false);
                        handleCancelSession(viewingSession);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setIsSessionInfoOpen(false)}
                  className={viewingSession.status !== 'scheduled' ? 'flex-1' : ''}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
