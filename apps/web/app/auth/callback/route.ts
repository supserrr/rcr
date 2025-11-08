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
    
    // Return HTML page that will handle tokens from URL fragment if available
    // This allows the build to complete even if Supabase isn't configured
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
          <script>
            // Check if tokens are in URL fragment
            const hash = window.location.hash.substring(1);
            if (hash) {
              // Redirect to error page with message
              // Note: process.env is not available in browser, so we'll use a generic message
              const errorMsg = 'OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';
              window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(errorMsg);
            } else {
              window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent('OAuth is not configured. Please contact support.');
            }
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
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
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
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

      // Check if onboarding is complete
      const userMetadata = data.user.user_metadata || {};
      const onboardingCompleted = userMetadata.onboarding_completed === true;
      const userRole = (userMetadata.role as string) || role || 'patient';
      
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
      // If we don't have a code, tokens might be in the URL fragment (hash)
      // URL fragments are not sent to the server, so we need to return HTML
      // that will extract tokens from the hash and set the session on the client side
      if (process.env.NODE_ENV === 'development') {
      console.log('No code found, returning client-side handler to extract tokens from URL fragment');
      }
      
      // Return minimal HTML that will extract tokens from the hash and set the session
      // No loading screen - just process and redirect immediately
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Completing Authentication</title>
            <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js" onload="window.supabaseLoaded = true"></script>
          </head>
          <body>
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
              <div style="text-align: center;">
                <p>Completing authentication...</p>
                <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Please wait while we sign you in</p>
              </div>
            </div>
            <script>
              // Add timeout fallback - if script doesn't complete in 10 seconds, redirect
              const timeoutId = setTimeout(() => {
                console.error('OAuth callback timeout - redirecting to fallback');
                const urlParams = new URLSearchParams(window.location.search);
                const role = urlParams.get('role') || 'patient';
                const next = urlParams.get('next') || '/onboarding/' + role;
                window.location.replace(next);
              }, 10000);
              
              (async function() {
                try {
                  console.log('Starting OAuth callback processing...');
                  
                  // Extract tokens immediately from URL fragment (hash)
                  const hash = window.location.hash.substring(1);
                  const params = new URLSearchParams(hash);
                  const accessToken = params.get('access_token');
                  const refreshToken = params.get('refresh_token');
                  const error = params.get('error');
                  const errorDescription = params.get('error_description');
                  
                  // Check for errors immediately
                  if (error) {
                    console.error('OAuth error:', error, errorDescription);
                    clearTimeout(timeoutId);
                      window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(errorDescription || error);
                    return;
                  }
                  
                  if (!accessToken) {
                    console.error('No access token found in URL');
                    clearTimeout(timeoutId);
                    window.location.href = '/signin?error=missing_token';
                    return;
                  }
                  
                  console.log('Access token found, waiting for Supabase library...');
                  
                  // Wait for Supabase library to load
                  // The UMD build exposes the library as window.supabase with createClient function
                  let attempts = 0;
                  let supabaseLib = null;
                  
                  // Wait for script to load and library to be available
                  while (attempts < 100) { // Increased timeout to 5 seconds (100 * 50ms)
                    // Check if library is available - UMD build exposes it as window.supabase
                    if (typeof window.supabase !== 'undefined' && 
                        window.supabase && 
                        typeof window.supabase.createClient === 'function') {
                      supabaseLib = window.supabase;
                      console.log('Supabase library loaded after', attempts * 50, 'ms');
                      break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 50));
                    attempts++;
                  }
                  
                  if (!supabaseLib) {
                    console.error('Supabase library not loaded after timeout');
                    clearTimeout(timeoutId);
                    window.location.href = '/signin?error=library_load_failed';
                    return;
                  }
                  
                  // Initialize Supabase client
                  const supabaseUrl = '${supabaseUrl || ''}';
                  const supabaseAnonKey = '${supabaseAnonKey || ''}';
                  
                  if (!supabaseUrl || !supabaseAnonKey) {
                    console.error('Supabase not configured:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey });
                    clearTimeout(timeoutId);
                    window.location.href = '/signin?error=not_configured';
                    return;
                  }
                  
                  console.log('Creating Supabase client...');
                  const { createClient } = supabaseLib;
                  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
                    auth: {
                      persistSession: true,
                      autoRefreshToken: true,
                      detectSessionInUrl: false, // Disable auto-detection, we'll set it manually for speed
                    },
                  });
                  
                  // Set session directly with tokens (no waiting for auto-detection)
                  console.log('Setting session with tokens...');
                  const { data: { session }, error: sessionError } = await supabaseClient.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken || '',
                  });
                  
                  if (sessionError) {
                    console.error('Session error:', sessionError);
                    clearTimeout(timeoutId);
                    window.location.href = '/signin?error=session_failed&details=' + encodeURIComponent(sessionError.message || 'Unknown error');
                    return;
                  }
                  
                  if (!session) {
                    console.error('No session returned from setSession');
                    clearTimeout(timeoutId);
                    window.location.href = '/signin?error=session_failed&details=No session returned';
                    return;
                  }
                  
                  console.log('Session set successfully, user:', session.user.email);
                  
                  // Get redirect destination
                  const urlParams = new URLSearchParams(window.location.search);
                  const role = urlParams.get('role');
                  let next = urlParams.get('next') || '/';
                  
                  // Update user role if needed (non-blocking - don't wait)
                  if (role && (!session.user.user_metadata?.role || session.user.user_metadata.role === 'guest')) {
                        console.log('Updating user role to:', role);
                    supabaseClient.auth.updateUser({
                      data: { role: role, ...session.user.user_metadata },
                    }).catch((err) => {
                      console.warn('Failed to update user role (non-blocking):', err);
                    }); // Ignore errors - don't block redirect
                  }
                  
                  // Determine redirect path
                  const userMetadata = session.user.user_metadata || {};
                  const onboardingCompleted = userMetadata.onboarding_completed === true;
                  const userRole = (userMetadata.role as string) || role || 'patient';
                  
                  if (!onboardingCompleted) {
                    next = userRole === 'counselor' ? '/onboarding/counselor' : '/onboarding/patient';
                  } else if (!next || next === '/') {
                    next = userRole === 'counselor' ? '/dashboard/counselor' : userRole === 'patient' ? '/dashboard/patient' : '/';
                    }
                  
                  if (!next.startsWith('/')) {
                    next = '/';
                  }
                  
                  console.log('Redirecting to:', next);
                  
                  // Clear timeout since we're redirecting successfully
                  clearTimeout(timeoutId);
                  
                  // Redirect immediately
                  window.location.replace(next);
                } catch (error) {
                  console.error('Auth callback error:', error);
                  clearTimeout(timeoutId);
                  const urlParams = new URLSearchParams(window.location.search);
                  const role = urlParams.get('role') || 'patient';
                  const next = urlParams.get('next') || '/onboarding/' + role;
                  console.log('Fallback redirect to:', next);
                    window.location.replace(next);
                }
              })();
            </script>
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

      // Check if onboarding is complete
      const userMetadata = data.user.user_metadata || {};
      const onboardingCompleted = userMetadata.onboarding_completed === true;
      const userRole = (userMetadata.role as string) || role || 'patient';
      
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
