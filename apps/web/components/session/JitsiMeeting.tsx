'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { getJitsiConfig, formatRoomName, getJitsiExternalApiUrl } from '../../lib/jitsi/config';
import { isJitsiJWTConfigured } from '../../lib/jitsi/jwt';

/**
 * Global script loading state to prevent multiple concurrent loads
 */
let scriptLoadPromise: Promise<any> | null = null;
let scriptLoadState: 'loading' | 'loaded' | 'error' | 'rate-limited' = 'loaded';
let retryCount = 0;
const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const RATE_LIMIT_RETRY_DELAY = 10000; // 10 seconds for rate limit errors
const MAX_RETRY_DELAY = 30000; // 30 seconds maximum delay

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
  /** User ID for JWT generation (required for JaaS) */
  userId?: string;
  /** Whether the user is a moderator (default: false) */
  isModerator?: boolean;
  /** User avatar URL (optional) */
  userAvatar?: string;
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
 * 
 * @remarks
 * **Expected Console Behavior:**
 * - Permission denied errors (`gum.permission_denied`) are normal when:
 *   - The prejoin page is displayed and permissions haven't been granted yet
 *   - The browser is blocking automatic device access (common in Electron/Cursor)
 *   - Users need to explicitly grant permissions via the prejoin page
 * - Amplitude analytics errors (`ERR_NAME_NOT_RESOLVED`) are non-critical network
 *   errors that don't affect meeting functionality
 * - These errors don't indicate a problem - the prejoin page will handle
 *   permission requests when users click "Join"
 */
