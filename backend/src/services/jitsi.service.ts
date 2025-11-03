/**
 * Jitsi Meet service
 * 
 * Handles Jitsi Meet room generation and management
 * Supports both JaaS (8x8.vc) and custom domain deployments
 */

import { config } from '../config';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';
import type {
  JitsiMeetingConfig,
  JaaSMeetingConfig,
  LibJitsiMeetConfig,
  JitsiRoomDetails,
} from '../types/jitsi.types';

/**
 * JWT payload for Jitsi Meet
 */
interface JitsiJWTPayload {
  iss: string; // App ID
  aud: string; // Domain
  exp: number; // Expiration timestamp
  nbf: number; // Not before timestamp
  room: string; // Room name
  sub: string; // User ID
  moderator?: boolean;
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * Generate a unique Jitsi room name
 */
function generateRoomName(sessionId: string): string {
  // Use session ID and timestamp to create a unique room name
  const timestamp = Date.now();
  const shortId = sessionId.substring(0, 8);
  return `rcr-${shortId}-${timestamp}`;
}

/**
 * Generate JWT token for Jitsi Meet JaaS
 * Note: This requires the jsonwebtoken package
 */
async function generateJWTToken(
  roomName: string,
  userId: string,
  userName: string,
  isModerator: boolean = false
): Promise<string | undefined> {
  try {
    const { jitsi } = config;

    if (!jitsi.appId || !jitsi.appSecret) {
      return undefined;
    }

    // Try to import jsonwebtoken (optional dependency)
    // Use dynamic import to avoid compile-time errors if package is not installed
    let jwtSign: ((payload: unknown, secret: string, options?: { algorithm: string }) => string) | null = null;
    try {
      // Use a type-safe dynamic import
      // @ts-expect-error - jsonwebtoken is an optional dependency
      const jsonwebtokenModule = await import('jsonwebtoken');
      if (jsonwebtokenModule && typeof jsonwebtokenModule.sign === 'function') {
        jwtSign = jsonwebtokenModule.sign.bind(jsonwebtokenModule);
      }
    } catch (error) {
      logInfo('jsonwebtoken not installed, JWT generation skipped', { error });
      return undefined;
    }

    if (!jwtSign) {
      logInfo('JWT sign function not available');
      return undefined;
    }

    const domain = jitsi.domain || '8x8.vc';
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour expiration

    const payload: JitsiJWTPayload = {
      iss: jitsi.appId,
      aud: domain,
      exp,
      nbf: now,
      room: roomName,
      sub: userId,
      moderator: isModerator,
      name: userName,
    };

    const token = jwtSign(payload, jitsi.appSecret, {
      algorithm: 'HS256',
    });

    logInfo('JWT token generated for Jitsi', { roomName, userId });
    return token;
  } catch (error) {
    logError('JWT token generation error', error);
    return undefined;
  }
}

/**
 * Create a Jitsi Meet room for a session
 * Returns configuration for React SDK integration by default
 * Can also return lib-jitsi-meet API configuration if requested
 */
export async function createJitsiRoom(
  sessionId: string,
  userId: string,
  userName: string,
  userEmail?: string,
  isModerator: boolean = false,
  apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet' = 'react-sdk'
): Promise<JitsiRoomDetails> {
  try {
    const { jitsi } = config;

    const roomName = generateRoomName(sessionId);
    const domain = jitsi.domain || '8x8.vc';
    const roomUrl = `https://${domain}/${roomName}`;

    // Check if using JaaS (8x8.vc) or custom domain
    const isJaaS = domain === '8x8.vc' || domain === 'stage.8x8.vc';

    if (isJaaS && !jitsi.appId) {
      logError('JaaS configuration missing', { domain, hasAppId: !!jitsi.appId });
      throw new AppError('Jitsi Meet JaaS requires appId configuration', 500);
    }

    // Generate JWT token if appId and appSecret are configured
    const jwt = await generateJWTToken(roomName, userId, userName, isModerator);

    if (isJaaS && jitsi.appId) {
      // If using lib-jitsi-meet API with JaaS
      if (apiType === 'lib-jitsi-meet') {
        const libConfig: LibJitsiMeetConfig = {
          connectionOptions: {
            hosts: {
              domain: `${jitsi.appId}.8x8.vc`,
            },
            serviceUrl: `https://${jitsi.appId}.8x8.vc/xmpp-websocket`,
            enableRemb: true,
            enableTcc: true,
            useStunTurn: true,
            enableIceRestart: true,
            enableLayerSuspension: true,
          },
          conferenceOptions: {
            startAudioMuted: false,
            startVideoMuted: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            openBridgeChannel: true,
            configOverwrite: {
              enableEmailInStats: false,
            },
            interfaceConfigOverwrite: {
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            },
          },
          localTracksOptions: {
            devices: ['audio', 'video'],
            resolution: 720,
          },
          roomName,
          jwt: jwt || undefined,
          userInfo: {
            displayName: userName,
            email: userEmail || undefined,
          },
        };

        const result: JitsiRoomDetails = {
          roomName,
          roomUrl,
          meetingId: roomName,
          config: libConfig,
          isJaaS: true,
          apiType,
        };

        logInfo('JaaS room created (lib-jitsi-meet)', {
          sessionId,
          roomName,
          userId,
          hasJWT: !!jwt,
        });
        return result;
      }

      // Return JaaS meeting configuration for React SDK
      const config: JaaSMeetingConfig = {
        appId: jitsi.appId,
        roomName,
        jwt: jwt || undefined,
        useStaging: domain === 'stage.8x8.vc',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: false,
          enableEmailInStats: false,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          VIDEO_LAYOUT_FIT: 'both',
          MOBILE_APP_PROMO: false,
          TILE_VIEW_MAX_COLUMNS: 5,
        },
        userInfo: {
          displayName: userName,
          email: userEmail || undefined,
        },
      };

      const result: JitsiRoomDetails = {
        roomName,
        roomUrl,
        meetingId: roomName,
        config,
        isJaaS: true,
        apiType,
      };

      logInfo('JaaS room created', { sessionId, roomName, userId, hasJWT: !!jwt, apiType });
      return result;
    } else {
      // Return custom domain Jitsi Meeting configuration
      const config: JitsiMeetingConfig = {
        domain,
        roomName,
        jwt: jwt || undefined,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: false,
          startScreenSharing: false,
          enableEmailInStats: false,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          VIDEO_LAYOUT_FIT: 'both',
          MOBILE_APP_PROMO: false,
          TILE_VIEW_MAX_COLUMNS: 5,
        },
        userInfo: {
          displayName: userName,
          email: userEmail || undefined,
        },
      };

      // If using lib-jitsi-meet API, return connection/conference configuration
      if (apiType === 'lib-jitsi-meet') {
        const libConfig: LibJitsiMeetConfig = {
          connectionOptions: {
            hosts: {
              domain,
            },
            serviceUrl: `https://${domain}/xmpp-websocket`,
            enableRemb: true,
            enableTcc: true,
            useStunTurn: true,
            enableIceRestart: true,
            enableLayerSuspension: true,
          },
          conferenceOptions: {
            startAudioMuted: false,
            startVideoMuted: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            openBridgeChannel: true,
            configOverwrite: {
              enableEmailInStats: false,
            },
            interfaceConfigOverwrite: {
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            },
          },
          localTracksOptions: {
            devices: ['audio', 'video'],
            resolution: 720,
          },
          roomName,
          jwt: jwt || undefined,
          userInfo: {
            displayName: userName,
            email: userEmail || undefined,
          },
        };

        const result: JitsiRoomDetails = {
          roomName,
          roomUrl,
          meetingId: roomName,
          config: libConfig,
          isJaaS: false,
          apiType,
        };

        logInfo('Custom domain Jitsi room created (lib-jitsi-meet)', {
          sessionId,
          roomName,
          userId,
          domain,
        });
        return result;
      }

      const result: JitsiRoomDetails = {
        roomName,
        roomUrl,
        meetingId: roomName,
        config,
        isJaaS: false,
        apiType,
      };

      logInfo('Custom domain Jitsi room created', { sessionId, roomName, userId, domain, apiType });
      return result;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Jitsi room creation error', error);
    throw new AppError('Failed to create Jitsi room', 500);
  }
}

/**
 * Generate JWT token for Jitsi Meet
 * This is a standalone function that can be called separately if needed
 */
export async function generateJitsiToken(
  roomName: string,
  userId: string,
  userName: string,
  isModerator: boolean = false
): Promise<string | undefined> {
  return generateJWTToken(roomName, userId, userName, isModerator);
}

/**
 * Get Jitsi room details
 * Note: This regenerates the room configuration.
 * In production, you should store room information in the database.
 */
export async function getJitsiRoom(
  sessionId: string,
  userId?: string,
  userName?: string
): Promise<JitsiRoomDetails | null> {
  try {
    // In a real implementation, you would:
    // 1. Query the database for stored room information
    // 2. Or regenerate the room URL based on session ID

    // For now, we'll regenerate the room
    // In production, store room information in the database
    if (!userId || !userName) {
      logError('Get Jitsi room requires userId and userName', { sessionId });
      return null;
    }

    return await createJitsiRoom(sessionId, userId, userName, undefined, false);
  } catch (error) {
    logError('Get Jitsi room error', error);
    return null;
  }
}

