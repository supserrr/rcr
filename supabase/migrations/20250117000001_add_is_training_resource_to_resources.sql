-- Migration: Add is_training_resource field to resources table
-- Description: Separates counselor resources (require review) from admin training resources (no review needed)
-- Created: 2025-01-17

-- Add is_training_resource column to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS is_training_resource BOOLEAN DEFAULT false;

-- Add comment to document the field
COMMENT ON COLUMN resources.is_training_resource IS 'True for admin-created training resources (no review needed), false for counselor resources (require review). Defaults to false for backward compatibility.';

-- Create index for better query performance when filtering by training resources
CREATE INDEX IF NOT EXISTS idx_resources_is_training_resource ON resources(is_training_resource);

