'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { SessionCard } from '../../../../components/dashboard/shared/SessionCard';
import { QuickBookingModal } from '@workspace/ui/components/quick-booking-modal';
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
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const currentPatientId = '1'; // Jean Baptiste

  const upcomingSessions = dummySessions.filter(session => 
    session.patientId === currentPatientId && 
    session.status === 'scheduled' &&
    new Date(session.scheduledAt) > new Date()
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
    console.log('Join session:', session.id);
    // Implement session joining logic
  };

  const handleRescheduleSession = (session: Session) => {
    console.log('Reschedule session:', session.id);
    // Implement rescheduling logic
  };

  const handleCancelSession = (session: Session) => {
    console.log('Cancel session:', session.id);
    // Implement cancellation logic
  };

  const handleViewNotes = (session: Session) => {
    console.log('View session notes:', session.id);
    // Implement notes viewing logic
  };

  const handleQuickBooking = () => {
    setIsQuickBookingOpen(true);
  };

  const handleConfirmQuickBooking = (bookingData: any) => {
    console.log('Quick booking confirmed:', bookingData);
    // Here you would typically send the booking data to your backend
  };

  const handleCloseQuickBooking = () => {
    setIsQuickBookingOpen(false);
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
                    onViewNotes={handleViewNotes}
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
                    onViewNotes={session.status === 'completed' ? handleViewNotes : undefined}
                  />
                ))}
              </div>
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

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={handleCloseQuickBooking}
        onConfirmBooking={handleConfirmQuickBooking}
        counselors={dummyCounselors}
      />
    </div>
  );
}
