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
import { createClient } from '../../../../../../lib/supabase/client';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

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
            // Try admin API first, fallback to direct profile query if not admin
            let participant: AdminUser | null = null;
            try {
              participant = await AdminApi.getUser(participantId);
            } catch (adminError) {
              // If admin access fails, query profiles table directly
              console.log(`[SessionRoom] Admin API failed for ${participantId}, using direct profile query`);
              const supabase = createClient();
              if (supabase) {
                // Try querying through sessions table first (counselors can see patients they have sessions with)
                // This leverages RLS policies that allow counselors to access patient profiles via sessions
                let profile = null;
                let profileError = null;
                
                // First, try to query the profile through a session join if we're a counselor viewing a patient
                if (user?.role === 'counselor' && sessionData?.patientId === participantId) {
                  console.log(`[SessionRoom] Trying to fetch patient profile via session relationship`);
                  
                  // Try different join syntaxes
                  const joinQueries = [
                    // Try with explicit foreign key name
                    supabase
                      .from('sessions')
                      .select(`
                        patient_id,
                        patient:profiles!sessions_patient_id_fkey (
                          id,
                          full_name,
                          email,
                          role,
                          avatar_url,
                          metadata
                        )
                      `)
                      .eq('id', sessionId)
                      .single(),
                    // Try with implicit join
                    supabase
                      .from('sessions')
                      .select(`
                        patient_id,
                        profiles!inner (
                          id,
                          full_name,
                          email,
                          role,
                          avatar_url,
                          metadata
                        )
                      `)
                      .eq('id', sessionId)
                      .eq('profiles.id', participantId)
                      .single(),
                  ];
                  
                  for (let i = 0; i < joinQueries.length; i++) {
                    try {
                      const response = await joinQueries[i];
                      const sessionProfile = (response as any)?.data;
                      const sessionError = (response as any)?.error;
                      
                      if (!sessionError && sessionProfile) {
                        // Try different ways to access the profile
                        const foundProfile = 
                          (sessionProfile as any).patient ||
                          (sessionProfile as any).profiles ||
                          (Array.isArray((sessionProfile as any).profiles) ? (sessionProfile as any).profiles[0] : undefined);
                        
                        if (foundProfile) {
                          profile = foundProfile;
                          console.log(`[SessionRoom] ✅ Found profile via session join (method ${i + 1}):`, profile);
                          break;
                        }
                      } else {
                        console.warn(`[SessionRoom] Join query ${i + 1} failed:`, sessionError);
                      }
                    } catch (err) {
                      console.warn(`[SessionRoom] Join query ${i + 1} threw error:`, err);
                    }
                  }
                }
                
                // If that didn't work, try direct profile query
                // Use the exact same approach as sessions list page
                if (!profile) {
                  console.log(`[SessionRoom] Trying direct profile query for ${participantId} (same as sessions list page)`);
                  
                  // Use the exact same query pattern as the sessions list page primary fetch
                  const { data: directProfile, error: directError } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', [participantId])  // Use .in() instead of .eq() like the sessions list page
                    .eq('role', user?.role === 'patient' ? 'counselor' : 'patient');
                  
                  if (directError) {
                    console.error('[SessionRoom] Direct query error:', directError);
                    console.error('[SessionRoom] Error details:', {
                      message: directError.message,
                      code: directError.code,
                      details: directError.details,
                      hint: directError.hint,
                    });
                    profileError = directError;
                  } else if (directProfile && directProfile.length > 0) {
                    profile = directProfile[0];
                    console.log(`[SessionRoom] ✅ Found profile via direct query with role filter`);
                  } else {
                    console.warn(`[SessionRoom] Direct query with role filter returned no results`);
                    
                    // Try without role filter as last resort
                    console.log(`[SessionRoom] Trying query without role filter`);
                    const { data: noRoleProfile, error: noRoleError } = await supabase
                      .from('profiles')
                      .select('*')
                      .in('id', [participantId]);
                    
                    if (!noRoleError && noRoleProfile && noRoleProfile.length > 0) {
                      profile = noRoleProfile[0];
                      console.log(`[SessionRoom] ✅ Found profile via query without role filter`);
                    } else {
                      console.warn(`[SessionRoom] Query without role filter also returned no results:`, noRoleError);
                    }
                  }
                }
                
                if (profile) {
                  console.log(`[SessionRoom] Profile found for ${participantId}:`, {
                    id: profile.id,
                    full_name: profile.full_name,
                    email: profile.email,
                    role: profile.role,
                    hasMetadata: !!profile.metadata,
                    metadata: profile.metadata,
                  });
                  
                  const metadata = (profile.metadata || {}) as Record<string, unknown>;
                  const fullName = 
                    (profile.full_name && typeof profile.full_name === 'string' ? profile.full_name.trim() : undefined) ||
                    (profile.fullName && typeof profile.fullName === 'string' ? profile.fullName.trim() : undefined) ||
                    (profile.name && typeof profile.name === 'string' ? profile.name.trim() : undefined) ||
                    (typeof metadata.name === 'string' ? metadata.name.trim() : undefined) ||
                    (typeof metadata.full_name === 'string' ? metadata.full_name.trim() : undefined) ||
                    (typeof metadata.fullName === 'string' ? metadata.fullName.trim() : undefined) ||
                    (profile.email && typeof profile.email === 'string' ? profile.email.split('@')[0].trim() : undefined) ||
                    'Participant';
                  
                  console.log(`[SessionRoom] Extracted name: "${fullName}"`);
                  
                  participant = {
                    id: profile.id,
                    email: profile.email || (typeof metadata.email === 'string' ? metadata.email : ''),
                    fullName: fullName,
                    role: (profile.role === 'counselor' || profile.role === 'patient' ? profile.role : 'patient') as 'counselor' | 'patient',
                    isVerified: false,
                    createdAt: profile.created_at || '',
                    avatarUrl: profile.avatar_url || (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined),
                  } as AdminUser;
                  
                  console.log(`[SessionRoom] Created participant object:`, {
                    id: participant.id,
                    fullName: participant.fullName,
                    email: participant.email,
                    role: participant.role,
                  });
                } else {
                  console.warn(`[SessionRoom] Profile not found for ${participantId} (query returned null/undefined)`);
                }
              } else {
                console.error('[SessionRoom] Supabase client not available');
              }
            }
            
            if (participant) {
              console.log(`[SessionRoom] ✅ Setting participant state:`, {
                id: participant.id,
                fullName: participant.fullName,
                email: participant.email,
                role: participant.role,
              });
              setOtherParticipant(participant);
              console.log(`[SessionRoom] ✅ Participant state set successfully`);
            } else {
              console.warn(`[SessionRoom] ❌ Could not load participant ${participantId}, using fallback`);
              // Set a minimal participant object so the UI doesn't break
              const fallbackParticipant = {
                id: participantId,
                email: '',
                fullName: user?.role === 'patient' ? 'Counselor' : 'Patient',
                role: (user?.role === 'patient' ? 'counselor' : 'patient') as 'counselor' | 'patient',
                isVerified: false,
                createdAt: '',
              } as AdminUser;
              console.log(`[SessionRoom] ⚠️ Setting fallback participant:`, fallbackParticipant);
              setOtherParticipant(fallbackParticipant);
            }
          } catch (error) {
            console.error('[SessionRoom] Error loading participant:', error);
            // Set a fallback participant so the UI doesn't break
            setOtherParticipant({
              id: participantId,
              email: '',
              fullName: user?.role === 'patient' ? 'Counselor' : 'Patient',
              role: (user?.role === 'patient' ? 'counselor' : 'patient') as 'counselor' | 'patient',
              isVerified: false,
              createdAt: '',
            } as AdminUser);
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
        <Spinner variant="bars" size={32} className="text-primary" />
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
          <Button onClick={() => router.push(`/dashboard/${user?.role}/sessions`)}>
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
    router.push(`/dashboard/counselor/sessions`);
  };

  // In-meeting view (full screen, exits dashboard layout)
  if (isInMeeting && !sessionEnded) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <JitsiMeeting
          roomName={`session-${session.id}`}
          displayName={user?.name || 'Participant'}
          email={user?.email}
          sessionType={(session.type === 'chat' || session.type === 'in-person' ? 'video' : (session.type === 'audio' ? 'audio' : 'video')) as 'audio' | 'video' | undefined}
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
          onClick={() => router.push(`/dashboard/counselor/sessions`)}
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
              Thank you for attending the session with {otherParticipant?.fullName || otherParticipant?.email || 'your patient'}
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
        description={`Your ${session.type} session with ${otherParticipant?.fullName || otherParticipant?.email || 'your patient'}`}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/counselor/sessions`)}
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

