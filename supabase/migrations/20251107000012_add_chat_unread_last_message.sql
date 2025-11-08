-- Migration: Add unread count and last message metadata to chats

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS last_message jsonb DEFAULT '{}'::jsonb;

-- Ensure existing rows have initialized values
UPDATE public.chats
SET
    unread_count = COALESCE(unread_count, 0),
    last_message = COALESCE(last_message, '{}'::jsonb);


