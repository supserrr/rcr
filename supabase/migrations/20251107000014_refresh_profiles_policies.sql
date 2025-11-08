-- Migration: Refresh profiles RLS policies to remove recursive lookups

DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        OR role = 'counselor'
        OR assigned_counselor_id = auth.uid()
    );

CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    USING (
        auth.uid() = id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    )
    WITH CHECK (
        auth.uid() = id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

