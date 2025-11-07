-- Migration: Add participant metadata columns to chats
-- Description: Aligns chats table with frontend expectations for participant metadata

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS participant_names jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.chats
    ADD COLUMN IF NOT EXISTS participant_avatars jsonb DEFAULT '{}'::jsonb;

-- Ensure existing rows have non-null JSON objects
UPDATE public.chats
SET
    participant_names = COALESCE(participant_names, '{}'::jsonb),
    participant_avatars = COALESCE(participant_avatars, '{}'::jsonb);

-- Optional index to speed lookups by participant metadata keys
CREATE INDEX IF NOT EXISTS idx_chats_participant_names ON public.chats USING GIN (participant_names);
CREATE INDEX IF NOT EXISTS idx_chats_participant_avatars ON public.chats USING GIN (participant_avatars);

