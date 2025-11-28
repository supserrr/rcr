/**
 * Notification system smoke test
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... NOTIFICATION_TEST_USER_ID=... pnpm tsx scripts/test-notification-system.ts
 */

import { NotificationService } from '../apps/web/lib/api/notifications';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_DEV_URL ??
  '';

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_KEY ??
  '';

const TEST_USER_ID = process.env.NOTIFICATION_TEST_USER_ID ?? '';

if (!SUPABASE_URL) {
  console.error('[ERROR] Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('[ERROR] Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (!TEST_USER_ID) {
  console.error('[ERROR] Missing NOTIFICATION_TEST_USER_ID pointing to an existing user.');
  process.exit(1);
}

process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_ROLE_KEY;

async function main() {
  console.log('[OK] Running notification enqueue + dispatch smoke test');

  const enqueueResult = await NotificationService.enqueue({
    userId: TEST_USER_ID,
    typeKey: 'system_alert',
    title: 'Notification system test',
    message: 'Triggered by scripts/test-notification-system.ts',
    metadata: {
      trigger: 'test-notification-system.ts',
      timestamp: new Date().toISOString(),
    },
  });

  const dispatched = await NotificationService.dispatchDueNotifications(50);

  console.log(JSON.stringify({ enqueueStatus: enqueueResult.status, dispatched }, null, 2));
  console.log('[OK] Notification smoke test finished');
}

main().catch((error) => {
  console.error('[ERROR] Notification smoke test failed:', error);
  process.exit(1);
});

