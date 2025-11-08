'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, Testimonial } from "@workspace/ui/components/ui/sign-in";
import { validateSignInForm } from '@/lib/validations';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { env } from '@/src/env';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Rwanda Cancer Relief has been a lifeline for my family. The support and care we received during my mother's treatment was exceptional."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "The counseling services provided by RCR helped me navigate through the most difficult time of my life. I'm forever grateful."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "This organization truly understands what families go through. Their comprehensive support made all the difference in our journey."
  },
];

/**
 * Sign In page component for Rwanda Cancer Relief
 */
export default function SignInPageDemo() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('rememberMe') === 'on'
      };

      // Validate form data
      const validation = validateSignInForm(data);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0] || 'Please check your input');
        return;
      }

      // Use the auth context to sign in (this will handle redirect automatically)
      await signIn(data.email, data.password);
    } catch (err) {
      // Extract error message from API error
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      
      // Check if Supabase is configured
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction
          ? 'Google Sign-In is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Settings → Environment Variables).'
          : 'Google Sign-In is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.';
        setError(errorMessage);
        return;
      }
      
      const supabase = createClient();
      if (!supabase) {
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction
          ? 'Google Sign-In is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Settings → Environment Variables).'
          : 'Google Sign-In is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.';
        setError(errorMessage);
        return;
      }
      
      // Redirect to callback which will check onboarding status
      // The callback will redirect to onboarding if not completed, or dashboard if completed
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message || 'Google sign-in failed. Please try again.');
      }
      // If successful, the user will be redirected to Google's consent screen
      // and then back to our callback route
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  };
  
  const handleResetPassword = () => {
    // For now, just show a message - password reset would be implemented here
    alert("Password reset functionality will be implemented");
  }

  const handleCreateAccount = () => {
    router.push('/signup/patient');
  }

  return (
    <div className="bg-background text-foreground">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Welcome Back to <span className="font-semibold text-primary">Rwanda Cancer Relief</span>
          </span>
        }
        description="Access your account and continue your healing journey with us. Whether you're seeking support or offering it, we're here every step of the way."
        heroImageSrc="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=2160&q=80"
        testimonials={[]}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg flex flex-col items-center gap-4">
            <Spinner variant="bars" size={32} className="text-primary" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Signing you in...</p>
          </div>
        </div>
      )}
      <GoogleOneTap />
    </div>
  );
}
