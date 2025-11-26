-- Migration: Add INSERT policy for counselor_profiles
-- Description: Allows users to create their own counselor profile during onboarding
-- Created: 2025-11-15

BEGIN;

-- Add INSERT policy for counselor_profiles
-- Users can insert their own profile (where profile_id matches their auth.uid())
-- Admins can insert any profile
CREATE POLICY counselor_profiles_insert_policy
    ON public.counselor_profiles FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

COMMIT;

