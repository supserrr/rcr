-- Migration: Allow counselors to access patient profiles when they have sessions with them
-- Description: Updates RLS policy so counselors can view patient profiles if they have any sessions (scheduled, completed, etc.) with that patient
-- Created: 2025-11-16

BEGIN;

-- Drop existing profiles select policy
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;

-- Create updated profiles select policy that allows counselors to see patients they have sessions with
CREATE POLICY profiles_select_policy
    ON public.profiles FOR SELECT
    USING (
      -- Users can see their own profile
      (SELECT auth.uid()) = id
      -- Admins via JWT role can see all profiles
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
      -- Admins via profile check can see all profiles
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
      -- Counselors can see patients they have sessions with (NEW)
      -- Note: No need to verify user is counselor via profiles table (would cause recursion)
      -- The sessions table RLS already ensures only valid counselors can be counselor_id
      OR (
        role = 'patient'
        AND EXISTS (
          SELECT 1
          FROM public.sessions
          WHERE sessions.patient_id = profiles.id 
            AND sessions.counselor_id = (SELECT auth.uid())
        )
      )
    );

-- Add index to optimize the sessions lookup for counselors (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_sessions_counselor_patient_lookup 
ON public.sessions(counselor_id, patient_id) 
WHERE counselor_id IS NOT NULL AND patient_id IS NOT NULL;

COMMIT;

