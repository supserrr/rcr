/**
 * Jitsi JaaS JWT generation utility
 * 
 * Generates JSON Web Tokens (JWTs) for Jitsi as a Service (JaaS) authentication.
 * JWTs are required for authenticated access to JaaS meetings.
 */

import jwt from 'jsonwebtoken';
import { env } from '../../src/env';
import { getJitsiConfig } from './config';

/**
 * JWT header structure for Jitsi JaaS
 */
interface JitsiJWTHeader {
  alg: 'RS256';
  kid: string;
  typ: 'JWT';
}

/**
 * JWT payload structure for Jitsi JaaS
 */
interface JitsiJWTPayload {
  aud: 'jitsi';
  context: {
    user: {
      id: string;
      name: string;
      avatar?: string;
      email?: string;
      moderator: 'true' | 'false';
    };
    features?: {
      livestreaming?: 'true' | 'false';
      recording?: 'true' | 'false';
      moderation?: 'true' | 'false';
    };
  };
  exp: number;
  iss: 'chat';
  nbf: number;
  room: string;
  sub: string;
}

/**
 * Options for generating a Jitsi JWT
 */
export interface GenerateJitsiJWTOptions {
  /** User ID (unique identifier) */
  userId: string;
  /** User display name */
  userName: string;
  /** User email (optional) */
  userEmail?: string;
  /** User avatar URL (optional) */
  userAvatar?: string;
  /** Whether the user is a moderator */
  isModerator?: boolean;
  /** Room name (use "*" for all rooms) */
  roomName: string;
  /** JWT expiration time in seconds (default: 1 hour) */
  expirationSeconds?: number;
  /** Features to enable */
  features?: {
    livestreaming?: boolean;
    recording?: boolean;
    moderation?: boolean;
  };
}

/**
 * Generate a JWT token for Jitsi JaaS authentication
 * 
 * @param options - JWT generation options
 * @returns Signed JWT token string
 * @throws Error if private key is not configured or JWT generation fails
 */
export function generateJitsiJWT(options: GenerateJitsiJWTOptions): string {
  const config = getJitsiConfig();
  
  // Only generate JWT for JaaS deployments
  if (!config.isJaaS) {
    throw new Error('JWT generation is only required for JaaS deployments');
  }

  if (!config.appId) {
    throw new Error('JaaS App ID is required for JWT generation');
  }

  const privateKey = env.JITSI_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('JITSI_PRIVATE_KEY environment variable is not set. JWT generation requires a private key.');
  }

  // Format the App ID with vpaas-magic-cookie prefix
  const fullAppId = config.appId.startsWith('vpaas-magic-cookie-')
    ? config.appId
    : `vpaas-magic-cookie-${config.appId}`;

  // Generate key ID (kid) - format: vpaas-magic-cookie-{appId}/{keyId}
  // If JITSI_KEY_ID is set, use it; otherwise use just the App ID
  // The key ID should match the ID of the key uploaded to JaaS dashboard
  const keyId = env.JITSI_KEY_ID;
  const kid = keyId ? `${fullAppId}/${keyId}` : fullAppId;

  // Calculate timestamps
  const now = Math.floor(Date.now() / 1000);
  const expirationSeconds = options.expirationSeconds || 3600; // Default: 1 hour
  const exp = now + expirationSeconds;
  const nbf = now - 60; // Not before: 1 minute ago (allows for clock skew)

  // Format room name
  const roomName = options.roomName === '*' 
    ? '*' 
    : options.roomName.startsWith(fullAppId)
      ? options.roomName
      : `${fullAppId}/${options.roomName}`;

  // Build JWT header
  const header: JitsiJWTHeader = {
    alg: 'RS256',
    kid,
    typ: 'JWT',
  };

  // Build JWT payload
  const payload: JitsiJWTPayload = {
    aud: 'jitsi',
    context: {
      user: {
        id: options.userId,
        name: options.userName,
        avatar: options.userAvatar,
        email: options.userEmail,
        moderator: options.isModerator ? 'true' : 'false',
      },
      features: options.features
        ? {
            livestreaming: options.features.livestreaming ? 'true' : 'false',
            recording: options.features.recording ? 'true' : 'false',
            moderation: options.features.moderation ? 'true' : 'false',
          }
        : undefined,
    },
    exp,
    iss: 'chat',
    nbf,
    room: roomName,
    sub: fullAppId,
  };

  // Sign the JWT
  try {
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header,
    });

    return token;
  } catch (error) {
    throw new Error(
      `Failed to generate Jitsi JWT: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate Jitsi configuration for JWT generation
 * 
 * @returns True if JWT generation is properly configured
 */
export function isJitsiJWTConfigured(): boolean {
  try {
    const config = getJitsiConfig();
    return config.isJaaS && !!config.appId && !!env.JITSI_PRIVATE_KEY;
  } catch {
    return false;
  }
}

