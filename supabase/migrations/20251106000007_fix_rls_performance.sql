/**
 * Fix RLS Performance Issues
 * 
 * Wraps all auth.uid() calls with (select auth.uid()) to prevent
 * re-evaluation for each row, improving query performance at scale.
 * 
 * This fixes the auth_rls_initplan linter warnings.
 */

-- ============================================================================
-- DROP AND RECREATE POLICIES WITH OPTIMIZED auth.uid() CALLS
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING ((select auth.uid()) = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING ((select auth.uid()) = id);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Counselors can view their assigned patients' profiles
DROP POLICY IF EXISTS "Counselors can view assigned patients" ON profiles;
CREATE POLICY "Counselors can view assigned patients"
    ON profiles FOR SELECT
    USING (
        assigned_counselor_id = (select auth.uid()) OR
        id = (select auth.uid())
    );

-- Patients can view their assigned counselor's profile
DROP POLICY IF EXISTS "Patients can view assigned counselor" ON profiles;
CREATE POLICY "Patients can view assigned counselor"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid())
            AND assigned_counselor_id = profiles.id
        ) OR
        id = (select auth.uid())
    );

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Users can view sessions they are involved in
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (
        patient_id = (select auth.uid()) OR
        counselor_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Patients and counselors can create sessions where they are participants
DROP POLICY IF EXISTS "Users can create own sessions" ON sessions;
CREATE POLICY "Users can create own sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        patient_id = (select auth.uid()) OR
        counselor_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can update sessions they are involved in
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
CREATE POLICY "Users can update own sessions"
    ON sessions FOR UPDATE
    USING (
        patient_id = (select auth.uid()) OR
        counselor_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can delete sessions they are involved in
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE
    USING (
        patient_id = (select auth.uid()) OR
        counselor_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

-- Users can view their own resources (even if private)
DROP POLICY IF EXISTS "Users can view own resources" ON resources;
CREATE POLICY "Users can view own resources"
    ON resources FOR SELECT
    USING (publisher = (select auth.uid()));

-- Counselors and admins can create resources
DROP POLICY IF EXISTS "Counselors and admins can create resources" ON resources;
CREATE POLICY "Counselors and admins can create resources"
    ON resources FOR INSERT
    WITH CHECK (
        publisher = (select auth.uid()) AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role IN ('counselor', 'admin')
        )
    );

-- Users can update their own resources
DROP POLICY IF EXISTS "Users can update own resources" ON resources;
CREATE POLICY "Users can update own resources"
    ON resources FOR UPDATE
    USING (publisher = (select auth.uid()));

-- Admins can update any resource
DROP POLICY IF EXISTS "Admins can update any resource" ON resources;
CREATE POLICY "Admins can update any resource"
    ON resources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can delete their own resources
DROP POLICY IF EXISTS "Users can delete own resources" ON resources;
CREATE POLICY "Users can delete own resources"
    ON resources FOR DELETE
    USING (publisher = (select auth.uid()));

-- Admins can delete any resource
DROP POLICY IF EXISTS "Admins can delete any resource" ON resources;
CREATE POLICY "Admins can delete any resource"
    ON resources FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- ============================================================================
-- CHATS POLICIES
-- ============================================================================

-- Users can view chats they are participants in
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
CREATE POLICY "Users can view own chats"
    ON chats FOR SELECT
    USING (
        (select auth.uid()) = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can create chats where they are a participant
DROP POLICY IF EXISTS "Users can create chats" ON chats;
CREATE POLICY "Users can create chats"
    ON chats FOR INSERT
    WITH CHECK (
        (select auth.uid()) = ANY(participants)
    );

-- Users can update chats they are participants in
DROP POLICY IF EXISTS "Users can update own chats" ON chats;
CREATE POLICY "Users can update own chats"
    ON chats FOR UPDATE
    USING (
        (select auth.uid()) = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can delete chats they are participants in
DROP POLICY IF EXISTS "Users can delete own chats" ON chats;
CREATE POLICY "Users can delete own chats"
    ON chats FOR DELETE
    USING (
        (select auth.uid()) = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in chats they are participants in
DROP POLICY IF EXISTS "Users can view messages in own chats" ON messages;
CREATE POLICY "Users can view messages in own chats"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE id = messages.chat_id
            AND (select auth.uid()) = ANY(participants)
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can create messages in chats they are participants in
DROP POLICY IF EXISTS "Users can send messages in own chats" ON messages;
CREATE POLICY "Users can send messages in own chats"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = (select auth.uid()) AND
        EXISTS (
            SELECT 1 FROM chats
            WHERE id = messages.chat_id
            AND (select auth.uid()) = ANY(participants)
        )
    );

-- Users can update their own messages
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (sender_id = (select auth.uid()));

-- Users can delete their own messages
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    USING (
        sender_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Users can update their own notifications (e.g., mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = (select auth.uid()));

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (select auth.uid()) AND role = 'admin'
        )
    );

