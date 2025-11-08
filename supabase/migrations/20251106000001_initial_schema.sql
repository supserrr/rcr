-- Migration: Initial Database Schema
-- Description: Creates all base tables for Rwanda Cancer Relief backend
-- Created: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
-- Note: Supabase Auth manages the auth.users table
-- This table stores additional profile information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'counselor', 'admin', 'guest')) DEFAULT 'guest',
    
    -- Patient-specific fields
    diagnosis TEXT,
    treatment_stage TEXT,
    assigned_counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    date_of_birth DATE,
    
    -- Counselor-specific fields
    specialty TEXT,
    experience_years INTEGER DEFAULT 0,
    availability TEXT CHECK (availability IN ('available', 'busy', 'offline')) DEFAULT 'offline',
    languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    bio TEXT,
    credentials TEXT,
    
    -- Common fields
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in minutes
    type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'chat')) DEFAULT 'video',
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
    notes TEXT,
    jitsi_room_url TEXT,
    jitsi_room_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT patient_counselor_different CHECK (patient_id != counselor_id),
    CONSTRAINT valid_session_time CHECK (date >= CURRENT_DATE)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('audio', 'pdf', 'video', 'article')),
    url TEXT,
    thumbnail TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_public BOOLEAN DEFAULT true,
    publisher UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    youtube_url TEXT,
    content TEXT, -- For article type resources
    category TEXT,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_resource_url CHECK (
        (type = 'article' AND (content IS NOT NULL OR url IS NOT NULL)) OR
        (type != 'article' AND (url IS NOT NULL OR youtube_url IS NOT NULL))
    )
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL CHECK (array_length(participants, 1) = 2), -- Exactly 2 participants
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure participants are valid user IDs
    CONSTRAINT valid_participants CHECK (
        participants[1] != participants[2]
    )
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'file')) DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sender_receiver_different CHECK (sender_id != receiver_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'session_reminder',
        'session_cancelled',
        'session_rescheduled',
        'session_completed',
        'message',
        'resource_recommendation',
        'counselor_assigned',
        'system',
        'other'
    )) DEFAULT 'other',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_counselor ON profiles(assigned_counselor_id) WHERE assigned_counselor_id IS NOT NULL;

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_counselor_id ON sessions(counselor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_date_status ON sessions(date, status);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_is_public ON resources(is_public);
CREATE INDEX IF NOT EXISTS idx_resources_publisher ON resources(publisher);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category) WHERE category IS NOT NULL;

-- Chats indexes
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participants);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

