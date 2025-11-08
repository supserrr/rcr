/**
 * Consolidate Multiple Permissive RLS Policies
 * 
 * Combines multiple permissive policies for the same role/action into
 * single policies using OR conditions. This improves query performance
 * by reducing the number of policy evaluations per query.
 * 
 * This fixes the multiple_permissive_policies linter warnings.
 */

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Drop existing SELECT policies and create consolidated one
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Counselors can view assigned patients" ON profiles;
DROP POLICY IF EXISTS "Patients can view assigned counselor" ON profiles;

-- Consolidated SELECT policy for profiles
CREATE POLICY "Profiles select policy"
    ON profiles FOR SELECT
    USING (
        -- Users can view their own profile
        (select auth.uid()) = id
        OR
        -- Admins can view all profiles
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'admin'
        )
        OR
        -- Counselors can view assigned patients
        assigned_counselor_id = (select auth.uid())
        OR
        -- Patients can view their assigned counselor's profile
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = (select auth.uid())
            AND p.assigned_counselor_id = profiles.id
        )
    );

-- Drop existing UPDATE policies and create consolidated one
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Consolidated UPDATE policy for profiles
CREATE POLICY "Profiles update policy"
    ON profiles FOR UPDATE
    USING (
        -- Users can update their own profile
        (select auth.uid()) = id
        OR
        -- Admins can update any profile
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'admin'
        )
    );

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

-- Drop existing SELECT policies and create consolidated one
DROP POLICY IF EXISTS "Anyone can view public resources" ON resources;
DROP POLICY IF EXISTS "Users can view own resources" ON resources;

-- Consolidated SELECT policy for resources
CREATE POLICY "Resources select policy"
    ON resources FOR SELECT
    USING (
        -- Anyone can view public resources
        is_public = true
        OR
        -- Users can view their own resources (even if private)
        publisher = (select auth.uid())
    );

-- Drop existing UPDATE policies and create consolidated one
DROP POLICY IF EXISTS "Users can update own resources" ON resources;
DROP POLICY IF EXISTS "Admins can update any resource" ON resources;

-- Consolidated UPDATE policy for resources
CREATE POLICY "Resources update policy"
    ON resources FOR UPDATE
    USING (
        -- Users can update their own resources
        publisher = (select auth.uid())
        OR
        -- Admins can update any resource
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'admin'
        )
    );

-- Drop existing DELETE policies and create consolidated one
DROP POLICY IF EXISTS "Users can delete own resources" ON resources;
DROP POLICY IF EXISTS "Admins can delete any resource" ON resources;

-- Consolidated DELETE policy for resources
CREATE POLICY "Resources delete policy"
    ON resources FOR DELETE
    USING (
        -- Users can delete their own resources
        publisher = (select auth.uid())
        OR
        -- Admins can delete any resource
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'admin'
        )
    );

