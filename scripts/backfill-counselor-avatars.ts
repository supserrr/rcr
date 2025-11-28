/**
 * Backfill counselor avatar URLs in the `profiles` table using Supabase Storage.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx scripts/backfill-counselor-avatars.ts
 */

import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  role: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown> | null;
};

type AvatarObject = {
  name: string;
  created_at: string;
  id: string;
  updated_at: string;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.',
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function listAllAvatarObjects(): Promise<AvatarObject[]> {
  const bucket = supabase.storage.from('avatars');
  const objects: AvatarObject[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await bucket.list('avatars', {
      limit,
      offset,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      throw new Error(
        `Failed to list storage objects: ${error.message || error.name}`,
      );
    }

    if (!data || data.length === 0) {
      break;
    }

    objects.push(...(data as AvatarObject[]));

    if (data.length < limit) {
      break;
    }

    offset += limit;
  }

  return objects;
}

async function main(): Promise<void> {
  console.log('Fetching counselor profiles without avatar URLs...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, role, avatar_url, metadata')
    .eq('role', 'counselor');

  if (error) {
    throw new Error(error.message || 'Failed to fetch profiles');
  }

  const counselorsNeedingAvatar = (profiles ?? []).filter(
    (profile): profile is ProfileRow =>
      (!profile.avatar_url || profile.avatar_url.trim().length === 0) &&
      profile.role === 'counselor',
  );

  if (counselorsNeedingAvatar.length === 0) {
    console.log('[OK] All counselor profiles already have an avatar URL.');
    return;
  }

  console.log(
    `Found ${counselorsNeedingAvatar.length} counselor(s) missing avatar URLs.`,
  );
  console.log('Listing avatar objects from Supabase Storage...');
  const storageObjects = await listAllAvatarObjects();

  const objectByUserId = new Map<string, AvatarObject>();

  for (const object of storageObjects) {
    const [userId] = object.name.split('-');
    if (!userId || userId.length !== 36) {
      continue;
    }

    const existing = objectByUserId.get(userId);
    if (!existing) {
      objectByUserId.set(userId, object);
      continue;
    }

    if (
      new Date(object.created_at).getTime() >
      new Date(existing.created_at).getTime()
    ) {
      objectByUserId.set(userId, object);
    }
  }

  const results: Array<{
    id: string;
    status: 'updated' | 'skipped';
    reason?: string;
  }> = [];

  for (const counselor of counselorsNeedingAvatar) {
    const avatarObject = objectByUserId.get(counselor.id);

    if (!avatarObject) {
      results.push({
        id: counselor.id,
        status: 'skipped',
        reason: 'No matching storage object found',
      });
      continue;
    }

    const path = `avatars/${avatarObject.name}`;
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path);

    const metadata = (counselor.metadata ?? {}) as Record<string, unknown>;
    metadata.avatar_url = publicUrl;
    metadata.avatar = publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', counselor.id);

    if (updateError) {
      results.push({
        id: counselor.id,
        status: 'skipped',
        reason: updateError.message || 'Failed to update profile',
      });
      continue;
    }

    results.push({ id: counselor.id, status: 'updated' });
  }

  const updated = results.filter((result) => result.status === 'updated')
    .length;
  const skipped = results.length - updated;

  console.log('[OK] Backfill complete.');
  console.table(results);
  console.log(
    `Summary: ${updated} updated, ${skipped} skipped (of ${results.length} processed).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[ERROR] Backfill failed:', err);
    process.exit(1);
  });

