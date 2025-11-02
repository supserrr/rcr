'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { SessionCard } from '../../../../components/dashboard/shared/SessionCard';
import { CounselorRescheduleModal } from '../../../../components/session/CounselorRescheduleModal';
import { CancelSessionModal } from '../../../../components/session/CancelSessionModal';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { dummySessions, dummyCounselors, dummyPatients } from '../../../../lib/dummy-data';
import { Session } from '../../../../lib/types';

export default function CounselorSessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const currentCounselor = dummyCounselors[0]; // Dr. Marie Claire

  const upcomingSessions = dummySessions.filter(session => 
    session.counselorId === currentCounselor?.id && 
    session.status === 'scheduled' &&
    new Date(session.date) > new Date()
  );

  const pastSessions = dummySessions.filter(session => 
    session.counselorId === currentCounselor?.id && 
    (session.status === 'completed' || session.status === 'cancelled')
  );

  const allSessions = dummySessions.filter(session => 
    session.counselorId === currentCounselor?.id
  );

  const getPatientName = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.avatar;
  };

  const handleJoinSession = (session: Session) => {
    // Navigate to the session room
    router.push(`/dashboard/counselor/sessions/session/${session.id}`);
  };

  const handleAcceptSession = (session: Session) => {
    console.log('Accept session:', session.id);
  };

  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (sessionId: string, newDate: Date, newTime: string, newDuration: number, notes?: string) => {
    try {
      // In a real app, this would make an API call to update the session
      console.log('Rescheduling session:', {
        sessionId,
        newDate,
        newTime,
        newDuration,
        notes
      });
      
      // Update the session in dummy data (for demo purposes)
      const sessionIndex = dummySessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        dummySessions[sessionIndex] = {
          ...dummySessions[sessionIndex],
          date: newDate,
          time: newTime,
          duration: newDuration,
          notes: notes ? `${dummySessions[sessionIndex]?.notes || ''}\n\nReschedule Note: ${notes}` : dummySessions[sessionIndex]?.notes || ''
        } as Session;
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Session rescheduled successfully! Patient has been notified.');
      
    } catch (error) {
      console.error('Error rescheduling session:', error);
      alert('Failed to reschedule session. Please try again.');
    }
  };

  const handleAddNotes = (session: Session) => {
    console.log('Add notes to session:', session.id);
  };

  const handleScheduleSession = () => {
    setIsScheduleOpen(true);
  };

  const handleConfirmSchedule = async (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => {
    try {
      // In a real app, this would make an API call to create the session
      console.log('Scheduling session:', sessionData);
      
      // Create new session in dummy data (for demo purposes)
      const newSession: Session = {
        id: (dummySessions.length + 1).toString(),
        patientId: sessionData.patientId,
        counselorId: currentCounselor?.id || '2',
        date: sessionData.date,
        time: sessionData.time,
        duration: sessionData.duration,
        status: 'scheduled',
        type: sessionData.sessionType,
        notes: sessionData.notes || ''
      };
      
      dummySessions.push(newSession);
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Session scheduled successfully! Patient has been notified.');
      
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Failed to schedule session. Please try again.');
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
      if (sessionIndex !== -1) {
        dummySessions[sessionIndex] = {
          ...dummySessions[sessionIndex],
          status: 'cancelled',
          notes: `${dummySessions[sessionIndex]?.notes || ''}\n\nCancellation: ${reason}${notes ? ` - ${notes}` : ''}`
        } as Session;
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert('Session cancelled successfully! Patient has been notified.');
      
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert('Failed to cancel session. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="My Sessions"
        description="Manage your counseling sessions and view session history"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Next session in 2 hours
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'cancelled').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Sessions</h2>
        </div>
        <Button onClick={handleScheduleSession} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Session
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
                    patientName={getPatientName(session.patientId)}
                    counselorName="Dr. Marie Claire"
                    patientAvatar={getPatientAvatar(session.patientId)}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
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
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
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
                    patientName={getPatientName(session.patientId)}
                    counselorName="Dr. Marie Claire"
                    patientAvatar={getPatientAvatar(session.patientId)}
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
                  <Button onClick={handleScheduleSession} variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Another Session
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      patientName={getPatientName(session.patientId)}
                      counselorName="Dr. Marie Claire"
                      patientAvatar={getPatientAvatar(session.patientId)}
                      onJoin={session.status === 'scheduled' ? handleJoinSession : undefined}
                      onReschedule={session.status === 'scheduled' ? handleRescheduleSession : undefined}
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
                  Start by scheduling your first session
                </p>
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reschedule Modal */}
      <CounselorRescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
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
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
        userRole="counselor"
        onCancel={handleConfirmCancel}
      />

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        counselorId={currentCounselor?.id || '2'}
        counselorName={currentCounselor?.name || 'Dr. Marie Claire'}
        patients={dummyPatients.map(patient => ({
          id: patient.id,
          name: patient.name,
          avatar: patient.avatar
        }))}
        onSchedule={handleConfirmSchedule}
      />
    </div>
  );
}
