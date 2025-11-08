'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff,
  Monitor,
  Settings,
  MessageSquare,
  Users,
  MoreVertical
} from 'lucide-react';

/**
 * Props for the JitsiMeeting component.
 */
interface JitsiMeetingProps {
  /** Unique room name for the meeting */
  roomName: string;
  /** Display name of the participant */
  displayName: string;
  /** User email for Jitsi */
  email?: string;
  /** Session type - video or audio only */
  sessionType?: 'video' | 'audio';
  /** Callback when the meeting ends */
  onMeetingEnd?: () => void;
  /** Callback when participant joins */
  onParticipantJoined?: (participant: any) => void;
  /** Callback when participant leaves */
  onParticipantLeft?: (participant: any) => void;
  /** Custom configuration options */
  config?: any;
}

/**
 * JitsiMeeting component that embeds Jitsi video conferencing.
 * 
 * This component provides a full-featured video/audio conferencing interface
 * using Jitsi Meet. It supports both video and audio-only sessions with
 * customizable settings for healthcare counseling sessions.
 */
export function JitsiMeeting({
  roomName,
  displayName,
  email,
  sessionType = 'video',
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
  config = {}
}: JitsiMeetingProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize callback functions to prevent infinite re-renders
  const handleMeetingEnd = useCallback(() => {
    onMeetingEnd?.();
  }, [onMeetingEnd]);

  const handleParticipantJoined = useCallback((participant: any) => {
    onParticipantJoined?.(participant);
  }, [onParticipantJoined]);

  const handleParticipantLeft = useCallback((participant: any) => {
    onParticipantLeft?.(participant);
  }, [onParticipantLeft]);

  useEffect(() => {
    // Load Jitsi Meet external API script
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if ((window as any).JitsiMeetExternalAPI) {
          resolve((window as any).JitsiMeetExternalAPI);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://8x8.vc/vpaas-magic-cookie-f6d1c6c8a5c746ea991dc0f4b92e8b62/external_api.js';
        script.async = true;
        script.onload = () => resolve((window as any).JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const JitsiMeetExternalAPI = await loadJitsiScript();

        if (!jitsiContainerRef.current) {
          throw new Error('Jitsi container not found');
        }

        const domain = '8x8.vc';
        const options = {
          roomName: `vpaas-magic-cookie-f6d1c6c8a5c746ea991dc0f4b92e8b62/${roomName}`,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
            email: email || undefined,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: sessionType === 'audio',
            disableModeratorIndicator: false,
            prejoinPageEnabled: true,
            enableWelcomePage: false,
            enableClosePage: false,
            defaultLanguage: 'en',
            disableInviteFunctions: true,
            doNotStoreRoom: true,
            enableNoisyMicDetection: true,
            ...config.configOverwrite,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'stats',
              'tileview',
              'videobackgroundblur',
              'help',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
            MOBILE_APP_PROMO: false,
            ...config.interfaceConfigOverwrite,
          },
          ...config,
        };

        const api = new (JitsiMeetExternalAPI as any)(domain, options);
        setJitsiApi(api);

        // Event listeners
        api.on('videoConferenceJoined', (event: any) => {
          setIsLoading(false);
          console.log('Participant joined:', event);
        });

        api.on('participantJoined', (event: any) => {
          console.log('New participant joined:', event);
          handleParticipantJoined(event);
        });

        api.on('participantLeft', (event: any) => {
          console.log('Participant left:', event);
          handleParticipantLeft(event);
        });

        api.on('readyToClose', () => {
          console.log('Meeting ended');
          handleMeetingEnd();
        });

        api.on('videoConferenceLeft', () => {
          console.log('User left the meeting');
          handleMeetingEnd();
        });

        // Start with audio-only if specified
        if (sessionType === 'audio') {
          api.executeCommand('toggleVideo');
        }

      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video conferencing');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [roomName, displayName, email, sessionType, handleMeetingEnd, handleParticipantJoined, handleParticipantLeft]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <VideoOff className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Unable to Load Meeting</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Connecting to session...</h3>
              <p className="text-sm text-muted-foreground">
                {sessionType === 'audio' ? 'Audio-only mode' : 'Video conference mode'}
              </p>
            </div>
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
}

