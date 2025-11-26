-- Migration: Fix infinite recursion in profiles RLS policy
-- Description: Creates a security definer function to check admin status without triggering RLS recursion
-- Created: 2025-11-16

BEGIN;

-- Create a security definer function to check if current user is admin
-- This bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check JWT role first (fastest, no DB query)
  IF COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check profile role (bypasses RLS due to SECURITY DEFINER)
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
END;
$$;

-- Drop existing profiles select policy
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;

-- Create updated profiles select policy using the function to avoid recursion
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
      -- Counselors can see patients they have sessions with
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

COMMIT;

