/**
 * Fix RLS Security Issues
 * 
 * Replaces insecure user_metadata references with secure profiles table lookups
 * This fixes the security linter errors about using user_metadata in RLS policies
 */

-- ============================================================================
-- DROP OLD POLICIES THAT USE user_metadata
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Resources policies
DROP POLICY IF EXISTS "Counselors and admins can create resources" ON resources;
DROP POLICY IF EXISTS "Admins can update any resource" ON resources;
DROP POLICY IF EXISTS "Admins can delete any resource" ON resources;

-- Chats policies
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can update own chats" ON chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON chats;

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in own chats" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- ============================================================================
-- CREATE SECURE POLICIES USING profiles TABLE
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Admins can view all profiles (secure - uses profiles table)
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update any profile (secure - uses profiles table)
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Users can view sessions they are involved in (secure - uses profiles table)
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (
        patient_id = auth.uid() OR
        counselor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Patients and counselors can create sessions where they are participants (secure)
CREATE POLICY "Users can create own sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        patient_id = auth.uid() OR
        counselor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can update sessions they are involved in (secure)
CREATE POLICY "Users can update own sessions"
    ON sessions FOR UPDATE
    USING (
        patient_id = auth.uid() OR
        counselor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete sessions they are involved in (secure)
CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE
    USING (
        patient_id = auth.uid() OR
        counselor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

-- Counselors and admins can create resources (secure - uses profiles table)
CREATE POLICY "Counselors and admins can create resources"
    ON resources FOR INSERT
    WITH CHECK (
        publisher = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('counselor', 'admin')
        )
    );

-- Admins can update any resource (secure - uses profiles table)
CREATE POLICY "Admins can update any resource"
    ON resources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete any resource (secure - uses profiles table)
CREATE POLICY "Admins can delete any resource"
    ON resources FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- CHATS POLICIES
-- ============================================================================

-- Users can view chats they are participants in (secure - uses profiles table)
CREATE POLICY "Users can view own chats"
    ON chats FOR SELECT
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can update chats they are participants in (secure)
CREATE POLICY "Users can update own chats"
    ON chats FOR UPDATE
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete chats they are participants in (secure)
CREATE POLICY "Users can delete own chats"
    ON chats FOR DELETE
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in chats they are participants in (secure - uses profiles table)
CREATE POLICY "Users can view messages in own chats"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE id = messages.chat_id
            AND auth.uid() = ANY(participants)
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete their own messages (secure - uses profiles table)
CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications (secure - uses profiles table)
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete their own notifications (secure - uses profiles table)
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

