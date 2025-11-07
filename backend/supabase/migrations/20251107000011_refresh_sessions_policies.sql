-- Migration: Refresh sessions RLS policies to remove recursive profile lookups

DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Sessions select policy" ON public.sessions;
DROP POLICY IF EXISTS "Sessions update policy" ON public.sessions;
DROP POLICY IF EXISTS "Sessions delete policy" ON public.sessions;

-- Allow patients, counselors, and admins to read session records relevant to them.
CREATE POLICY "sessions_select_policy"
    ON public.sessions FOR SELECT
    USING (
        auth.uid() = patient_id
        OR auth.uid() = counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow patients, counselors, and admins to create sessions they participate in.
CREATE POLICY "sessions_insert_policy"
    ON public.sessions FOR INSERT
    WITH CHECK (
        auth.uid() = patient_id
        OR auth.uid() = counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow participants and admins to update sessions.
CREATE POLICY "sessions_update_policy"
    ON public.sessions FOR UPDATE
    USING (
        auth.uid() = patient_id
        OR auth.uid() = counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow participants and admins to delete sessions.
CREATE POLICY "sessions_delete_policy"
    ON public.sessions FOR DELETE
    USING (
        auth.uid() = patient_id
        OR auth.uid() = counselor_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

