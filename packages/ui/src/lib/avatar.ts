'use client';

/**
 * Normalize avatar URLs by converting Supabase storage paths into fully-qualified URLs.
 * Falls back to returning the original path when environment variables are not configured.
 */
export const normalizeAvatarUrl = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const withoutLeadingSlash = trimmed.replace(/^\/+/, '');

  if (withoutLeadingSlash.startsWith('storage/v1/object/')) {
    return `${supabaseUrl}/${withoutLeadingSlash}`;
  }

  if (withoutLeadingSlash.startsWith('public/')) {
    return `${supabaseUrl}/storage/v1/object/${withoutLeadingSlash}`;
  }

  if (withoutLeadingSlash.startsWith('avatars/')) {
    return `${supabaseUrl}/storage/v1/object/public/${withoutLeadingSlash}`;
  }

  return `${supabaseUrl}/${withoutLeadingSlash}`;
};


