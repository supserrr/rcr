-- Add publisher_name column to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS publisher_name TEXT;

-- Add comment to document the field
COMMENT ON COLUMN resources.publisher_name IS 'Display name of the publisher/author (for UI display purposes)';

-- Update existing resources to have publisher_name from user profiles if possible
-- This is a best-effort update - we'll set it to NULL for now and let the application populate it
-- when resources are updated

