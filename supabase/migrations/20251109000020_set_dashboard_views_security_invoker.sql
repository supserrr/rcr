-- Migration: Ensure dashboard analytics views respect row level security
-- Description: Sets security_invoker on exposed analytics views

ALTER VIEW public.resource_summary_metrics SET (security_invoker = true);
ALTER VIEW public.patient_session_stats SET (security_invoker = true);
ALTER VIEW public.counselor_session_stats SET (security_invoker = true);

