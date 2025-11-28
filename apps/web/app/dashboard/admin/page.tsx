'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import {
  Users,
  Calendar,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Activity,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import {
  AdminApi,
  type Analytics,
  type AdminActivityEntry,
  type PlatformMetricsOverview,
  type PlatformTrendPoint,
  type TopResourceMetric,
  type SystemHealthStatus,
  type SupportSummary,
} from '../../../lib/api/admin';
import { toast } from 'sonner';

const toPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetricsOverview | null>(null);
  const [trendPoints, setTrendPoints] = useState<PlatformTrendPoint[]>([]);
  const [supportSummary, setSupportSummary] = useState<SupportSummary | null>(null);
  const [topResources, setTopResources] = useState<TopResourceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus[]>([]);
  const [activityEntries, setActivityEntries] = useState<AdminActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [systemHealthLoading, setSystemHealthLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statsLoading =
    authLoading || loading || metricsLoading || systemHealthLoading || activityLoading;

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setMetricsLoading(true);
        setSystemHealthLoading(true);
        setActivityLoading(true);
        setError(null);

        const [
          analyticsData,
          metricsOverview,
          trends,
          support,
          topResourceMetrics,
          systemHealthData,
          activityData,
        ] = await Promise.all([
          AdminApi.getAnalytics(),
          AdminApi.getPlatformMetrics(),
          AdminApi.getDailyTrends(),
          AdminApi.getSupportSummary(),
          AdminApi.getTopResources(),
          AdminApi.listSystemHealth(),
          AdminApi.listAdminActivity({ limit: 8 }),
        ]);

        // Check if component is still mounted before updating state
        if (!isMounted) return;

        setAnalytics(analyticsData);
        setPlatformMetrics(metricsOverview);
        setTrendPoints(trends);
        setSupportSummary(support);
        setTopResources(topResourceMetrics);
        setSystemHealth(systemHealthData);
        setActivityEntries(activityData);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching admin dashboard data:', err);
          const message = err instanceof Error ? err.message : 'Failed to load admin dashboard data';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setMetricsLoading(false);
          setSystemHealthLoading(false);
          setActivityLoading(false);
        }
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const weeklyTrends = useMemo(() => trendPoints.slice(-7), [trendPoints]);

  const retentionRate = useMemo(() => {
    if (!platformMetrics) return 0;
    return toPercent(platformMetrics.activeUsersLast30Days, platformMetrics.totalUsers);
  }, [platformMetrics]);

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

  if (error || !analytics || !platformMetrics) {
    return (
      <div className="py-12 text-center text-red-500">
        <h3 className="mb-2 text-lg font-semibold">Error loading admin analytics</h3>
        <p className="text-muted-foreground">Please try again later.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Admin Dashboard"
        description="Platform-wide metrics, operational alerts, and recent activity"
      />

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Total Users"
          value={analytics.users.total}
          description={`+${analytics.users.newThisMonth} this month`}
          icon={Users}
          trend={
            analytics.users.newThisMonth > 0
              ? { value: analytics.users.newThisMonth, isPositive: true }
              : undefined
          }
          delay={0.1}
        />
        <AnimatedStatCard
          title="Active Users (30d)"
          value={platformMetrics.activeUsersLast30Days}
          description={`Retention ${retentionRate}%`}
          icon={UserCheck}
          delay={0.15}
        />
        <AnimatedStatCard
          title="Session Completion"
          value={`${platformMetrics.sessionCompletionRate}%`}
          description={`${platformMetrics.completedSessions}/${platformMetrics.totalSessions} all-time`}
          icon={TrendingUp}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Support Backlog"
          value={supportSummary ? supportSummary.open + supportSummary.inProgress : 0}
          description={
            supportSummary
              ? `${supportSummary.overdue} overdue · ${supportSummary.avgResolutionHours.toFixed(1)}h avg`
              : 'Support metrics unavailable'
          }
          icon={MessageCircle}
          delay={0.25}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.patients}</div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics.newUsersThisMonth} joined this month
            </p>
          </CardContent>
        </AnimatedCard>
        <AnimatedCard delay={0.35}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counselors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.counselors}</div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics.publicResources} public resources live
            </p>
          </CardContent>
        </AnimatedCard>
        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformMetrics.resourceViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics.resourceDownloads.toLocaleString()} downloads
            </p>
          </CardContent>
        </AnimatedCard>
        <AnimatedCard delay={0.45}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaging</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformMetrics.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformMetrics.unreadMessages} unread conversations
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 30-day Trends */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              30-day Trend Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyTrends.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2 text-left">Date</th>
                      <th className="pb-2 text-right">New users</th>
                      <th className="pb-2 text-right">Sessions</th>
                      <th className="pb-2 text-right">Messages</th>
                      <th className="pb-2 text-right">Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyTrends.map((point) => (
                      <tr key={point.day} className="border-t border-border/40">
                        <td className="py-2">
                          {new Date(point.day).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-2 text-right">{point.newUsers}</td>
                        <td className="py-2 text-right">
                          {point.sessionsCompleted}/{point.sessionsTotal}
                        </td>
                        <td className="py-2 text-right">{point.messagesSent}</td>
                        <td className="py-2 text-right">
                          {point.ticketsCreated}/{point.ticketsResolved}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Trend data will appear once the platform has 30 days of activity.
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Recent Admin Activity */}
        <AnimatedCard delay={0.55}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Admin Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityEntries.length > 0 ? (
              activityEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
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
                No recent admin activity.
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <AnimatedCard delay={0.6}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.length > 0 ? (
              systemHealth.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${getStatusIndicatorClass(item.status)}`} />
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
                No system health records available.
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Top Resources */}
        <AnimatedCard delay={0.65}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topResources.length > 0 ? (
              topResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{resource.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {resource.type} · {resource.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{resource.totalViews.toLocaleString()} views</p>
                    <p>{resource.totalDownloads.toLocaleString()} downloads</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Resource engagement data will appear once content is consumed.
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      {supportSummary ? (
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Support Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <SupportMetric label="Open" value={supportSummary.open} />
            <SupportMetric label="In progress" value={supportSummary.inProgress} />
            <SupportMetric label="Resolved" value={supportSummary.resolved} />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg resolution</p>
              <p className="text-2xl font-bold">{supportSummary.avgResolutionHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">{supportSummary.overdue} overdue</p>
            </div>
          </CardContent>
        </AnimatedCard>
      ) : null}

      {/* Quick Actions */}
      <AnimatedCard delay={0.75}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="flex h-20 flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage users</span>
            </Button>
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Support tickets</span>
            </Button>
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Analytics reports</span>
            </Button>
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">System status</span>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}

function getStatusIndicatorClass(status: SystemHealthStatus['status']) {
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
}

function getSeverityBadgeClasses(severity: SystemHealthStatus['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200';
  }
}

function SupportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
