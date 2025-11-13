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
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  Plus,
  Filter,
  Search,
  AlertCircle
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
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' &&
    new Date(session.date) > new Date()
  );

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

      await createSession({
        patientId: user.id,
        counselorId: selectedCounselor.id,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        type: bookingData.sessionType || 'video',
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Past ({pastSessions.length})
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

        <TabsContent value="past" className="mt-6">
          <div className="space-y-4">
            {pastSessions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No past sessions</h3>
                <p className="text-muted-foreground">
                  Your completed sessions will appear here
                </p>
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
    </div>
  );
}
