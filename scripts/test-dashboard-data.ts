/**
 * Dashboard data validation script
 *
 * Verifies the presence of dashboard views and seed data.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm test:dashboard-data
 *   # or run within the web workspace
 *   pnpm --filter @apps/web test:dashboard-data
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_DEV_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing Supabase URL (SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL)');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase service role key (SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function validateSessionViews() {
  const { data: patientStats, error: patientError } = await supabase
    .from('patient_session_stats')
    .select('*')
    .limit(1);

  if (patientError) {
    throw patientError;
  }

  const { data: counselorStats, error: counselorError } = await supabase
    .from('counselor_session_stats')
    .select('*')
    .limit(1);

  if (counselorError) {
    throw counselorError;
  }

  console.log(
    `   • patient_session_stats rows: ${patientStats?.length ?? 0}, counselor_session_stats rows: ${
      counselorStats?.length ?? 0
    }`
  );
}

async function validateResourceSummary() {
  const { data, error } = await supabase
    .from('resource_summary_metrics')
    .select('resource_id,total_views,total_downloads')
    .limit(3);

  if (error) {
    throw error;
  }

  await assert(!!data, 'resource_summary_metrics view is empty or inaccessible');
  console.log(`   • resource_summary_metrics rows: ${data?.length ?? 0}`);
}

async function validateSystemHealth() {
  const { data, error } = await supabase
    .from('system_health')
    .select('component,status,severity,last_checked_at')
    .order('component', { ascending: true });

  if (error) {
    throw error;
  }

  await assert((data?.length ?? 0) > 0, 'system_health table has no entries');
  console.log(`   • system_health entries: ${data?.length ?? 0}`);
}

async function validateAdminActivity() {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('id,action,created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  await assert((data?.length ?? 0) > 0, 'admin_activity_log has no entries');
  console.log(`   • admin_activity_log entries: ${data?.length ?? 0}`);
}

async function validatePatientProgress() {
  const { data: progressRows, error } = await supabase
    .from('patient_progress')
    .select('id')
    .limit(1);

  if (error) {
    throw error;
  }

  await assert((progressRows?.length ?? 0) > 0, 'patient_progress has no rows');
  console.log('   • patient_progress entries present');
}

async function main() {
  console.log('\n🧪 Validating dashboard data views...\n');

  try {
    await validateSessionViews();
    await validateResourceSummary();
    await validateSystemHealth();
    await validateAdminActivity();
    await validatePatientProgress();

    console.log('\n✅ Dashboard data validation passed.\n');
  } catch (error) {
    console.error('\n❌ Dashboard data validation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

