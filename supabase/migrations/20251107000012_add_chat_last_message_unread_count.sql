-- Migration: Add last_message and unread_count columns to chats

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS last_message jsonb;

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;

UPDATE public.chats
SET
    unread_count = COALESCE(unread_count, 0);

