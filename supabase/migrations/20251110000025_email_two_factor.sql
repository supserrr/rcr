-- Migration: Email-based Two Factor Authentication support
-- Created: 2025-11-10

BEGIN;

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS two_factor_email_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('enable', 'disable', 'login')),
    code_hash TEXT NOT NULL,
    code_salt TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_two_factor_email_codes_active
    ON two_factor_email_codes(user_id, purpose)
    WHERE consumed_at IS NULL;

ALTER TABLE two_factor_email_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own 2FA codes"
    ON two_factor_email_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own 2FA codes"
    ON two_factor_email_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA codes"
    ON two_factor_email_codes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMIT;

