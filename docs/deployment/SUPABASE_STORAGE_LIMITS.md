# Supabase Storage File Size Limits

## Current Configuration

The resources bucket is configured with a 500MB file size limit in the migration file, but Supabase enforces different limits based on your plan tier.

## Supabase Storage Limits by Plan

- **Free Plan**: Maximum 50 MB per file
- **Pro Plan and Higher**: Up to 500 GB per file

## How to Increase the File Size Limit

### Option 1: Upgrade Your Supabase Plan (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings** → **Billing**
3. Upgrade to **Pro Plan** or higher
4. After upgrading, configure the global file size limit:
   - Go to **Storage** → **Settings**
   - Set the **Global file size limit** to your desired value (up to 500 GB)

### Option 2: Configure Per-Bucket Limits

Even on the Pro plan, you can set per-bucket limits:

1. In the Supabase Dashboard, go to **Storage**
2. Select the `resources` bucket
3. Click the three vertical dots (overflow menu) → **Edit bucket**
4. Enable **Restrict file size** and set the desired limit
5. The per-bucket limit cannot exceed the global file size limit

### Option 3: Update via SQL Migration

If you need to update the bucket configuration via SQL:

```sql
-- Update the resources bucket file size limit
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB in bytes
WHERE id = 'resources';
```

Or for larger limits (e.g., 5GB):

```sql
UPDATE storage.buckets
SET file_size_limit = 5368709120  -- 5GB in bytes
WHERE id = 'resources';
```

## For Files Larger Than 6MB: Use Resumable Uploads

Supabase recommends using resumable uploads for files larger than 6MB. This provides:
- More reliable transfers
- Support for files up to 50 GB
- Better error recovery

### Implementation Example

```typescript
// Resumable upload for large files
const { data, error } = await supabase.storage
  .from('resources')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
    // Enable resumable upload for large files
    resumable: true,
  });
```

## Current Application Limits

The application currently has these client-side validation limits:
- **Audio files**: 100MB
- **Video files**: 500MB
- **PDF files**: 50MB

These should match your Supabase Storage configuration.

## Troubleshooting

### Error: "The object exceeded the maximum allowed size"

This error occurs when:
1. Your file exceeds the Supabase plan limit (50MB on free tier)
2. Your file exceeds the bucket-specific limit
3. Your file exceeds the global file size limit

**Solutions**:
1. Check your Supabase plan tier
2. Verify the bucket configuration in Supabase Dashboard
3. Compress the file before uploading
4. Use resumable uploads for large files
5. Consider splitting large videos into smaller segments

### Verify Current Limits

Run this SQL query in your Supabase SQL Editor:

```sql
SELECT 
  id,
  name,
  file_size_limit,
  file_size_limit / 1024 / 1024 as file_size_limit_mb
FROM storage.buckets
WHERE id = 'resources';
```

## Migration to Update Limits

To create a new migration that updates the file size limit:

```bash
# Create a new migration file
supabase migration new update_resources_bucket_limit
```

Then add this SQL:

```sql
-- Update resources bucket file size limit to 5GB (adjust as needed)
UPDATE storage.buckets
SET file_size_limit = 5368709120  -- 5GB in bytes
WHERE id = 'resources';
```

Apply the migration:

```bash
supabase db push
```

## Recommendations

1. **For Production**: Upgrade to Pro plan for larger file support
2. **For Development**: Use 50MB limit and compress test files
3. **For Large Videos**: Consider using external storage (S3, Cloudflare R2) or video hosting services
4. **For User Experience**: Implement client-side compression before upload
5. **For Reliability**: Use resumable uploads for files > 6MB

