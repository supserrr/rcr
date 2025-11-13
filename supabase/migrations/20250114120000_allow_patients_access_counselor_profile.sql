-- Migration: Allow patients to access their assigned counselor profile
-- Description: Updates RLS policies so patients can view their assigned counselor's profile via assigned_counselor_id
-- Created: 2025-01-14

-- Drop existing profiles select policy
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;

-- Create updated profiles select policy
-- Allows:
-- 1. Users to see their own profile
-- 2. Admins to see all profiles
-- 3. Counselors to see all profiles
-- 4. Counselors to see profiles of their assigned patients (existing)
-- 5. Patients to see their assigned counselor's profile (NEW)
CREATE POLICY profiles_select_policy
    ON public.profiles FOR SELECT
    USING (
      -- User can see their own profile
      (SELECT auth.uid()) = id
      -- Admins can see all profiles
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
      -- Counselors can see all profiles (they have broader access)
      OR role = 'counselor'
      -- Counselors can see profiles of patients assigned to them
      OR assigned_counselor_id = (SELECT auth.uid())
      -- Patients can see their assigned counselor's profile (NEW)
      OR id IN (
        SELECT assigned_counselor_id 
        FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND assigned_counselor_id IS NOT NULL
      )
    );

-- Add index to optimize the subquery performance
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_counselor_lookup 
ON public.profiles(assigned_counselor_id) 
WHERE assigned_counselor_id IS NOT NULL;

