'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { LifeBuoy } from 'lucide-react';

/**
 * Renders the simplified admin systems page while platform-level monitoring is unavailable.
 */
export default function AdminSystemsPage() {
  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="System Management"
        description="Platform monitoring is temporarily unavailable in the dashboard."
      />

      <AnimatedCard delay={0.1}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <LifeBuoy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">System status unavailable</CardTitle>
              <p className="text-sm text-muted-foreground">
                We are focusing on higher-impact admin tooling before bringing system metrics back.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The admin experience no longer includes simulated infrastructure health checks or maintenance logs.
            Monitoring will return once we can surface reliable, actionable data directly from our platform.
          </p>
          <p className="text-sm text-muted-foreground">
            If you notice outages or need operational support, reach out to the platform team with relevant details
            such as timestamps, impacted features, and screenshots when possible.
          </p>
          <div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="mailto:platform@rwandacancerrelief.org">Contact Platform Support</Link>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
