-- Migration: Allow counselors to access guest profiles when they have sessions with them
-- Description: Updates RLS policy to include 'guest' role in session-based access check
-- Created: 2025-11-16

BEGIN;

-- Drop existing profiles select policy
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;

-- Create updated profiles select policy that allows counselors to see both patient and guest profiles they have sessions with
CREATE POLICY profiles_select_policy
    ON public.profiles FOR SELECT
    USING (
      -- Users can see their own profile
      (SELECT auth.uid()) = id
      -- Admins can see all profiles (using function to avoid recursion)
      OR public.is_current_user_admin()
      -- Anyone can see counselor profiles
      OR role = 'counselor'
      -- Counselors can see patients assigned to them
      OR assigned_counselor_id = (SELECT auth.uid())
      -- Counselors can see patients and guests they have sessions with
      OR (
        role IN ('patient', 'guest')
        AND EXISTS (
          SELECT 1
          FROM public.sessions
          WHERE sessions.patient_id = profiles.id 
            AND sessions.counselor_id = (SELECT auth.uid())
        )
      )
    );

COMMIT;

