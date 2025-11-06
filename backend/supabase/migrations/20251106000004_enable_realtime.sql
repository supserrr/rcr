/**
 * Enable Realtime on tables for real-time subscriptions
 * 
 * This migration enables Supabase Realtime on the messages, notifications, and sessions tables
 * to replace Socket.IO functionality with database subscriptions.
 */

-- Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime on sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Optional: Enable Realtime on chats table for chat updates
ALTER PUBLICATION supabase_realtime ADD TABLE chats;

-- Create indexes for better Realtime performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_counselor_id ON sessions(counselor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);