export function JitsiMeeting({
  roomName,
  displayName,
  email,
  userId,
  isModerator = false,
  userAvatar,
  sessionType = 'video',
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
  config = {}
}: JitsiMeetingProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const currentRoomNameRef = useRef<string | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const hideLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({
    onMeetingEnd,
    onParticipantJoined,
    onParticipantLeft,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onMeetingEnd,
      onParticipantJoined,
      onParticipantLeft,
    };
  }, [onMeetingEnd, onParticipantJoined, onParticipantLeft]);

  // Store config in ref to avoid dependency issues
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // Get Jitsi configuration
    const jitsiConfig = getJitsiConfig();
    const formattedRoomName = formatRoomName(roomName);
    const externalApiUrl = getJitsiExternalApiUrl();

    // Load Jitsi Meet external API script with global caching and retry logic
    const loadJitsiScript = async (attempt: number = 0): Promise<any> => {
      // If already loaded, return immediately
      if ((window as any).JitsiMeetExternalAPI) {
        scriptLoadState = 'loaded';
        retryCount = 0;
        return (window as any).JitsiMeetExternalAPI;
      }

      // If rate-limited, wait before allowing retry
      if (scriptLoadState === 'rate-limited' && attempt === 0) {
        const errorMessage = 'The video service is currently rate-limited. Please wait a moment and try again.';
        throw new Error(errorMessage);
      }

      // If currently loading, return existing promise
      if (scriptLoadPromise && scriptLoadState === 'loading') {
        return scriptLoadPromise;
      }

      // Check if script tag already exists in DOM
      const existingScript = document.querySelector(`script[src="${externalApiUrl}"]`);
      if (existingScript) {
        // Script is loading, wait for it
        scriptLoadState = 'loading';
        scriptLoadPromise = new Promise((resolve, reject) => {
          existingScript.addEventListener('load', () => {
            // Wait a small amount of time for the script to fully initialize
            setTimeout(() => {
              if ((window as any).JitsiMeetExternalAPI) {
                scriptLoadState = 'loaded';
                retryCount = 0;
                resolve((window as any).JitsiMeetExternalAPI);
              } else {
                scriptLoadState = 'error';
                reject(new Error('Jitsi API not available after script load'));
              }
            }, 100);
          });
          existingScript.addEventListener('error', () => {
            scriptLoadState = 'error';
            reject(new Error('Failed to load Jitsi script'));
          });
        });
        return scriptLoadPromise;
      }

      // Start new script load
      scriptLoadState = 'loading';
      scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = externalApiUrl;
        script.async = true;
        script.id = `jitsi-external-api-${Date.now()}`;
        
        script.onload = () => {
          // Wait a small amount of time for the script to fully initialize
          // This ensures JitsiMeetExternalAPI is available and ready to use
          setTimeout(() => {
            if ((window as any).JitsiMeetExternalAPI) {
              scriptLoadState = 'loaded';
              retryCount = 0;
              resolve((window as any).JitsiMeetExternalAPI);
            } else {
              scriptLoadState = 'error';
              reject(new Error('Jitsi API not available after script load'));
            }
          }, 100);
        };
        
        script.onerror = () => {
          // Check if this is likely a rate limit error
          // For 8x8.vc (JaaS), errors are very likely to be rate limits (429 errors)
          // We can't directly access HTTP status from script.onerror, but we can infer
          // For JaaS, assume rate limits on any error, especially after first attempt
          const isJaaS = externalApiUrl.includes('8x8.vc');
          // For JaaS, treat errors as rate limits (429 is common)
          // For non-JaaS, only treat as rate limit if we've already detected it or on retries
          const isRateLimit = isJaaS || (attempt > 0 || scriptLoadState === 'rate-limited');
          
          // Remove failed script tag
          script.remove();
          
          // Check if we should retry
          if (attempt < MAX_RETRIES) {
            let delay: number;
            
            if (isRateLimit) {
              // Rate limit detected - use longer backoff with jitter
              scriptLoadState = 'rate-limited';
              const baseDelay = isJaaS 
                ? RATE_LIMIT_RETRY_DELAY * Math.pow(2, attempt)
                : INITIAL_RETRY_DELAY * Math.pow(2, attempt);
              // Add jitter (random 0-30% of delay) to prevent thundering herd
              const jitter = baseDelay * 0.3 * Math.random();
              delay = Math.min(baseDelay + jitter, MAX_RETRY_DELAY);
              
              console.warn(
                `Jitsi script load rate-limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}). ` +
                `Waiting ${Math.round(delay / 1000)} seconds before retry...`
              );
            } else {
              // Regular error - exponential backoff with jitter
              scriptLoadState = 'error';
              const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
              const jitter = baseDelay * 0.2 * Math.random();
              delay = Math.min(baseDelay + jitter, MAX_RETRY_DELAY);
              
              console.warn(
                `Jitsi script load failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}). ` +
                `Retrying in ${Math.round(delay / 1000)} seconds...`
              );
            }
            
            scriptLoadPromise = null;
            
            // Retry after delay
            setTimeout(async () => {
              try {
                const result = await loadJitsiScript(attempt + 1);
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
            }, delay);
          } else {
            // Max retries reached
            // Check if this was a rate-limited scenario (JaaS or state indicates rate limit)
            const wasRateLimited = isJaaS || scriptLoadState === 'rate-limited';
            scriptLoadState = wasRateLimited ? 'rate-limited' : 'error';
            scriptLoadPromise = null;
            const errorMessage = wasRateLimited
              ? 'The video conferencing service is experiencing high demand. Please wait a few minutes and try again, or refresh the page.'
              : 'Unable to load video conferencing service. The service may be temporarily unavailable. Please wait a moment and try again.';
            reject(new Error(errorMessage));
          }
        };

        document.body.appendChild(script);
      });

      return scriptLoadPromise;
    };

    /**
     * Fetch JWT token from API for JaaS authentication
     */
    const fetchJWT = async (): Promise<string | null> => {
      // Only fetch JWT for JaaS deployments
      if (!jitsiConfig.isJaaS || !isJitsiJWTConfigured()) {
        return null;
      }

      // User ID is required for JWT generation
      if (!userId) {
        console.warn('[JitsiMeeting] User ID not provided, JWT will not be generated');
        return null;
      }

      try {
        const response = await fetch('/api/jitsi/jwt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            userName: displayName,
            userEmail: email,
            userAvatar,
            isModerator,
            roomName: formattedRoomName,
            expirationSeconds: 3600, // 1 hour
            features: {
              livestreaming: false,
              recording: false,
              moderation: isModerator,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[JitsiMeeting] Failed to generate JWT:', errorData.error || 'Unknown error');
          return null;
        }

        const data = await response.json();
        return data.token || null;
      } catch (error) {
        console.warn('[JitsiMeeting] Error fetching JWT:', error);
        return null;
      }
    };

    const initializeJitsi = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const JitsiMeetExternalAPI = await loadJitsiScript(0);

        if (!jitsiContainerRef.current) {
          throw new Error('Jitsi container not found');
        }

        // Fetch JWT token if JaaS is configured
        const jwtToken = await fetchJWT();

        // Build config objects inside effect to avoid dependency issues
        const configOverwrite = {
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
          // Permission handling - don't fail if permissions are denied
          // Users can grant permissions on the prejoin page
          requireDisplayName: false,
          enableLayerSuspension: true,
          // Disable analytics to prevent Amplitude errors
          disableThirdPartyRequests: true,
          analytics: {
            disabled: true,
          },
          // Better error handling for permissions
          constraints: {
            video: {
              height: { ideal: 720, max: 720, min: 180 },
              width: { ideal: 1280, max: 1280, min: 320 },
              frameRate: { max: 30 },
            },
            audio: {
              autoGainControl: true,
              echoCancellation: true,
              noiseSuppression: true,
            },
          },
          ...configRef.current?.configOverwrite,
        };

        const interfaceConfigOverwrite = {
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
          ...configRef.current?.interfaceConfigOverwrite,
        };

        const options: any = {
          roomName: formattedRoomName,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
            email: email || undefined,
          },
          configOverwrite,
          interfaceConfigOverwrite,
          ...(configRef.current && typeof configRef.current === 'object' && !configRef.current.configOverwrite && !configRef.current.interfaceConfigOverwrite ? configRef.current : {}),
        };

        // Add JWT token if available (required for JaaS authentication)
        if (jwtToken) {
          options.jwt = jwtToken;
        }

        const api = new (JitsiMeetExternalAPI as any)(jitsiConfig.domain, options);
        jitsiApiRef.current = api;

        // Hide loading overlay when interface is ready
        // We use multiple strategies to ensure the prejoin page is visible
        let loadingHidden = false;

        const hideLoading = () => {
          if (!loadingHidden) {
            loadingHidden = true;
            setIsLoading(false);
            if (hideLoadingTimeoutRef.current) {
              clearTimeout(hideLoadingTimeoutRef.current);
              hideLoadingTimeoutRef.current = null;
            }
          }
        };

        // Strategy 1: Hide after iframe loads (check if iframe exists in container)
        const checkIframeLoaded = () => {
          if (jitsiContainerRef.current) {
            const iframe = jitsiContainerRef.current.querySelector('iframe');
            if (iframe) {
              // Iframe exists, hide loading after a short delay to let it render
              setTimeout(hideLoading, 500);
              return true;
            }
          }
          return false;
        };

        // Check immediately and with a short delay
        if (!checkIframeLoaded()) {
          setTimeout(() => {
            if (!loadingHidden) {
              checkIframeLoaded();
            }
          }, 100);
        }

        // Strategy 2: Fallback timeout (reduced to 1 second for faster UX)
        hideLoadingTimeoutRef.current = setTimeout(() => {
          if (!loadingHidden) {
            hideLoading();
          }
        }, 1000);

        // Event listeners
        api.on('videoConferenceJoined', () => {
          hideLoading();
        });

        api.on('participantJoined', (event: any) => {
          callbacksRef.current.onParticipantJoined?.(event);
        });

        api.on('participantLeft', (event: any) => {
          callbacksRef.current.onParticipantLeft?.(event);
        });

        api.on('readyToClose', () => {
          callbacksRef.current.onMeetingEnd?.();
        });

        api.on('videoConferenceLeft', () => {
          callbacksRef.current.onMeetingEnd?.();
        });

        // Handle permission errors gracefully (suppressed by console filter)
        api.on('deviceListChanged', () => {
          // Device list changes are handled internally by Jitsi
        });

        // Handle track creation errors (permission denied, etc.) - suppressed by console filter
        api.on('trackAdded', () => {
          // Track added events are handled internally by Jitsi
        });

        api.on('trackRemoved', () => {
          // Track removed events are handled internally by Jitsi
        });

        // Handle errors that might occur during initialization
        api.on('error', (error: any) => {
          // Errors are filtered by console filter for non-critical issues
          // Only log truly critical errors that need attention
          if (error && typeof error === 'object') {
            const errorMessage = error.message || String(error);
            // Only show critical errors, not permission warnings or analytics errors
            const isCritical = 
              !errorMessage.includes('permission') &&
              !errorMessage.includes('gum.permission_denied') &&
              !errorMessage.includes('amplitude') &&
              !errorMessage.includes('analytics');
            
            if (isCritical && process.env.NODE_ENV === 'development') {
              console.error('[Jitsi] Critical error:', error);
            }
          }
        });

        // Start with audio-only if specified
        // Note: This should be done after joining, not before
        // The prejoin page will handle initial device access

      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load video conferencing';
        
        // Provide more helpful error messages
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('high demand')) {
          userFriendlyMessage = 'The video conferencing service is temporarily unavailable due to high demand. Please wait a few minutes and try again, or refresh the page.';
        } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('rate-limited')) {
          userFriendlyMessage = 'The video service is experiencing high traffic. Please wait a few minutes before trying again. You can refresh the page to retry.';
        } else if (errorMessage.includes('experiencing high demand')) {
          userFriendlyMessage = errorMessage; // Use the message from rate limit handler
        }
        
        setError(userFriendlyMessage);
        setIsLoading(false);
        isInitializingRef.current = false;
        
        // Reset script load state on error so it can retry on next attempt
        // But keep rate-limited state for a bit longer to prevent immediate retries
        if (scriptLoadState === 'error') {
          scriptLoadState = 'loaded';
          scriptLoadPromise = null;
          retryCount = 0;
        } else if (scriptLoadState === 'rate-limited') {
          // For rate limits, wait a bit before resetting to allow cooldown
          setTimeout(() => {
            if (scriptLoadState === 'rate-limited') {
              scriptLoadState = 'loaded';
              scriptLoadPromise = null;
              retryCount = 0;
            }
          }, 60000); // Wait 1 minute before allowing retry
        }
      }
    };

    // Only initialize if room name changed or we don't have an API instance, and not already initializing
    if (
      !isInitializingRef.current &&
      (!jitsiApiRef.current || currentRoomNameRef.current !== formattedRoomName)
    ) {
      // Clean up existing instance if room name changed
      if (jitsiApiRef.current && currentRoomNameRef.current !== formattedRoomName) {
        try {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        } catch (err) {
          console.warn('Error disposing previous Jitsi API:', err);
        }
      }
      currentRoomNameRef.current = formattedRoomName;
      isInitializingRef.current = true;
      initializeJitsi().finally(() => {
        isInitializingRef.current = false;
      });
    }

    // Cleanup function
    return () => {
      // Clear any pending timeout
      if (hideLoadingTimeoutRef.current) {
        clearTimeout(hideLoadingTimeoutRef.current);
        hideLoadingTimeoutRef.current = null;
      }
      
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        } catch (err) {
          console.warn('Error disposing Jitsi API:', err);
        }
      }
    };
    // Only re-run when core props change, not when callbacks or config change
    // Also re-run when retryKey changes to trigger retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, displayName, email, userId, isModerator, userAvatar, sessionType, retryKey]);

  const handleRetry = () => {
    // Check if we're still rate-limited
    if (scriptLoadState === 'rate-limited') {
      setError('Please wait a moment before retrying. The service is still experiencing high demand.');
      return;
    }
    
    // Reset error state and trigger re-initialization
    setError(null);
    setIsLoading(true);
    setRetryKey(prev => prev + 1);
    // Reset global script load state to allow retry
    scriptLoadState = 'loaded';
    scriptLoadPromise = null;
    retryCount = 0;
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <VideoOff className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Unable to Load Meeting</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} variant="default">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
              </Button>
            </div>
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

