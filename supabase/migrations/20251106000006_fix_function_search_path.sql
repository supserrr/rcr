/**
 * Fix Function Search Path Security Issues
 * 
 * Sets search_path parameter on functions to prevent search path injection attacks
 * This fixes the security warnings about mutable search_path
 */

-- ============================================================================
-- Fix update_updated_at_column function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Fix handle_new_user function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'guest')::TEXT,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone_number'
    );
    RETURN NEW;
END;
$$;

