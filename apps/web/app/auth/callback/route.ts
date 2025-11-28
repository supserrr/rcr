/**
 * OAuth Callback Route Handler
 * 
 * Handles OAuth callbacks from providers (e.g., Google) and exchanges
 * the authorization code for a session.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingRoute } from '@/lib/auth';
import { env } from '@/src/env';
import type { CounselorApprovalStatus } from '@/lib/types';

const OAUTH_STORAGE_KEY = 'rcr.oauth.payload';
const CALLBACK_LOADING_PATH = '/auth/callback/loading';

/**
 * Check if user has completed onboarding (server-side version)
 * Uses the same logic as isOnboardingComplete in lib/auth.ts
 */
async function checkOnboardingComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userRole: string,
  userMetadata: Record<string, unknown>
): Promise<boolean> {
  if (!supabase) return false;

  // First, check the onboarding_completed flag in metadata (this is set when onboarding form is submitted)
  // This should be checked FIRST because a user who has submitted onboarding should be considered complete
  // even if they're still pending approval
  const onboardingObj = userMetadata.onboarding as Record<string, unknown> | undefined;
  const onboardingFlag =
    userMetadata.onboarding_completed ??
    userMetadata.onboardingCompleted ??
    userMetadata.onboarding_complete ??
    userMetadata.has_completed_onboarding ??
    onboardingObj?.completed ??
    onboardingObj?.isComplete ??
    onboardingObj?.is_completed;

  if (typeof onboardingFlag === 'boolean' && onboardingFlag === true) {
    return true;
  }

  if (typeof onboardingFlag === 'string') {
    const normalized = onboardingFlag.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'completed') {
      return true;
    }
  }

  if (typeof onboardingFlag === 'number' && onboardingFlag === 1) {
    return true;
  }

  // Check for completion timestamp
  if (userMetadata.onboarding_completed_at || userMetadata.onboardingCompletedAt) {
    return true;
  }

  // For counselors: Check approval status and profile
  if (userRole === 'counselor') {
    // Check approval status from metadata first
    const approvalStatus = 
      (userMetadata.approvalStatus as CounselorApprovalStatus) || 
      (userMetadata.approval_status as CounselorApprovalStatus);
    
    if (approvalStatus === 'approved') {
      return true;
    }

    // Check profile for approval status
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_status, approval_reviewed_at, metadata')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const profileMetadata = (profile.metadata || {}) as Record<string, unknown>;
      const profileApprovalStatus = profile.approval_status as CounselorApprovalStatus | null;
      
      if (profileApprovalStatus === 'approved') {
        return true;
      }

      // Check if they have a counselor profile (indicates onboarding was completed)
      const { data: counselorProfile } = await supabase
        .from('counselor_profiles')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (counselorProfile) {
        return true;
      }

      // Check profile metadata for onboarding flag
      const profileOnboardingFlag =
        profileMetadata.onboarding_completed ??
        profileMetadata.onboardingCompleted ??
        profileMetadata.onboarding_complete;
      
      if (typeof profileOnboardingFlag === 'boolean' && profileOnboardingFlag === true) {
        return true;
      }

      if (profileMetadata.onboarding_completed_at || profileMetadata.onboardingCompletedAt) {
        return true;
      }

      // Check if approval was reviewed (even if pending, if reviewed, they've completed onboarding)
      if (profile.approval_reviewed_at) {
        if (profileApprovalStatus !== 'rejected') {
          return true;
        }
      }
    }
  }

  // For patients: Check if they have essential profile data
  if (userRole === 'patient') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('treatment_stage, contact_phone, emergency_contact_name, emergency_contact_phone, metadata')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const profileMetadata = (profile.metadata || {}) as Record<string, unknown>;
      
      const hasTreatmentInfo = 
        profile.treatment_stage ||
        profileMetadata.treatmentStage || 
        profileMetadata.treatment_stage ||
        profileMetadata.diagnosis ||
        profileMetadata.cancerType ||
        profileMetadata.cancer_type;
      
      const hasContactInfo = 
        profile.contact_phone ||
        userMetadata.contactPhone || 
        userMetadata.contact_phone ||
        userMetadata.phoneNumber ||
        userMetadata.phone_number;
      
      const hasEmergencyContact = 
        profile.emergency_contact_name ||
        profile.emergency_contact_phone ||
        userMetadata.emergencyContactName ||
        userMetadata.emergency_contact_name ||
        userMetadata.emergencyContactPhone ||
        userMetadata.emergency_contact_phone;

      // If patient has treatment info and contact info, they've likely completed onboarding
      if (hasTreatmentInfo && hasContactInfo) {
        return true;
      }

      // If they have emergency contact and contact info, also consider it complete
      if (hasEmergencyContact && hasContactInfo) {
        return true;
      }
    }
  }

  // The onboarding flag check was already done at the top of the function
  // If we reach here, onboarding is not complete
  return false;
}

