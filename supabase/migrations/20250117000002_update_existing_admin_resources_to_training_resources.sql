-- Migration: Update existing admin-created resources to training resources
-- Description: Marks all existing resources created by admin users as training resources and publishes them
-- Created: 2025-01-17

-- Update all resources created by admin users to be training resources
-- Set is_training_resource = true, is_public = true, status = 'published', reviewed = true
UPDATE resources r
SET 
  is_training_resource = true,
  is_public = true,
  status = 'published',
  reviewed = true,
  reviewed_at = COALESCE(reviewed_at, NOW()),
  reviewed_by = COALESCE(reviewed_by, r.publisher)
FROM profiles p
WHERE r.publisher = p.id 
  AND p.role = 'admin'
  AND (r.is_training_resource = false OR r.is_training_resource IS NULL);

-- Add comment to document the migration
COMMENT ON COLUMN resources.is_training_resource IS 'True for admin-created training resources (no review needed), false for counselor resources (require review). Defaults to false for backward compatibility. Updated existing admin resources on 2025-01-17.';

