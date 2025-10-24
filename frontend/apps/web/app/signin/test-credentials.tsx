'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';

/**
 * Test credentials component for development/demo purposes
 * This shows available test accounts for different user roles
 */
export function TestCredentials() {
  const [showCredentials, setShowCredentials] = useState(false);

  const testAccounts = [
    {
      role: 'Patient',
      email: 'patient@example.com',
      password: 'password123',
      description: 'Access patient dashboard with modules, sessions, and resources'
    },
    {
      role: 'Counselor',
      email: 'counselor@example.com',
      password: 'password123',
      description: 'Access counselor dashboard with patient management and sessions'
    },
    {
      role: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      description: 'Access admin dashboard with user management and analytics'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!showCredentials) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowCredentials(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          Show Test Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Test Accounts</CardTitle>
            <Button
              onClick={() => setShowCredentials(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Use these credentials to test different user roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {testAccounts.map((account) => (
            <div key={account.role} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {account.role}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {account.email}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(account.email)}
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                  >
                    📋
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Password:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {account.password}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(account.password)}
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                  >
                    📋
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {account.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
