'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import {
  Users,
  Calendar,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import {
  AdminApi,
  type Analytics,
  type AdminActivityEntry,
} from '../../../lib/api/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityEntries, setActivityEntries] = useState<AdminActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const statsLoading = authLoading || loading || activityLoading;

  // Load analytics data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setActivityLoading(true);
        setError(null);

        const [analyticsData, activityData] = await Promise.all([
          AdminApi.getAnalytics(),
          AdminApi.listAdminActivity({ limit: 8 }),
        ]);

        setAnalytics(analyticsData);
        setActivityEntries(activityData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load admin dashboard data';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  if (statsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner variant="bars" size={40} className="text-primary" />
          <span className="text-sm text-muted-foreground">Loading admin insights...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading analytics</h3>
        <p className="text-muted-foreground">Please try again later.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Admin Dashboard"
        description="Overview of platform statistics and recent activity"
      />

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Total Users"
          value={analytics.users.total}
          description="Registered users"
          icon={Users}
          trend={
            analytics.users.newThisMonth > 0
              ? { value: analytics.users.newThisMonth, isPositive: true }
              : undefined
          }
          delay={0.1}
        />
        <AnimatedStatCard
          title="Active Sessions"
          value={analytics.sessions.scheduled}
          description="Currently scheduled"
          icon={Calendar}
          trend={
            analytics.sessions.thisMonth > 0
              ? { value: analytics.sessions.thisMonth, isPositive: true }
              : undefined
          }
          delay={0.2}
        />
        <AnimatedStatCard
          title="Completed Sessions"
          value={analytics.sessions.completed}
          description={
            analytics.sessions.thisMonth > 0
              ? `This month: ${analytics.sessions.thisMonth}`
              : 'Completed sessions'
          }
          icon={TrendingUp}
          delay={0.3}
        />
        <AnimatedStatCard
          title="Messages"
          value={analytics.chats.messages}
          description={`${analytics.chats.unread} unread`}
          icon={MessageCircle}
          delay={0.4}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Count</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.patients}</div>
            <p className="text-xs text-muted-foreground">
              Active patients
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counselor Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.counselors}</div>
            <p className="text-xs text-muted-foreground">
              Active counselors
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.resources.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.resources.views.toLocaleString()} total views
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid gap-6">
        {/* Recent Activity */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityEntries.length > 0 ? (
              activityEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{entry.action}</p>
                    {entry.summary ? (
                      <p className="text-xs text-muted-foreground">{entry.summary}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {entry.actorId ? ` • ${entry.actorId.slice(0, 8)}…` : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No recent activity.
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">View Support</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Review Activity</span>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
