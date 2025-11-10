-- Migration: Admin metrics views
-- Description: Adds analytics views to power admin dashboard KPIs
-- Created: 2025-11-10

BEGIN;

-- Overview metrics aggregating key KPIs
CREATE OR REPLACE VIEW admin_metrics_overview AS
WITH user_counts AS (
  SELECT
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE role = 'patient') AS total_patients,
    COUNT(*) FILTER (WHERE role = 'counselor') AS total_counselors,
    COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
    COUNT(*) FILTER (
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ) AS new_users_this_month,
    COUNT(*) FILTER (
      WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
    ) AS active_users_last_30_days
  FROM profiles
),
session_counts AS (
  SELECT
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled_sessions,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_sessions,
    COUNT(*) FILTER (
      WHERE date >= date_trunc('month', CURRENT_DATE)
    ) AS sessions_this_month
  FROM sessions
),
resource_counts AS (
  SELECT
    COUNT(*) AS total_resources,
    COUNT(*) FILTER (WHERE is_public) AS public_resources,
    COUNT(*) FILTER (WHERE NOT is_public) AS private_resources,
    COALESCE(SUM(views), 0) AS total_views,
    COALESCE(SUM(downloads), 0) AS total_downloads
  FROM resources
),
message_counts AS (
  SELECT
    COUNT(*) AS total_chats,
    COALESCE((
      SELECT COUNT(*)
      FROM messages
    ), 0) AS total_messages,
    COALESCE((
      SELECT COUNT(*)
      FROM messages
      WHERE NOT is_read
    ), 0) AS unread_messages
  FROM chats
),
notification_counts AS (
  SELECT
    COUNT(*) AS total_notifications,
    COUNT(*) FILTER (WHERE NOT is_read) AS unread_notifications
  FROM notifications
),
support_counts AS (
  SELECT
    COUNT(*) AS total_tickets,
    COUNT(*) FILTER (WHERE status = 'open') AS open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_tickets,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_tickets,
    COALESCE(
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0),
      0
    ) AS avg_resolution_hours,
    COUNT(*) FILTER (
      WHERE status IN ('open', 'in_progress')
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '48 hours'
    ) AS overdue_tickets
  FROM support_tickets
)
SELECT
  uc.total_users,
  uc.total_patients,
  uc.total_counselors,
  uc.total_admins,
  uc.new_users_this_month,
  uc.active_users_last_30_days,
  sc.total_sessions,
  sc.scheduled_sessions,
  sc.completed_sessions,
  sc.cancelled_sessions,
  sc.sessions_this_month,
  CASE
    WHEN sc.total_sessions > 0
      THEN ROUND((sc.completed_sessions::numeric / sc.total_sessions) * 100, 2)
    ELSE 0
  END AS session_completion_rate,
  rc.total_resources,
  rc.public_resources,
  rc.private_resources,
  rc.total_views AS resource_views,
  rc.total_downloads AS resource_downloads,
  mc.total_chats,
  mc.total_messages,
  mc.unread_messages,
  nc.total_notifications,
  nc.unread_notifications,
  sp.total_tickets,
  sp.open_tickets,
  sp.in_progress_tickets,
  sp.resolved_tickets,
  sp.closed_tickets,
  sp.avg_resolution_hours,
  sp.overdue_tickets
FROM user_counts uc
CROSS JOIN session_counts sc
CROSS JOIN resource_counts rc
CROSS JOIN message_counts mc
CROSS JOIN notification_counts nc
CROSS JOIN support_counts sp;

-- Daily trend metrics for the past 30 days
CREATE OR REPLACE VIEW admin_metrics_daily_trends AS
WITH dates AS (
  SELECT generate_series(
    (CURRENT_DATE - INTERVAL '29 days')::date,
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS day
)
SELECT
  d.day,
  COALESCE(u.new_users, 0) AS new_users,
  COALESCE(u.active_users, 0) AS active_users,
  COALESCE(s.sessions_total, 0) AS sessions_total,
  COALESCE(s.sessions_completed, 0) AS sessions_completed,
  COALESCE(s.sessions_cancelled, 0) AS sessions_cancelled,
  COALESCE(m.message_count, 0) AS messages_sent,
  COALESCE(t.tickets_created, 0) AS tickets_created,
  COALESCE(t.tickets_resolved, 0) AS tickets_resolved
FROM dates d
LEFT JOIN (
  SELECT
    created_at::date AS day,
    COUNT(*) AS new_users,
    COUNT(*) FILTER (
      WHERE updated_at >= created_at
    ) AS active_users
  FROM profiles
  WHERE created_at >= (CURRENT_DATE - INTERVAL '29 days')
  GROUP BY created_at::date
) u ON u.day = d.day
LEFT JOIN (
  SELECT
    date AS day,
    COUNT(*) AS sessions_total,
    COUNT(*) FILTER (WHERE status = 'completed') AS sessions_completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS sessions_cancelled
  FROM sessions
  WHERE date >= (CURRENT_DATE - INTERVAL '29 days')
  GROUP BY date
) s ON s.day = d.day
LEFT JOIN (
  SELECT
    timestamp::date AS day,
    COUNT(*) AS message_count
  FROM messages
  WHERE timestamp >= (CURRENT_DATE - INTERVAL '29 days')
  GROUP BY timestamp::date
) m ON m.day = d.day
LEFT JOIN (
  SELECT
    created_at::date AS day,
    COUNT(*) AS tickets_created,
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) AS tickets_resolved
  FROM support_tickets
  WHERE created_at >= (CURRENT_DATE - INTERVAL '29 days')
  GROUP BY created_at::date
) t ON t.day = d.day;

-- Top resources by engagement
CREATE OR REPLACE VIEW admin_metrics_top_resources AS
SELECT
  r.id,
  r.title,
  r.type,
  r.is_public,
  r.category,
  r.views,
  r.downloads,
  r.created_at,
  COALESCE(rsm.total_views, 0) AS total_views,
  COALESCE(rsm.total_downloads, 0) AS total_downloads,
  rsm.last_viewed_at,
  rsm.last_downloaded_at
FROM resources r
LEFT JOIN resource_summary_metrics rsm
  ON rsm.resource_id = r.id
ORDER BY total_views DESC, r.created_at DESC
LIMIT 10;

-- Ensure anon and authenticated roles can read the views
GRANT SELECT ON admin_metrics_overview TO anon, authenticated;
GRANT SELECT ON admin_metrics_daily_trends TO anon, authenticated;
GRANT SELECT ON admin_metrics_top_resources TO anon, authenticated;

ALTER VIEW admin_metrics_overview SET (security_invoker = true);
ALTER VIEW admin_metrics_daily_trends SET (security_invoker = true);
ALTER VIEW admin_metrics_top_resources SET (security_invoker = true);

COMMIT;

