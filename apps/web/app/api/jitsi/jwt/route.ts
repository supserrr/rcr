/**
 * API route for generating Jitsi JaaS JWT tokens
 * 
 * This is a server-side route that generates JWTs using the private key.
 * JWTs are required for authenticated access to Jitsi JaaS meetings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateJitsiJWT, type GenerateJitsiJWTOptions } from '@/lib/jitsi/jwt';
import { isJitsiJWTConfigured } from '@/lib/jitsi/jwt';

/**
 * POST /api/jitsi/jwt
 * 
 * Generates a JWT token for Jitsi JaaS authentication
 * 
 * Request body:
 * {
 *   userId: string;
 *   userName: string;
 *   userEmail?: string;
 *   userAvatar?: string;
 *   isModerator?: boolean;
 *   roomName: string;
 *   expirationSeconds?: number;
 *   features?: {
 *     livestreaming?: boolean;
 *     recording?: boolean;
 *     moderation?: boolean;
 *   };
 * }
 * 
 * Response:
 * {
 *   token: string;
 *   expiresAt: number; // Unix timestamp
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if JWT generation is configured
    if (!isJitsiJWTConfigured()) {
      return NextResponse.json(
        {
          error: 'Jitsi JWT generation is not configured. Please set JITSI_PRIVATE_KEY and NEXT_PUBLIC_JITSI_APP_ID environment variables.',
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json() as GenerateJitsiJWTOptions;

    // Validate required fields
    if (!body.userId || !body.userName || !body.roomName) {
      return NextResponse.json(
        {
          error: 'Missing required fields: userId, userName, and roomName are required.',
        },
        { status: 400 }
      );
    }

    // Generate JWT
    const expirationSeconds = body.expirationSeconds || 3600; // Default: 1 hour
    const token = generateJitsiJWT({
      userId: body.userId,
      userName: body.userName,
      userEmail: body.userEmail,
      userAvatar: body.userAvatar,
      isModerator: body.isModerator || false,
      roomName: body.roomName,
      expirationSeconds,
      features: body.features,
    });

    // Calculate expiration timestamp
    const expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;

    return NextResponse.json({
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('[Jitsi JWT API] Error generating JWT:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate JWT token',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jitsi/jwt
 * 
 * Check if JWT generation is configured
 */
export async function GET() {
  const isConfigured = isJitsiJWTConfigured();
  return NextResponse.json({
    configured: isConfigured,
  });
}

