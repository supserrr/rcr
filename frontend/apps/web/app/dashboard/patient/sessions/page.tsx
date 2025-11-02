'use client';

import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { dummySessions, dummyCounselors } from '../../../../lib/dummy-data';
import { Session } from '../../../../lib/types';

export default function PatientSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCounselorSelectionOpen, setIsCounselorSelectionOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const currentPatientId = '1'; // Jean Baptiste

  // Check for counselorId in URL query params on mount
  useEffect(() => {
    const counselorId = searchParams.get('counselorId');
    if (counselorId) {
      // Map counselors page IDs to dummy data counselors
      // The counselors page uses IDs 1-4, but we need to map to actual counselor data
      const counselorMapping: Record<string, string> = {
        '1': '2', // Dr. Marie Uwimana -> Dr. Marie Claire
        '2': '6', // Jean-Baptiste Nkurunziza -> Dr. Jean Paul (or find by name)
        '3': '7', // Dr. Grace Mukamana -> Dr. Immaculee (or find by name)
        '4': '6', // Paul Nsengimana -> Use Dr. Jean Paul as fallback
      };
      
      // Try to find by mapped ID first
      const mappedId = counselorMapping[counselorId];
      let counselor = mappedId ? dummyCounselors.find(c => c.id === mappedId) : null;
      
      // If not found, try finding by original ID
      if (!counselor) {
        counselor = dummyCounselors.find(c => c.id === counselorId);
      }
      
      // Map counselors page names to dummy data names as fallback
      const nameMapping: Record<string, string[]> = {
        '1': ['Dr. Marie Uwimana', 'Dr. Marie Claire'],
        '2': ['Jean-Baptiste Nkurunziza'],
        '3': ['Dr. Grace Mukamana', 'Dr. Immaculee'],
        '4': ['Paul Nsengimana'],
      };
      
      // If still not found, try to find by name (for future compatibility)
      if (!counselor) {
        const namesToFind = nameMapping[counselorId];
        if (namesToFind) {
          counselor = dummyCounselors.find(c => 
            namesToFind.some(name => c.name.toLowerCase().includes(name.toLowerCase().replace('Dr. ', '')))
          );
        }
      }
      
      // If counselor found, pre-select and open booking modal
      if (counselor) {
        setSelectedCounselor(counselor);
        setIsBookingOpen(true);
        // Clean up the URL query parameter
        router.replace('/dashboard/patient/sessions', { scroll: false });
      }
    }
  }, [searchParams, router]);

  const upcomingSessions = dummySessions.filter(session => 
    session.patientId === currentPatientId && 
    session.status === 'scheduled' &&
    new Date(session.date) > new Date()
  );

  const pastSessions = dummySessions.filter(session => 
    session.patientId === currentPatientId && 
    (session.status === 'completed' || session.status === 'cancelled')
  );

  const allSessions = dummySessions.filter(session => 
    session.patientId === currentPatientId
  );

  const getCounselorName = (counselorId: string) => {
    const counselor = dummyCounselors.find(c => c.id === counselorId);
    return counselor?.name || 'Unknown Counselor';
  };

  const getCounselorAvatar = (counselorId: string) => {
    const counselor = dummyCounselors.find(c => c.id === counselorId);
    return counselor?.avatar;
  };

  const handleJoinSession = (session: Session) => {
    // Navigate to the session room
    router.push(`/dashboard/patient/sessions/session/${session.id}`);
  };

  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (sessionId: string, newDate: Date, newTime: string, newDuration: number) => {
    try {
      // In a real app, this would make an API call to update the session
      console.log('Rescheduling session:', {
        sessionId,
        newDate,
        newTime,
        newDuration
      });
      
      // Update the session in dummy data (for demo purposes)
      const sessionIndex = dummySessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        dummySessions[sessionIndex] = {
          ...dummySessions[sessionIndex],
          date: newDate,
          time: newTime,
          duration: newDuration
        } as Session;
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Session rescheduled successfully!');
      
    } catch (error) {
      console.error('Error rescheduling session:', error);
      alert('Failed to reschedule session. Please try again.');
    }
  };

  const handleCancelSession = (session: Session) => {
    setSelectedSession(session);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async (sessionId: string, reason: string, notes?: string) => {
    try {
      // In a real app, this would make an API call to cancel the session
      console.log('Cancelling session:', {
        sessionId,
        reason,
        notes
      });
      
      // Update the session in dummy data (for demo purposes)
      const sessionIndex = dummySessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1 && dummySessions[sessionIndex]) {
        dummySessions[sessionIndex] = {
          ...dummySessions[sessionIndex],
          status: 'cancelled',
          notes: `${dummySessions[sessionIndex]?.notes || ''}\n\nCancellation: ${reason}${notes ? ` - ${notes}` : ''}`
        } as Session;
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Session cancelled successfully! Your counselor has been notified.');
      
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert('Failed to cancel session. Please try again.');
    }
  };

  const handleQuickBooking = () => {
    // Open counselor selection modal
    setIsCounselorSelectionOpen(true);
  };

  const handleSelectCounselor = (counselor: any) => {
    setSelectedCounselor(counselor);
    setIsCounselorSelectionOpen(false);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (bookingData: any) => {
    console.log('Booking confirmed:', bookingData);
    // Here you would typically send the booking data to your backend
    setIsBookingOpen(false);
    setSelectedCounselor(null);
  };

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
              Next session in 2 days
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
                    patientName="Jean Baptiste"
                    counselorName={getCounselorName(session.counselorId)}
                    counselorAvatar={getCounselorAvatar(session.counselorId)}
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
                    patientName="Jean Baptiste"
                    counselorName={getCounselorName(session.counselorId)}
                    counselorAvatar={getCounselorAvatar(session.counselorId)}
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
                      patientName="Jean Baptiste"
                      counselorName={getCounselorName(session.counselorId)}
                      counselorAvatar={getCounselorAvatar(session.counselorId)}
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
        counselors={dummyCounselors}
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
        session={selectedSession}
        onReschedule={handleConfirmReschedule}
      />

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        userRole="patient"
        onCancel={handleConfirmCancel}
      />
    </div>
  );
}
