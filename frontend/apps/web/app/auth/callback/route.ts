/**
 * OAuth Callback Route Handler
 * 
 * Handles OAuth callbacks from providers (e.g., Google) and exchanges
 * the authorization code for a session.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingRoute } from '@/lib/auth';

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
  
  // Log all query parameters for debugging
  console.log('OAuth callback received (server-side):', {
    url: request.url,
    code: code ? `${code.substring(0, 10)}...` : 'missing',
    error,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
  });
  
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
              window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent('OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
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
    
    // First, try to get the session (Supabase might have already created it)
    // This is important because Supabase OAuth might create the session before redirecting
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (existingSession && !sessionError) {
      // Session already exists - Supabase created it during OAuth flow
      console.log('Session found without code exchange:', {
        userId: existingSession.user.id,
        email: existingSession.user.email,
      });
      
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
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        // In development, use the origin directly
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        // In production with load balancer, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        // Fallback to origin
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
    
    // If no existing session, check if we have a code to exchange
    if (!code) {
      // If we don't have a code, tokens might be in the URL fragment (hash)
      // URL fragments are not sent to the server, so we need to return HTML
      // that will extract tokens from the hash and set the session on the client side
      console.log('No code found, returning client-side handler to extract tokens from URL fragment');
      
      // Return HTML that will extract tokens from the hash and set the session
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Completing authentication...</title>
            <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
          </head>
          <body>
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
              <div style="text-align: center;">
                <div style="border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                <p style="color: #6b7280; margin: 0;">Completing authentication...</p>
              </div>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
            <script>
              (async function() {
                try {
                  // Extract tokens from URL fragment (hash)
                  const hash = window.location.hash.substring(1);
                  const params = new URLSearchParams(hash);
                  const accessToken = params.get('access_token');
                  const refreshToken = params.get('refresh_token');
                  const error = params.get('error');
                  const errorDescription = params.get('error_description');
                  
                  // Check for errors in the hash
                  if (error) {
                    console.error('OAuth error in callback:', { error, errorDescription });
                    window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(errorDescription || error);
                    return;
                  }
                  
                  if (!accessToken) {
                    console.error('No access token found in URL fragment');
                    window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent('Missing authentication token');
                    return;
                  }
                  
                  // Initialize Supabase client
                  const supabaseUrl = '${supabaseUrl}';
                  const supabaseAnonKey = '${supabaseAnonKey}';
                  
                  if (!supabaseUrl || !supabaseAnonKey) {
                    console.error('Supabase not configured');
                    window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent('OAuth is not configured');
                    return;
                  }
                  
                  const { createClient } = supabase;
                  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
                    auth: {
                      persistSession: true,
                      autoRefreshToken: true,
                      detectSessionInUrl: true,
                    },
                  });
                  
                  // Set the session using the tokens
                  const { data: { session }, error: sessionError } = await supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || '',
                  });
                  
                  if (sessionError) {
                    console.error('Error setting session:', sessionError);
                    window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(sessionError.message || 'Failed to set session');
                    return;
                  }
                  
                  if (!session) {
                    console.error('No session created from tokens');
                    window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent('Failed to create session from tokens');
                    return;
                  }
                  
                  console.log('Session set successfully:', {
                    userId: session.user.id,
                    email: session.user.email,
                  });
                  
                  // Get the role from query params if present
                  const urlParams = new URLSearchParams(window.location.search);
                  const role = urlParams.get('role');
                  
                  if (role && (!session.user.user_metadata?.role || session.user.user_metadata.role === 'guest')) {
                    try {
                      // Update user metadata with role
                      const { error: updateError } = await supabaseClient.auth.updateUser({
                        data: {
                          role: role,
                          ...session.user.user_metadata,
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
                  const userMetadata = session.user.user_metadata || {};
                  const onboardingCompleted = userMetadata.onboarding_completed === true;
                  const userRole = (userMetadata.role as string) || role || 'patient';
                  
                  // Get the redirect destination from query params
                  let next = urlParams.get('next') || '/';
                  
                  // If onboarding is not complete, redirect to onboarding
                  if (!onboardingCompleted) {
                    // Determine onboarding route based on role
                    if (userRole === 'counselor') {
                      next = '/onboarding/counselor';
                    } else if (userRole === 'patient') {
                      next = '/onboarding/patient';
                    } else {
                      // Default to patient onboarding
                      next = '/onboarding/patient';
                    }
                  }
                  
                  // Redirect to the intended destination
                  window.location.href = next;
                } catch (error) {
                  console.error('Unexpected error in auth callback:', error);
                  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                  window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(errorMessage);
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
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      // In development, use the origin directly
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else if (forwardedHost) {
      // In production with load balancer, use the forwarded host
      return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
    } else {
      // Fallback to origin
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
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
}

