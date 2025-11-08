-- Migration: Add last_message column to chats for denormalized message data

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS last_message jsonb;

-- Ensure column defaults to null and existing values remain consistent
UPDATE public.chats
SET last_message = NULL
WHERE last_message IS DISTINCT FROM NULL;


