-- Migration: Restore profiles_select_policy
-- Description: Reverts policy changes to avoid recursive lookups that caused infinite recursion errors.
-- Created: 2025-11-10

BEGIN;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        OR role = 'counselor'
        OR assigned_counselor_id = auth.uid()
    );

COMMIT;

