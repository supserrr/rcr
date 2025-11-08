-- Migration: Refresh chat and message RLS policies to remove recursive profile checks

-- Drop existing chat policies
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;

-- Allow participants or admins to view chats
CREATE POLICY "chats_select_policy"
    ON public.chats FOR SELECT
    USING (
        auth.uid() = ANY(participants)
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow participants or admins to create chats
CREATE POLICY "chats_insert_policy"
    ON public.chats FOR INSERT
    WITH CHECK (
        auth.uid() = ANY(participants)
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow participants or admins to update chats
CREATE POLICY "chats_update_policy"
    ON public.chats FOR UPDATE
    USING (
        auth.uid() = ANY(participants)
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow participants or admins to delete chats
CREATE POLICY "chats_delete_policy"
    ON public.chats FOR DELETE
    USING (
        auth.uid() = ANY(participants)
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- Helper predicate: user participates in the message chat
CREATE OR REPLACE FUNCTION public.is_participant(chat_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chats c
    WHERE c.id = chat_id
      AND (user_id = ANY(c.participants)
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin')
  );
$$;

-- Allow chat participants or admins to read messages
CREATE POLICY "messages_select_policy"
    ON public.messages FOR SELECT
    USING (
        public.is_participant(chat_id, auth.uid())
    );

-- Allow participants or admins to insert messages
CREATE POLICY "messages_insert_policy"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND public.is_participant(chat_id, auth.uid())
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow sender or admins to update messages
CREATE POLICY "messages_update_policy"
    ON public.messages FOR UPDATE
    USING (
        sender_id = auth.uid()
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Allow sender or admins to delete messages
CREATE POLICY "messages_delete_policy"
    ON public.messages FOR DELETE
    USING (
        sender_id = auth.uid()
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Ensure function ownership and permissions align
ALTER FUNCTION public.is_participant(uuid, uuid) OWNER TO postgres;


