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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { toast } from 'sonner';

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
  
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = () => {
    setShowResetPassword(true);
    setResetEmail('');
    setResetError(null);
    setResetSuccess(false);
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);

    try {
      const { AuthApi } = await import('@/lib/api/auth');
      await AuthApi.forgotPassword(resetEmail);
      setResetSuccess(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setResetError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
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
        heroImageSrc="/images/GqBfI8HXEAA_f4S.jpg"
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

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {resetSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md space-y-2">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Password reset email sent!
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Please check your inbox (and spam folder) for the password reset link. The link will expire in 1 hour.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetSuccess(false);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                  {resetError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={resetLoading}
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetError(null);
                    setResetEmail('');
                  }}
                  className="flex-1"
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
