/**
 * Create Resources Storage Bucket
 * 
 * Creates the resources bucket in Supabase Storage for resource file uploads.
 * This bucket is used to store audio, video, PDF, and other resource files.
 */

-- Create the resources bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true, -- Public bucket so resources can be accessed
  524288000, -- 500MB file size limit
  ARRAY[
    -- Audio types
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/vorbis',
    'audio/flac',
    -- Video types
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'video/x-flv',
    -- PDF types
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the resources bucket
-- Allow authenticated users to upload resources
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to update their own resources
CREATE POLICY "Users can update own resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to delete their own resources
CREATE POLICY "Users can delete own resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow public read access to resources (since bucket is public)
CREATE POLICY "Public can view resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

