-- Migration: Align support_tickets foreign key with profiles for joins
-- Created: 2025-11-10

BEGIN;

ALTER TABLE support_tickets
    DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

ALTER TABLE support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

COMMIT;

