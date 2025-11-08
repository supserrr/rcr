/**
 * Google One Tap Component
 * 
 * Implements Google One Tap sign-in using Google's pre-built solution.
 * This provides a better user experience with automatic sign-in prompts.
 */

'use client';

import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { env } from '@/src/env';

declare const google: {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        nonce?: string;
        use_fedcm_for_prompt?: boolean;
      }) => void;
      prompt: () => void;
    };
  };
};

/**
 * Generate nonce to use for Google ID token sign-in
 */
const generateNonce = async (): Promise<string[]> => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return [nonce, hashedNonce];
};

/**
 * Google One Tap Component
 * 
 * Displays Google One Tap sign-in UI automatically when appropriate.
 */
export function GoogleOneTap() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGoogleOneTap = async () => {
    if (isInitialized) return;
    
    // Check if Supabase and Google are configured
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!supabaseUrl || !supabaseAnonKey || !googleClientId) {
      // Silently skip if not configured (optional feature)
      return;
    }
    
    const supabase = createClient();
    if (!supabase) {
      // Silently skip if not configured (optional feature)
      return;
    }
    
    console.log('Initializing Google One Tap');
    const [nonce, hashedNonce] = await generateNonce();
    console.log('Nonce: ', nonce, hashedNonce);

    // Check if there's already an existing session before initializing the one-tap UI
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session', error);
    }

    if (data.session) {
      // User is already signed in, don't show One Tap
      return;
    }

    if (typeof google === 'undefined') {
      console.error('Google accounts library not loaded');
      return;
    }

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: { credential: string }) => {
        try {
          // Re-generate nonce for callback verification
          const [nonce] = await generateNonce();
          // Send ID token returned in response.credential to Supabase
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
            nonce,
          });

          if (error) throw error;

          console.log('Session data: ', data);
          console.log('Successfully logged in with Google One Tap');

          // Redirect to dashboard or home
          router.push('/');
          router.refresh();
        } catch (error) {
          console.error('Error logging in with Google One Tap', error);
        }
      },
      nonce: hashedNonce,
      // With Chrome's removal of third-party cookies, we need to use FedCM instead
      // https://developers.google.com/identity/gsi/web/guides/fedcm-migration
      use_fedcm_for_prompt: true,
    });

    google.accounts.id.prompt(); // Display the One Tap UI
    setIsInitialized(true);
  };

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      async
      onReady={() => {
        // Call async function without awaiting (onReady expects void return)
        initializeGoogleOneTap().catch((error) => {
          console.error('Error initializing Google One Tap:', error);
        });
      }}
    />
  );
}

