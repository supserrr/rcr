-- Migration: Fix admin access to view all patients
-- Description: Allow admins to see all patient profiles by checking their profile role
-- Created: 2025-11-15

BEGIN;

-- Drop existing profiles select policy
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;

-- Create updated profiles select policy that allows admins to see all profiles
CREATE POLICY profiles_select_policy
    ON public.profiles FOR SELECT
    USING (
      -- Users can see their own profile
      (SELECT auth.uid()) = id
      -- Admins via JWT role can see all profiles
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
      -- Admins via profile check can see all profiles (fixes the issue)
      OR EXISTS (
        SELECT 1
        FROM public.profiles admin_profile
        WHERE admin_profile.id = (SELECT auth.uid())
          AND admin_profile.role = 'admin'
      )
      -- Anyone can see counselor profiles
      OR role = 'counselor'
      -- Counselors can see patients assigned to them
      OR assigned_counselor_id = (SELECT auth.uid())
    );

COMMIT;

