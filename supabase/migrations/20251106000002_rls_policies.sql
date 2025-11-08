-- Migration: Row Level Security (RLS) Policies
-- Description: Sets up RLS policies for all tables to ensure proper access control
-- Created: 2024

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Counselors can view their assigned patients' profiles
CREATE POLICY "Counselors can view assigned patients"
    ON profiles FOR SELECT
    USING (
        assigned_counselor_id = auth.uid() OR
        id = auth.uid()
    );

-- Patients can view their assigned counselor's profile
CREATE POLICY "Patients can view assigned counselor"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND assigned_counselor_id = profiles.id
        ) OR
        id = auth.uid()
    );

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Users can view sessions they are involved in (as patient or counselor)
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

-- Patients and counselors can create sessions where they are participants
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

-- Users can update sessions they are involved in
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

-- Users can delete sessions they are involved in
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

-- Everyone can view public resources
CREATE POLICY "Anyone can view public resources"
    ON resources FOR SELECT
    USING (is_public = true);

-- Users can view their own resources (even if private)
CREATE POLICY "Users can view own resources"
    ON resources FOR SELECT
    USING (publisher = auth.uid());

-- Counselors and admins can create resources
CREATE POLICY "Counselors and admins can create resources"
    ON resources FOR INSERT
    WITH CHECK (
        publisher = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('counselor', 'admin')
        )
    );

-- Users can update their own resources
CREATE POLICY "Users can update own resources"
    ON resources FOR UPDATE
    USING (publisher = auth.uid());

-- Admins can update any resource
CREATE POLICY "Admins can update any resource"
    ON resources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete their own resources
CREATE POLICY "Users can delete own resources"
    ON resources FOR DELETE
    USING (publisher = auth.uid());

-- Admins can delete any resource
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

-- Users can view chats they are participants in
CREATE POLICY "Users can view own chats"
    ON chats FOR SELECT
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can create chats where they are a participant
CREATE POLICY "Users can create chats"
    ON chats FOR INSERT
    WITH CHECK (
        auth.uid() = ANY(participants)
    );

-- Users can update chats they are participants in
CREATE POLICY "Users can update own chats"
    ON chats FOR UPDATE
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete chats they are participants in
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

-- Users can view messages in chats they are participants in
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

-- Users can create messages in chats they are participants in
CREATE POLICY "Users can send messages in own chats"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chats
            WHERE id = messages.chat_id
            AND auth.uid() = ANY(participants)
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

-- Users can delete their own messages
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

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System (service role) can create notifications for any user
-- Note: This policy allows service role to create notifications
-- For API access, use service role key
CREATE POLICY "Service role can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true); -- Service role bypasses RLS

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