/**
 * OAuth callback handler
 * 
 * Processes OAuth callbacks from providers and exchanges authorization codes
 * for user sessions. Handles errors gracefully and provides feedback to users.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Note: URL fragments (hash) are not sent to the server, so tokens in the hash
  // will be handled by the client-side page at /auth/callback
  
  // Log all query parameters for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
  console.log('OAuth callback received (server-side):', {
    url: request.url,
    code: code ? `${code.substring(0, 10)}...` : 'missing',
    error,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
  });
  }
  
  // Check if OAuth provider returned an error
  if (error) {
    console.error('OAuth provider error:', {
      error,
      errorDescription,
      url: request.url,
    });
    
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase not configured:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });

    const errorMessage =
      'OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';
    return NextResponse.redirect(
      `${origin}${CALLBACK_LOADING_PATH}?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/';
  }

  // Extract role from query parameters (passed from signup page)
  const role = searchParams.get('role');

  try {
    const supabase = await createClient();
    
    if (!supabase) {
      const isProduction = process.env.NODE_ENV === 'production';
      const errorMessage = isProduction
        ? 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Settings → Environment Variables).'
        : 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';

      return NextResponse.redirect(
        `${origin}${CALLBACK_LOADING_PATH}?error=${encodeURIComponent(errorMessage)}`
      );
    }
    
    // First, try to get the session (Supabase might have already created it)
    // This is important because Supabase OAuth might create the session before redirecting
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (existingSession && !sessionError) {
      // Session already exists - Supabase created it during OAuth flow
      if (process.env.NODE_ENV === 'development') {
      console.log('Session found without code exchange:', {
        userId: existingSession.user.id,
        email: existingSession.user.email,
      });
      }
      
      const data = { session: existingSession, user: existingSession.user };
      
      // If role is provided and user doesn't have a role set, update user metadata
      if (role && data.user && (!data.user.user_metadata?.role || data.user.user_metadata.role === 'guest')) {
        try {
          // Update user metadata with role
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              role: role,
              ...data.user.user_metadata, // Preserve existing metadata
            },
          });

          if (updateError) {
            console.warn('Failed to update user role in metadata:', updateError);
            // Don't fail the auth flow if role update fails
          } else {
            console.log('Successfully set user role to:', role);
          }
        } catch (updateErr) {
          console.warn('Error updating user metadata with role:', updateErr);
          // Don't fail the auth flow if role update fails
        }
      }

      // Check if onboarding is complete using comprehensive check
      const userMetadata = data.user.user_metadata || {};
      const userRole = (userMetadata.role as string) || role || 'patient';
      const onboardingCompleted = await checkOnboardingComplete(supabase, data.user.id, userRole, userMetadata);
      
      // If onboarding is not complete, redirect to onboarding
      // If "next" is already an onboarding route, use it; otherwise redirect to appropriate onboarding
      let redirectPath = next;
      if (!onboardingCompleted) {
        // Determine onboarding route based on role
        if (userRole === 'counselor') {
          redirectPath = '/onboarding/counselor';
        } else if (userRole === 'patient') {
          redirectPath = '/onboarding/patient';
        } else {
          // Default to patient onboarding
          redirectPath = '/onboarding/patient';
        }
      }

      // Successfully authenticated, redirect to the intended destination
      // Optimized for Vercel production deployment
      const forwardedHost = request.headers.get('x-forwarded-host');
      const vercelUrl = process.env.VERCEL_URL;
      const isProduction = process.env.NODE_ENV === 'production';

      // Determine the correct base URL for redirects
      let baseUrl: string;
      
      if (isProduction) {
        // In production, prioritize forwarded host (Vercel's load balancer)
        if (forwardedHost) {
          baseUrl = `https://${forwardedHost}`;
        } else if (vercelUrl) {
          // Fallback to VERCEL_URL if available
          baseUrl = `https://${vercelUrl}`;
        } else {
          // Use origin as final fallback
          baseUrl = origin;
        }
      } else {
        // In development, use origin directly
        baseUrl = origin;
      }

      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    }
    
    // If no existing session, check if we have a code to exchange
    if (!code) {
      const storageKeyScript = JSON.stringify(OAUTH_STORAGE_KEY);
      const loadingPathScript = JSON.stringify(CALLBACK_LOADING_PATH);
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="refresh" content="3;url=/signin" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Redirecting…</title>
          </head>
          <body>
            <script>
              (function() {
                var search = window.location.search || '';
                var hash = window.location.hash ? window.location.hash.substring(1) : '';
                var storageKey = ${storageKeyScript};
                var loadingPath = ${loadingPathScript};

                try {
                  if (hash) {
                    sessionStorage.setItem(storageKey, hash);
                  } else {
                    sessionStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  console.error('OAuth callback storage error', err);
                  window.location.replace('/auth/auth-code-error?error=' + encodeURIComponent('We could not store your sign-in details. Please try again.'));
                  return;
                }

                var target = loadingPath + search;
                window.location.replace(target);
              })();
            </script>
            <noscript>
              JavaScript is required to finish signing you in. Please enable JavaScript and try again.
            </noscript>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Exchange the authorization code for a session
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Failed to exchange code for session:', {
          error: exchangeError.message,
          status: exchangeError.status,
          code: code.substring(0, 10) + '...', // Log partial code for debugging
        });
        
        const errorMessage = exchangeError.message || 'Failed to complete authentication. Please try again.';
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
        );
      }
      
      if (!data.session) {
        console.error('No session returned from code exchange:', {
          hasData: !!data,
          hasSession: !!data?.session,
        });
        
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent('Authentication session not created. Please try again.')}`
        );
      }

      // If role is provided and user doesn't have a role set, update user metadata
      if (role && data.user && (!data.user.user_metadata?.role || data.user.user_metadata.role === 'guest')) {
        try {
          // Update user metadata with role
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              role: role,
              ...data.user.user_metadata, // Preserve existing metadata
            },
          });

          if (updateError) {
            console.warn('Failed to update user role in metadata:', updateError);
            // Don't fail the auth flow if role update fails
          } else {
            console.log('Successfully set user role to:', role);
          }
        } catch (updateErr) {
          console.warn('Error updating user metadata with role:', updateErr);
          // Don't fail the auth flow if role update fails
        }
      }

      // Check if onboarding is complete using comprehensive check
      const userMetadata = data.user.user_metadata || {};
      const userRole = (userMetadata.role as string) || role || 'patient';
      const onboardingCompleted = await checkOnboardingComplete(supabase, data.user.id, userRole, userMetadata);
      
      // If onboarding is not complete, redirect to onboarding
      // If "next" is already an onboarding route, use it; otherwise redirect to appropriate onboarding
      let redirectPath = next;
      if (!onboardingCompleted) {
        // Determine onboarding route based on role
        if (userRole === 'counselor') {
          redirectPath = '/onboarding/counselor';
        } else if (userRole === 'patient') {
          redirectPath = '/onboarding/patient';
        } else {
          // Default to patient onboarding
          redirectPath = '/onboarding/patient';
        }
      }

      // Successfully authenticated, redirect to the intended destination
      // Optimized for Vercel production deployment
      const forwardedHost = request.headers.get('x-forwarded-host');
      const vercelUrl = process.env.VERCEL_URL;
      const isProduction = process.env.NODE_ENV === 'production';

      // Determine the correct base URL for redirects
      let baseUrl: string;
      
      if (isProduction) {
        // In production, prioritize forwarded host (Vercel's load balancer)
        if (forwardedHost) {
          baseUrl = `https://${forwardedHost}`;
        } else if (vercelUrl) {
          // Fallback to VERCEL_URL if available
          baseUrl = `https://${vercelUrl}`;
        } else {
          // Use origin as final fallback
          baseUrl = origin;
        }
      } else {
        // In development, use origin directly
        baseUrl = origin;
      }

      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in OAuth callback:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during authentication.';
      
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
      );
    }
  } catch (error) {
    // Handle unexpected errors at the top level
    console.error('Unexpected error in OAuth callback:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during authentication.';
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
    );
  }
}
