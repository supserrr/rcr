-- Migration: Remove email OTP two-factor artifacts
-- Created: 2025-11-10

BEGIN;

DROP TABLE IF EXISTS two_factor_email_codes;

ALTER TABLE profiles
    DROP COLUMN IF EXISTS two_factor_enabled;

COMMIT;

