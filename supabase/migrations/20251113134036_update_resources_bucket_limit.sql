/**
 * Update Resources Bucket File Size Limit
 * 
 * Updates the resources bucket to allow larger file uploads.
 * 
 * IMPORTANT: This migration only updates the bucket configuration.
 * The actual file size limit is also controlled by your Supabase plan:
 * - Free Plan: Maximum 50 MB per file (cannot be increased)
 * - Pro Plan: Up to 500 GB per file (configurable)
 * 
 * To increase beyond 50MB, you must upgrade to Pro plan first.
 * 
 * After upgrading, you can also set the global file size limit in:
 * Supabase Dashboard → Storage → Settings → Global file size limit
 */

-- Update the resources bucket file size limit
-- Default: 500MB (524288000 bytes)
-- For Pro plan, you can increase this up to 500GB
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB in bytes (524288000 = 500 * 1024 * 1024)
WHERE id = 'resources';

-- Verify the update
DO $$
DECLARE
  current_limit BIGINT;
  current_limit_mb NUMERIC;
BEGIN
  SELECT file_size_limit INTO current_limit
  FROM storage.buckets
  WHERE id = 'resources';
  
  current_limit_mb := ROUND(current_limit::NUMERIC / 1024 / 1024, 2);
  
  RAISE NOTICE 'Resources bucket file size limit updated to: % MB', current_limit_mb;
END $$;

