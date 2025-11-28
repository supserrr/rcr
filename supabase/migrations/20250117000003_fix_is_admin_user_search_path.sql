-- Migration: Fix is_admin_user function search_path security issue
-- Description: Sets search_path parameter on is_admin_user function to prevent search path injection attacks
-- Created: 2025-01-17
-- 
-- This fixes the security warning: "Function `public.is_admin_user` has a role mutable search_path"
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

BEGIN;

-- Create or replace the is_admin_user function with a fixed search_path
-- If the function doesn't exist, this will create it
-- If it exists, this will replace it with the secure version
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  -- First check JWT role (fastest, no DB query)
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

-- Add comment to document the function
COMMENT ON FUNCTION public.is_admin_user() IS 
  'Checks if the current authenticated user has admin role. Uses SECURITY DEFINER to bypass RLS and has fixed search_path for security.';

COMMIT;

