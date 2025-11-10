-- Migration: Strengthen admin profile access visibility
-- Description: Allow authenticated administrators to read all profiles even when JWT role metadata is missing.
-- Created: 2025-11-10

BEGIN;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        OR EXISTS (
            SELECT 1
            FROM public.profiles admin_profile
            WHERE admin_profile.id = auth.uid()
              AND admin_profile.role = 'admin'
        )
        OR role = 'counselor'
        OR assigned_counselor_id = auth.uid()
    );

COMMIT;

