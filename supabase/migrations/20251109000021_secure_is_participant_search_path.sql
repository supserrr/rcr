-- Migration: Secure is_participant function search path
-- Description: Sets an explicit search_path for public.is_participant

ALTER FUNCTION public.is_participant(uuid, uuid)
    SET search_path = public, auth;

