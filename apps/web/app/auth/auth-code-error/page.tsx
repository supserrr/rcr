/**
 * OAuth Error Page
 * 
 * Displayed when OAuth authentication fails or encounters an error.
 * Shows specific error messages when available.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertCircle } from 'lucide-react';

/**
 * OAuth error page component
 * 
 * Displays authentication errors with specific error messages when available.
 * Provides options to retry authentication or return home.
 */
export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Default error message
  const defaultMessage = 'There was an error during authentication. Please try again.';
  const errorMessage = error || defaultMessage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            {error ? 'An error occurred during authentication' : defaultMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                {errorMessage}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>The authentication request was cancelled</li>
              <li>The authorization code expired</li>
              <li>OAuth provider configuration issues</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please contact support.
          </p>
          
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/signin">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

