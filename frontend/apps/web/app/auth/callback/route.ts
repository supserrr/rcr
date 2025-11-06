/**
 * OAuth Callback Route Handler
 * 
 * Handles OAuth callbacks from providers (e.g., Google) and exchanges
 * the authorization code for a session.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  
  // Log all query parameters for debugging
  console.log('OAuth callback received:', {
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
    
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('OAuth is not configured. Please contact support.')}`
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
    
    // Check if we have a code to exchange, or if Supabase already created a session
    let sessionData;
    
    if (code) {
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
      
      sessionData = data;
    } else {
      // No code provided - check if Supabase already created a session
      // This can happen if Supabase handles the OAuth flow differently
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Missing authorization code and no session found:', {
          url: request.url,
          searchParams: Object.fromEntries(searchParams.entries()),
          sessionError: sessionError?.message,
        });
        
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent('Missing authorization code. Please try signing in again.')}`
        );
      }
      
      // Use the existing session
      sessionData = { session, user: session.user };
    }
    
    const { data, error: exchangeError } = { data: sessionData, error: null };

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

    // Successfully authenticated, redirect to the intended destination
    const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
      // In development, use the origin directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
      // In production with load balancer, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
      // Fallback to origin
        return NextResponse.redirect(`${origin}${next}`);
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

