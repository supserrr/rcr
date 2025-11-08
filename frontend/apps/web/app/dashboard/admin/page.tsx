'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
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
  type SystemHealthStatus,
  type AdminActivityEntry,
} from '../../../lib/api/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus[]>([]);
  const [systemHealthLoading, setSystemHealthLoading] = useState(true);
  const [activityEntries, setActivityEntries] = useState<AdminActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const statsLoading = authLoading || loading || systemHealthLoading || activityLoading;

  const getStatusIndicatorClass = (status: SystemHealthStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'maintenance':
        return 'bg-purple-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getSeverityBadgeClasses = (severity: SystemHealthStatus['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200';
    }
  };

  // Load analytics data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setSystemHealthLoading(true);
        setActivityLoading(true);
        setError(null);

        const [analyticsData, healthData, activityData] = await Promise.all([
          AdminApi.getAnalytics(),
          AdminApi.listSystemHealth(),
          AdminApi.listAdminActivity({ limit: 8 }),
        ]);

        setAnalytics(analyticsData);
        setSystemHealth(healthData);
        setActivityEntries(activityData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load admin dashboard data';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setSystemHealthLoading(false);
        setActivityLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        description="Overview of platform statistics and system health"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.length > 0 ? (
              systemHealth.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusIndicatorClass(item.status)}`} />
                      <span className="text-sm font-medium capitalize">
                        {item.component.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {item.summary ? (
                      <p className="text-xs text-muted-foreground">{item.summary}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Last checked{' '}
                      {new Date(item.lastCheckedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <Badge className={`${getSeverityBadgeClasses(item.severity)} border`}>
                    {item.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No system health data available.
              </div>
            )}
          </CardContent>
        </AnimatedCard>

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
              <span className="text-sm">System Logs</span>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
