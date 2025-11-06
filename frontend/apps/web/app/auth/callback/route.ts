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
              const isProduction = process.env.NODE_ENV === 'production';
              const errorMsg = isProduction
                ? 'OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Settings → Environment Variables).'
                : 'OAuth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';
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
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Completing Authentication - Rwanda Cancer Relief</title>
            <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" onload="window.supabaseLoaded = true"></script>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Ubuntu', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                background: linear-gradient(135deg, oklch(0.55 0.18 300) 0%, oklch(0.70 0.15 280) 50%, oklch(0.65 0.12 280) 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: oklch(0.35 0.12 300);
              }
              
              .container {
                background: oklch(1 0 0);
                border-radius: 24px;
                padding: 48px 32px;
                box-shadow: 0 20px 60px oklch(0.35 0.12 300 / 0.2);
                max-width: 420px;
                width: 100%;
                text-align: center;
                position: relative;
                overflow: hidden;
                border: 1px solid oklch(0.90 0.02 300);
              }
              
              .container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, oklch(0.55 0.18 300), oklch(0.70 0.15 280), oklch(0.65 0.12 280), oklch(0.60 0.15 260));
                background-size: 200% 100%;
                animation: gradient 3s ease infinite;
              }
              
              @keyframes gradient {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              
              .loader-container {
                margin-bottom: 32px;
                position: relative;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .loader {
                width: 64px;
                height: 64px;
                position: relative;
              }
              
              .loader-ring {
                position: absolute;
                width: 64px;
                height: 64px;
                border: 4px solid transparent;
                border-top-color: oklch(0.55 0.18 300);
                border-radius: 50%;
                animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
              }
              
              .loader-ring:nth-child(1) {
                animation-delay: -0.45s;
              }
              
              .loader-ring:nth-child(2) {
                animation-delay: -0.3s;
                border-top-color: oklch(0.70 0.15 280);
                width: 48px;
                height: 48px;
                top: 8px;
                left: 8px;
              }
              
              .loader-ring:nth-child(3) {
                animation-delay: -0.15s;
                border-top-color: oklch(0.65 0.12 280);
                width: 32px;
                height: 32px;
                top: 16px;
                left: 16px;
              }
              
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              .checkmark {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: block;
                stroke-width: 3;
                stroke: oklch(0.55 0.18 300);
                stroke-miterlimit: 10;
                margin: 0 auto 24px;
                box-shadow: inset 0px 0px 0px oklch(0.55 0.18 300);
                animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
                opacity: 0;
              }
              
              .checkmark-circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 3;
                stroke-miterlimit: 10;
                stroke: oklch(0.55 0.18 300);
                fill: none;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
              }
              
              .checkmark-check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
              }
              
              @keyframes stroke {
                100% { stroke-dashoffset: 0; }
              }
              
              @keyframes scale {
                0%, 100% { transform: none; }
                50% { transform: scale3d(1.1, 1.1, 1); }
              }
              
              @keyframes fill {
                100% { box-shadow: inset 0px 0px 0px 30px oklch(0.55 0.18 300); }
              }
              
              h1 {
                font-size: 24px;
                font-weight: 600;
                color: oklch(0.25 0.12 300);
                margin-bottom: 12px;
              }
              
              .status-text {
                font-size: 16px;
                color: oklch(0.45 0.10 300);
                margin-bottom: 8px;
                transition: opacity 0.3s ease;
              }
              
              .progress-steps {
                margin-top: 32px;
                text-align: left;
              }
              
              .step {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                font-size: 14px;
                color: oklch(0.45 0.10 300);
                transition: color 0.3s ease;
              }
              
              .step.active {
                color: oklch(0.55 0.18 300);
                font-weight: 500;
              }
              
              .step.completed {
                color: oklch(0.55 0.18 300);
              }
              
              .step-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid oklch(0.90 0.02 300);
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.3s ease;
              }
              
              .step.active .step-icon {
                border-color: oklch(0.55 0.18 300);
                background: oklch(0.55 0.18 300);
                animation: pulse 2s ease infinite;
              }
              
              .step.completed .step-icon {
                border-color: oklch(0.55 0.18 300);
                background: oklch(0.55 0.18 300);
              }
              
              .step.completed .step-icon::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: bold;
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              
              .error-message {
                background: oklch(0.577 0.245 27.325 / 0.1);
                border: 1px solid oklch(0.577 0.245 27.325 / 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-top: 24px;
                color: oklch(0.577 0.245 27.325);
                font-size: 14px;
                display: none;
              }
              
              .error-message.show {
                display: block;
                animation: slideDown 0.3s ease;
              }
              
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @media (prefers-color-scheme: dark) {
                body {
                  background: linear-gradient(135deg, oklch(0.15 0.02 300) 0%, oklch(0.20 0.03 300) 100%);
                }
                
                .container {
                  background: oklch(0.20 0.03 300);
                  color: oklch(0.98 0.01 300);
                  border-color: oklch(0.30 0.05 300);
                }
                
                h1 {
                  color: oklch(0.98 0.01 300);
                }
                
                .status-text {
                  color: oklch(0.70 0.12 300);
                }
                
                .step {
                  color: oklch(0.70 0.12 300);
                }
                
                .step.active {
                  color: oklch(0.70 0.20 300);
                }
                
                .step.completed {
                  color: oklch(0.70 0.20 300);
                }
                
                .step-icon {
                  border-color: oklch(0.30 0.05 300);
                }
                
                .step.active .step-icon {
                  border-color: oklch(0.70 0.20 300);
                  background: oklch(0.70 0.20 300);
                }
                
                .step.completed .step-icon {
                  border-color: oklch(0.70 0.20 300);
                  background: oklch(0.70 0.20 300);
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="loader-container" id="loaderContainer">
                <div class="loader">
                  <div class="loader-ring"></div>
                  <div class="loader-ring"></div>
                  <div class="loader-ring"></div>
                </div>
              </div>
              
              <h1 id="title">Completing Authentication</h1>
              <p class="status-text" id="statusText">Please wait while we sign you in...</p>
              
              <div class="progress-steps">
                <div class="step" id="step1">
                  <div class="step-icon"></div>
                  <span>Verifying credentials</span>
                </div>
                <div class="step" id="step2">
                  <div class="step-icon"></div>
                  <span>Creating session</span>
                </div>
                <div class="step" id="step3">
                  <div class="step-icon"></div>
                  <span>Setting up your account</span>
                </div>
                <div class="step" id="step4">
                  <div class="step-icon"></div>
                  <span>Redirecting...</span>
                </div>
              </div>
              
              <div class="error-message" id="errorMessage"></div>
            </div>
            
            <script>
              (async function() {
                // Wait for Supabase library to load (with timeout)
                let attempts = 0;
                while (typeof supabase === 'undefined' && attempts < 50) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  attempts++;
                }
                
                if (typeof supabase === 'undefined') {
                  console.error('Supabase library not loaded after 5 seconds');
                  const errorMsg = document.getElementById('errorMessage');
                  errorMsg.textContent = 'Authentication service failed to load. Please refresh the page.';
                  errorMsg.classList.add('show');
                  return;
                }
                
                const loaderContainer = document.getElementById('loaderContainer');
                const title = document.getElementById('title');
                const statusText = document.getElementById('statusText');
                const errorMessage = document.getElementById('errorMessage');
                const steps = {
                  step1: document.getElementById('step1'),
                  step2: document.getElementById('step2'),
                  step3: document.getElementById('step3'),
                  step4: document.getElementById('step4'),
                };
                
                let currentStep = 0;
                let redirectExecuted = false;
                
                // Fallback redirect - ensure we always redirect even if something fails
                const fallbackRedirect = setTimeout(() => {
                  if (!redirectExecuted) {
                    console.warn('Fallback redirect triggered - something may have gone wrong');
                    const urlParams = new URLSearchParams(window.location.search);
                    const next = urlParams.get('next') || '/onboarding/patient';
                    const role = urlParams.get('role') || 'patient';
                    const redirectPath = next.startsWith('/') ? next : '/onboarding/' + role;
                    window.location.replace(redirectPath);
                  }
                }, 10000); // 10 second fallback
                
                function updateStep(stepNumber) {
                  Object.keys(steps).forEach((key, index) => {
                    const step = steps[key];
                    if (index < stepNumber) {
                      step.classList.add('completed');
                      step.classList.remove('active');
                    } else if (index === stepNumber) {
                      step.classList.add('active');
                      step.classList.remove('completed');
                    } else {
                      step.classList.remove('active', 'completed');
                    }
                  });
                }
                
                function showError(message) {
                  errorMessage.textContent = message;
                  errorMessage.classList.add('show');
                  title.textContent = 'Authentication Failed';
                  statusText.textContent = 'We encountered an error while signing you in.';
                  loaderContainer.innerHTML = '<div style="width: 64px; height: 64px; border-radius: 50%; background: oklch(0.577 0.245 27.325 / 0.1); border: 4px solid oklch(0.577 0.245 27.325 / 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 32px; color: oklch(0.577 0.245 27.325);">✕</div>';
                }
                
                function showSuccess() {
                  title.textContent = 'Authentication Successful!';
                  statusText.textContent = 'Redirecting you now...';
                  loaderContainer.innerHTML = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>';
                }
                
                // Set timeout for authentication (30 seconds)
                const timeout = setTimeout(() => {
                  showError('Authentication is taking longer than expected. Please try again.');
                  setTimeout(() => {
                    window.location.href = '/signin';
                  }, 3000);
                }, 30000);
                
                try {
                  updateStep(0);
                  statusText.textContent = 'Extracting authentication tokens...';
                  
                  // Extract tokens from URL fragment (hash)
                  const hash = window.location.hash.substring(1);
                  const params = new URLSearchParams(hash);
                  const accessToken = params.get('access_token');
                  const refreshToken = params.get('refresh_token');
                  const error = params.get('error');
                  const errorDescription = params.get('error_description');
                  
                  // Check for errors in the hash
                  if (error) {
                    clearTimeout(timeout);
                    console.error('OAuth error in callback:', { error, errorDescription });
                    showError(errorDescription || error);
                    setTimeout(() => {
                      window.location.href = '/auth/auth-code-error?error=' + encodeURIComponent(errorDescription || error);
                    }, 3000);
                    return;
                  }
                  
                  if (!accessToken) {
                    clearTimeout(timeout);
                    console.error('No access token found in URL fragment');
                    showError('Missing authentication token. Please try signing in again.');
                    setTimeout(() => {
                      window.location.href = '/signin';
                    }, 3000);
                    return;
                  }
                  
                  updateStep(1);
                  statusText.textContent = 'Initializing authentication service...';
                  
                  // Initialize Supabase client
                  const supabaseUrl = '${env.NEXT_PUBLIC_SUPABASE_URL || ''}';
                  const supabaseAnonKey = '${env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}';
                  
                  if (!supabaseUrl || !supabaseAnonKey) {
                    clearTimeout(timeout);
                    console.error('Supabase not configured');
                    showError('Authentication service is not configured. Please contact support.');
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
                  
                  updateStep(2);
                  statusText.textContent = 'Creating your session...';
                  
                  // When detectSessionInUrl is true, Supabase automatically extracts tokens from hash
                  // and creates a session. However, this happens asynchronously during client initialization.
                  // We need to wait a moment for Supabase to process the hash, then check/get the session.
                  
                  // Wait a brief moment for Supabase to auto-detect tokens from hash
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  // Try to get the session (Supabase should have auto-extracted from hash by now)
                  let { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
                  
                  // If no session yet, manually set it using tokens from hash
                  // This is a fallback in case automatic detection didn't work
                  if (!session && accessToken) {
                    console.log('Automatic detection failed, manually setting session with tokens from hash...');
                    ({ data: { session }, error: sessionError } = await supabaseClient.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken || '',
                    }));
                  } else if (session) {
                    console.log('Session automatically detected from URL hash by Supabase');
                  }
                  
                  if (sessionError) {
                    clearTimeout(timeout);
                    console.error('Error setting session:', sessionError);
                    console.error('Session error details:', {
                      message: sessionError.message,
                      status: sessionError.status,
                      name: sessionError.name,
                    });
                    showError(sessionError.message || 'Failed to create session. Please try again.');
                    setTimeout(() => {
                      window.location.href = '/signin';
                    }, 3000);
                    return;
                  }
                  
                  if (!session) {
                    clearTimeout(timeout);
                    console.error('No session created from tokens');
                    console.error('Token details:', {
                      hasAccessToken: !!accessToken,
                      hasRefreshToken: !!refreshToken,
                      accessTokenLength: accessToken?.length,
                    });
                    showError('Failed to create session. Please try signing in again.');
                    setTimeout(() => {
                      window.location.href = '/signin';
                    }, 3000);
                    return;
                  }
                  
                  console.log('Session created successfully:', {
                    userId: session.user.id,
                    email: session.user.email,
                    expiresAt: session.expires_at,
                  });
                  
                  updateStep(3);
                  statusText.textContent = 'Setting up your account...';
                  
                  // Get the role and next from query params
                  const urlParams = new URLSearchParams(window.location.search);
                  const role = urlParams.get('role');
                  let next = urlParams.get('next') || '/';
                  
                  // Update user metadata with role if provided (non-blocking with timeout)
                  // This is done in parallel and won't block the redirect
                  if (role && (!session.user.user_metadata?.role || session.user.user_metadata.role === 'guest')) {
                    // Start the update but don't wait for it - redirect will happen regardless
                    (async () => {
                      try {
                        console.log('Updating user role to:', role);
                        const { error: updateError } = await supabaseClient.auth.updateUser({
                          data: {
                            role: role,
                            ...session.user.user_metadata,
                          },
                        });
                        
                        if (updateError) {
                          console.warn('Failed to update user role in metadata:', updateError);
                        } else {
                          console.log('Successfully set user role to:', role);
                        }
                      } catch (updateErr) {
                        console.warn('Error updating user metadata with role:', updateErr);
                      }
                    })(); // Fire and forget - don't await
                  }
                  
                  // Check if onboarding is complete
                  const userMetadata = session.user.user_metadata || {};
                  const onboardingCompleted = userMetadata.onboarding_completed === true;
                  const userRole = (userMetadata.role as string) || role || 'patient';
                  
                  // Determine redirect destination
                  // Priority: 1) next param, 2) onboarding if not complete, 3) default
                  if (!onboardingCompleted) {
                    // If onboarding is not complete, redirect to onboarding
                    if (userRole === 'counselor') {
                      next = '/onboarding/counselor';
                    } else if (userRole === 'patient') {
                      next = '/onboarding/patient';
                    } else {
                      // Default to patient onboarding
                      next = '/onboarding/patient';
                    }
                  } else if (!next || next === '/') {
                    // If onboarding is complete and no next param, go to dashboard
                    if (userRole === 'counselor') {
                      next = '/dashboard/counselor';
                    } else if (userRole === 'patient') {
                      next = '/dashboard/patient';
                    } else {
                      next = '/';
                    }
                  }
                  
                  // Ensure next is a valid path
                  if (!next.startsWith('/')) {
                    next = '/';
                  }
                  
                  console.log('Redirecting to:', next);
                  console.log('User role:', userRole);
                  console.log('Onboarding completed:', onboardingCompleted);
                  
                  clearTimeout(timeout);
                  updateStep(4);
                  showSuccess();
                  
                  // Small delay to show success state, then redirect
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // Mark redirect as executed and clear fallback
                  redirectExecuted = true;
                  clearTimeout(fallbackRedirect);
                  
                  // Redirect to the intended destination
                  console.log('Executing redirect to:', next);
                  window.location.replace(next);
                } catch (error) {
                  clearTimeout(timeout);
                  clearTimeout(fallbackRedirect);
                  redirectExecuted = true;
                  
                  console.error('Unexpected error in auth callback:', error);
                  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
                  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                  
                  // Try to redirect to onboarding anyway if we have a role
                  const urlParams = new URLSearchParams(window.location.search);
                  const role = urlParams.get('role') || 'patient';
                  const next = urlParams.get('next') || '/onboarding/' + role;
                  
                  showError(errorMessage);
                  setTimeout(() => {
                    // Try to redirect to onboarding even on error
                    window.location.replace(next);
                  }, 2000);
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
}
