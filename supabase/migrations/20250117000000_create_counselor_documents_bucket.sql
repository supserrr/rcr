/**
 * Create Counselor Documents Storage Bucket
 * 
 * Creates the counselor-documents bucket in Supabase Storage for counselor document uploads.
 * This bucket is used to store resumes, licenses, and certifications for counselors.
 * The bucket is private to protect sensitive document information.
 */

-- Create the counselor-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'counselor-documents',
  'counselor-documents',
  false, -- Private bucket to protect sensitive documents
  10485760, -- 10MB file size limit
  ARRAY[
    -- PDF types
    'application/pdf',
    -- Microsoft Office documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
    -- Image types (for scanned documents)
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/bmp',
    -- Text files
    'text/plain',
    'text/rtf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the counselor-documents bucket
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload own counselor documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'counselor-documents' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own counselor documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'counselor-documents' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update own counselor documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'counselor-documents' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete own counselor documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'counselor-documents' AND
  (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Allow admins to read all counselor documents
CREATE POLICY "Admins can read all counselor documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'counselor-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

