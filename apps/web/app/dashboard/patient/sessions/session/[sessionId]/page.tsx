'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JitsiMeeting } from '../../../../../../components/session/JitsiMeeting';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Video, 
  Mic, 
  Clock,
  User,
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../../../../components/auth/AuthProvider';
import { SessionsApi, type Session } from '../../../../../../lib/api/sessions';
import { AdminApi, type AdminUser } from '../../../../../../lib/api/admin';
import { toast } from 'sonner';

/**
 * Session room page for video/audio counseling sessions.
 * 
 * This page provides a Jitsi meeting interface with
 * pre-session checks and post-session feedback.
 * Located under /dashboard/session/[sessionId] to inherit dashboard layout.
 */
export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<AdminUser | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const sessionData = await SessionsApi.getSession(sessionId);
        setSession(sessionData);

        // Load other participant (counselor for patient, patient for counselor)
        const participantId = user?.role === 'patient' 
          ? sessionData.counselorId 
          : sessionData.patientId;
        
        if (participantId) {
          try {
            const participant = await AdminApi.getUser(participantId);
            setOtherParticipant(participant);
          } catch (error) {
            console.error('Error loading participant:', error);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && user?.id) {
      loadSession();
    }
  }, [sessionId, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedCard className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The session you're looking for doesn't exist or has been cancelled.
          </p>
          <Button onClick={() => router.push(`/dashboard/patient/sessions`)}>
            Return to Sessions
          </Button>
        </AnimatedCard>
      </div>
    );
  }

  const handleJoinMeeting = () => {
    setIsInMeeting(true);
  };

  const handleMeetingEnd = () => {
    setIsInMeeting(false);
    setSessionEnded(true);
  };

  const handleCompleteFeedback = () => {
    // In production, save feedback
    router.push(`/dashboard/patient/sessions`);
  };

  // In-meeting view (full screen, exits dashboard layout)
  if (isInMeeting && !sessionEnded) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <JitsiMeeting
          roomName={`session-${session.id}`}
          displayName={user?.name || 'Participant'}
          email={user?.email}
          sessionType={session.type === 'chat' ? 'video' : session.type || 'video'}
          onMeetingEnd={handleMeetingEnd}
        />
      </div>
    );
  }

  // Post-session feedback (stays in dashboard layout)
  if (sessionEnded) {
    return (
      <div className="space-y-6">
        <AnimatedPageHeader
          title="Session Completed"
          description="Thank you for attending your counseling session"
        />
        
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/patient/sessions`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>

          <AnimatedCard className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Completed</h2>
            <p className="text-muted-foreground">
              Thank you for attending the session with {otherParticipant?.fullName || otherParticipant?.email || 'your counselor'}
            </p>
          </div>

          {/* Session Summary */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{session.duration}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{session.type}</p>
                <p className="text-xs text-muted-foreground">session type</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{new Date(session.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">date</p>
              </div>
            </div>
          </div>




        </AnimatedCard>
        </div>
      </div>
    );
  }

  // Pre-session lobby (stays in dashboard layout)
  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Join Session"
        description={`Your ${session.type} session with ${otherParticipant?.fullName || otherParticipant?.email || 'your counselor'}`}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/patient/sessions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>

        {/* Session Info */}
        <AnimatedCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Counseling Session</h1>
            <p className="text-muted-foreground">
              You're about to join a {session.type} session
            </p>
          </div>
          <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
            {session.status}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Session Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'patient' ? 'Counselor' : 'Patient'}
                </p>
                <p className="font-semibold">{otherParticipant?.fullName || otherParticipant?.email || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {new Date(session.date).toLocaleDateString()} at {session.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{session.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {session.type === 'audio' ? (
                  <Mic className="h-5 w-5 text-primary" />
                ) : (
                  <Video className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session Type</p>
                <p className="font-semibold capitalize">
                  {session.type}
                  {session.type === 'audio' && ' Only'}
                </p>
              </div>
            </div>
          </div>

          {/* Pre-session Checklist */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Before you join:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Find a quiet, private space for the session
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Check your microphone and camera/headphones
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Ensure stable internet connection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Have any notes or questions ready
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Join Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleJoinMeeting}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            {session.type === 'audio' ? (
              <Mic className="h-5 w-5 mr-2" />
            ) : (
              <Video className="h-5 w-5 mr-2" />
            )}
            Join Session
          </Button>
        </div>
      </AnimatedCard>

      {/* Privacy Notice */}
      <AnimatedCard className="p-4 bg-muted/30 border-primary/20">
        <div className="flex gap-3 text-sm">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Privacy & Confidentiality</p>
            <p>
              This session is private and confidential. The conversation is encrypted end-to-end.
              {user?.role === 'counselor' && ' Please ensure you maintain patient confidentiality at all times.'}
            </p>
          </div>
        </div>
      </AnimatedCard>
      </div>
    </div>
  );
}

