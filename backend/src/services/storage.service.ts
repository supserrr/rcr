/**
 * Storage service
 * 
 * Handles file uploads and storage using Supabase Storage
 */

import { getSupabaseServiceClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logError, logInfo } from '../utils/logger';

/**
 * Upload file to Supabase Storage
 */
export interface UploadFileOptions {
  bucket: string;
  path: string;
  file: Buffer | Blob | File;
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * Upload file result
 */
export interface UploadFileResult {
  path: string;
  url: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  try {
    const supabase = getSupabaseServiceClient();
    const { bucket, path, file, contentType, metadata } = options;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: contentType || 'application/octet-stream',
      upsert: false, // Don't overwrite existing files
      metadata,
    });

    if (error) {
      logError('File upload error', error);
      throw new AppError(`Failed to upload file: ${error.message}`, 500);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    // Get signed URL (valid for 1 hour)
    const {
      data: signedUrlData,
    } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);

    const signedUrl = signedUrlData?.signedUrl || publicUrl;

    const result: UploadFileResult = {
      path: data.path,
      url: signedUrl,
      publicUrl,
    };

    logInfo('File uploaded successfully', { bucket, path });

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('File upload service error', error);
    throw new AppError('Failed to upload file', 500);
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logError('File deletion error', error);
      throw new AppError(`Failed to delete file: ${error.message}`, 500);
    }

    logInfo('File deleted successfully', { bucket, path });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('File deletion service error', error);
    throw new AppError('Failed to delete file', 500);
  }
}

/**
 * Get signed URL for file download
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const supabase = getSupabaseServiceClient();

    const {
      data: signedUrlData,
      error,
    } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

    if (error || !signedUrlData?.signedUrl) {
      logError('Get signed URL error', error);
      throw new AppError(`Failed to get signed URL: ${error?.message || 'Unknown error'}`, 500);
    }

    return signedUrlData.signedUrl;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError('Get signed URL service error', error);
    throw new AppError('Failed to get signed URL', 500);
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket: string, path: string): string {
  try {
    const supabase = getSupabaseServiceClient();

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    logError('Get public URL error', error);
    throw new AppError('Failed to get public URL', 500);
  }
}

/**
 * Check if file exists in storage
 */
export async function fileExists(bucket: string, path: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 1,
      offset: 0,
    });

    if (error) {
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    logError('File exists check error', error);
    return false;
  }
}

