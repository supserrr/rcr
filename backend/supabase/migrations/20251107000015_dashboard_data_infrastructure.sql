-- Migration: Dashboard data infrastructure
-- Description: Adds analytics tables, views, and policies to support dashboard data

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------------------------------------------------------------------
-- Patient Progress tracking
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS patient_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    program_id TEXT,
    module_id TEXT NOT NULL,
    module_title TEXT,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'archived')) DEFAULT 'not_started',
    progress_percent INTEGER NOT NULL CHECK (progress_percent BETWEEN 0 AND 100) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT patient_progress_unique_module UNIQUE (patient_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_progress_patient_id ON patient_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_progress_status ON patient_progress(status);
CREATE INDEX IF NOT EXISTS idx_patient_progress_assigned_counselor ON patient_progress(assigned_counselor_id) WHERE assigned_counselor_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS patient_progress_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    progress_id UUID NOT NULL REFERENCES patient_progress(id) ON DELETE CASCADE,
    item_key TEXT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    order_index INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_progress_items_progress_id ON patient_progress_items(progress_id);
CREATE INDEX IF NOT EXISTS idx_patient_progress_items_status ON patient_progress_items(status);

------------------------------------------------------------------------------
-- Resource engagement metrics
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS resource_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    views_count INTEGER NOT NULL DEFAULT 0,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    first_viewed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT resource_metrics_unique_user UNIQUE (resource_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_metrics_resource_id ON resource_metrics(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_metrics_user_id ON resource_metrics(user_id);

CREATE VIEW resource_summary_metrics AS
SELECT
    r.id AS resource_id,
    r.title,
    r.type,
    r.category,
    r.is_public,
    COALESCE(SUM(m.views_count), 0) AS total_views,
    COALESCE(SUM(m.downloads_count), 0) AS total_downloads,
    MAX(m.last_viewed_at) AS last_viewed_at,
    MAX(m.last_downloaded_at) AS last_downloaded_at
FROM resources r
LEFT JOIN resource_metrics m ON m.resource_id = r.id
GROUP BY r.id, r.title, r.type, r.category, r.is_public;

------------------------------------------------------------------------------
-- Session statistics views
------------------------------------------------------------------------------

CREATE VIEW patient_session_stats AS
SELECT
    s.patient_id AS user_id,
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE s.status IN ('scheduled', 'rescheduled')) AS total_scheduled,
    COUNT(*) FILTER (
        WHERE s.status IN ('scheduled', 'rescheduled')
          AND s.date >= CURRENT_DATE
    ) AS upcoming_sessions,
    COUNT(*) FILTER (WHERE s.status = 'completed') AS completed_sessions,
    COUNT(*) FILTER (WHERE s.status = 'cancelled') AS cancelled_sessions,
    MIN(
        CASE
            WHEN s.status IN ('scheduled', 'rescheduled') AND s.date >= CURRENT_DATE
            THEN s.date + s.time
        END
    ) AS next_session_at,
    MAX(
        CASE
            WHEN s.status = 'completed'
            THEN s.date + s.time
        END
    ) AS last_completed_session_at
FROM sessions s
GROUP BY s.patient_id;

CREATE VIEW counselor_session_stats AS
SELECT
    s.counselor_id AS user_id,
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE s.status IN ('scheduled', 'rescheduled')) AS total_scheduled,
    COUNT(*) FILTER (
        WHERE s.status IN ('scheduled', 'rescheduled')
          AND s.date >= CURRENT_DATE
    ) AS upcoming_sessions,
    COUNT(*) FILTER (WHERE s.status = 'completed') AS completed_sessions,
    COUNT(*) FILTER (WHERE s.status = 'cancelled') AS cancelled_sessions,
    MIN(
        CASE
            WHEN s.status IN ('scheduled', 'rescheduled') AND s.date >= CURRENT_DATE
            THEN s.date + s.time
        END
    ) AS next_session_at,
    MAX(
        CASE
            WHEN s.status = 'completed'
            THEN s.date + s.time
        END
    ) AS last_completed_session_at
FROM sessions s
GROUP BY s.counselor_id;

------------------------------------------------------------------------------
-- System health & admin activity
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('operational', 'degraded', 'maintenance', 'offline')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    summary TEXT,
    details TEXT,
    telemetry JSONB DEFAULT '{}'::JSONB,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT system_health_unique_component UNIQUE (component)
);

CREATE INDEX IF NOT EXISTS idx_system_health_component ON system_health(component);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);

CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    summary TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_actor ON admin_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON admin_activity_log(target_type, target_id);

------------------------------------------------------------------------------
-- Updated at triggers for new tables
------------------------------------------------------------------------------

CREATE TRIGGER update_patient_progress_updated_at
    BEFORE UPDATE ON patient_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_progress_items_updated_at
    BEFORE UPDATE ON patient_progress_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_metrics_updated_at
    BEFORE UPDATE ON resource_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_health_updated_at
    BEFORE UPDATE ON system_health
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------------------------
-- Row Level Security policies
------------------------------------------------------------------------------

ALTER TABLE patient_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_progress_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Patient progress policies
CREATE POLICY patient_progress_select ON patient_progress
    FOR SELECT USING (
        auth.uid() = patient_id
        OR auth.uid() = assigned_counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_insert ON patient_progress
    FOR INSERT WITH CHECK (
        auth.uid() = patient_id
        OR auth.uid() = assigned_counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_update ON patient_progress
    FOR UPDATE USING (
        auth.uid() = patient_id
        OR auth.uid() = assigned_counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    )
    WITH CHECK (
        auth.uid() = patient_id
        OR auth.uid() = assigned_counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_delete ON patient_progress
    FOR DELETE USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

-- Patient progress items policies
CREATE POLICY patient_progress_items_access ON patient_progress_items
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM patient_progress pp
            WHERE pp.id = progress_id
              AND (
                auth.uid() = pp.patient_id
                OR auth.uid() = pp.assigned_counselor_id
                OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM patient_progress pp
            WHERE pp.id = progress_id
              AND (
                auth.uid() = pp.patient_id
                OR auth.uid() = pp.assigned_counselor_id
                OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
              )
        )
    );

-- Resource metrics policies
CREATE POLICY resource_metrics_select ON resource_metrics
    FOR SELECT USING (
        user_id IS NULL
        OR auth.uid() = user_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

CREATE POLICY resource_metrics_upsert ON resource_metrics
    FOR ALL USING (
        auth.uid() = user_id
        OR COALESCE(auth.jwt() ->> 'role', '') IN ('admin', 'counselor')
    )
    WITH CHECK (
        auth.uid() = user_id
        OR COALESCE(auth.jwt() ->> 'role', '') IN ('admin', 'counselor')
    );

-- System health policies (admin only)
CREATE POLICY system_health_admin_access ON system_health
    FOR ALL USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

-- Admin activity log policies (admin only)
CREATE POLICY admin_activity_log_admin_access ON admin_activity_log
    FOR ALL USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

------------------------------------------------------------------------------
-- Grant select on analytics views to authenticated users
------------------------------------------------------------------------------

GRANT SELECT ON patient_session_stats TO authenticated;
GRANT SELECT ON counselor_session_stats TO authenticated;
GRANT SELECT ON resource_summary_metrics TO authenticated;

