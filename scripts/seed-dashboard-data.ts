/**
 * Dashboard seed script
 *
 * Populates demo data for dashboard views using the Supabase service role key.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:dashboard
 *   # or run within the web workspace
 *   pnpm --filter @apps/web seed:dashboard
 */

import { createClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  full_name: string | null;
  assigned_counselor_id: string | null;
};

type ResourceRow = {
  id: string;
  title: string;
};

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

async function seedSystemHealth() {
  const entries = [
    {
      component: 'application_api',
      status: 'operational',
      severity: 'info',
      summary: 'All API endpoints responding normally',
      details: 'Response time <250ms across all regions',
      telemetry: { responseTimeMs: 180, region: 'us-east-1' },
    },
    {
      component: 'video_service',
      status: 'maintenance',
      severity: 'warning',
      summary: 'Scheduled upgrade in progress',
      details: 'Updating Jitsi infrastructure. Expected downtime < 5 minutes.',
      telemetry: { window: '23:00 - 23:30 UTC', contact: 'infra@rcr.org' },
    },
    {
      component: 'email_delivery',
      status: 'degraded',
      severity: 'warning',
      summary: 'Delayed notification delivery detected',
      details: 'Mail queue delayed ~3 minutes. Provider investigating.',
      telemetry: { provider: 'resend', queueDepth: 128 },
    },
    {
      component: 'ai_gateway',
      status: 'operational',
      severity: 'info',
      summary: 'AI assistant responding normally',
      details: 'Latest model: perplexity/sonar, latency 1.2s',
      telemetry: { model: 'perplexity/sonar', avgLatency: 1.2 },
    },
  ];

  await supabase.from('system_health').upsert(
    entries.map((entry) => ({
      ...entry,
      last_checked_at: new Date().toISOString(),
    })),
    { onConflict: 'component' }
  );

  console.log('✅ Seeded system health entries');
}

async function seedAdminActivity() {
  const now = Date.now();
  const entries = [
    {
      action: 'User role updated',
      summary: 'Promoted counselor to admin privileges',
      target_type: 'user',
      target_id: 'counselor-123',
      metadata: { previousRole: 'counselor', newRole: 'admin' },
      created_at: new Date(now - 1000 * 60 * 5).toISOString(),
    },
    {
      action: 'Resource published',
      summary: 'Approved new mindfulness audio guide',
      target_type: 'resource',
      target_id: 'resource-456',
      metadata: { category: 'mindfulness', type: 'audio' },
      created_at: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      action: 'Support ticket resolved',
      summary: 'Closed urgent support ticket',
      target_type: 'support_ticket',
      target_id: 'ticket-789',
      metadata: { priority: 'high' },
      created_at: new Date(now - 1000 * 60 * 90).toISOString(),
    },
    {
      action: 'Session reassigned',
      summary: 'Reassigned session to on-call counselor',
      target_type: 'session',
      target_id: 'session-abc',
      metadata: { reason: 'counselor_unavailable' },
      created_at: new Date(now - 1000 * 60 * 120).toISOString(),
    },
  ];

  await supabase.from('admin_activity_log').insert(entries);
  console.log('✅ Seeded admin activity log');
}

async function seedResourceMetrics() {
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id,title')
    .order('created_at', { ascending: true })
    .limit(3);

  if (error) {
    throw error;
  }

  if (!resources || resources.length === 0) {
    console.warn('⚠️  No resources found — skipping resource metrics seeding');
    return;
  }

  // Clear existing global metrics for these resources to prevent duplicates
  const resourceIds = resources.map((resource) => resource.id);
  await supabase.from('resource_metrics').delete().is('user_id', null).in('resource_id', resourceIds);

  const nowIso = new Date().toISOString();
  const metricsPayload = resources.map((resource, index) => {
    const baseViews = 120 - index * 15;
    const baseDownloads = 30 - index * 5;

    return {
      resource_id: resource.id,
      user_id: null,
      views_count: Math.max(baseViews, 40),
      downloads_count: Math.max(baseDownloads, 5),
      first_viewed_at: nowIso,
      last_viewed_at: nowIso,
      last_downloaded_at: nowIso,
    };
  });

  await supabase.from('resource_metrics').insert(metricsPayload);

  // Update aggregated values on resources table for visibility
  for (const metric of metricsPayload) {
    await supabase
      .from('resources')
      .update({
        views: metric.views_count,
        downloads: metric.downloads_count,
      })
      .eq('id', metric.resource_id);
  }

  console.log('✅ Seeded resource metrics');
}

async function seedPatientProgress() {
  const moduleTemplates = [
    {
      moduleId: 'demo-emotional-support',
      title: 'Emotional Support Basics',
      summary: 'Daily check-ins and journaling exercises',
      progressPercent: 75,
      status: 'in_progress' as const,
      items: [
        { title: 'Daily Journal Entry', status: 'completed' as const, summary: 'Logged reflections for the week' },
        { title: 'Guided Breathing Exercise', status: 'in_progress' as const, summary: 'Scheduled for tomorrow morning' },
      ],
    },
    {
      moduleId: 'demo-treatment-prep',
      title: 'Preparing for Treatment',
      summary: 'Key questions and logistics before chemo',
      progressPercent: 40,
      status: 'in_progress' as const,
      items: [
        { title: 'Questions for Oncologist', status: 'completed' as const, summary: 'Prepared list of 8 questions' },
        { title: 'Logistics Checklist', status: 'not_started' as const, summary: 'Transportation pending confirmation' },
      ],
    },
    {
      moduleId: 'demo-nutrition',
      title: 'Nutrition During Recovery',
      summary: 'Meal planning and hydration goals',
      progressPercent: 100,
      status: 'completed' as const,
      items: [
        { title: 'Hydration Tracker', status: 'completed' as const, summary: 'Maintained goal for 7 days' },
        { title: 'Meal Plan Review', status: 'completed' as const, summary: 'Reviewed with dietician' },
      ],
    },
  ];

  const { data: patients, error: patientsError } = await supabase
    .from('profiles')
    .select('id,full_name,assigned_counselor_id')
    .eq('role', 'patient')
    .limit(3);

  if (patientsError) {
    throw patientsError;
  }

  if (!patients || patients.length === 0) {
    console.warn('⚠️  No patient profiles found — skipping patient progress seeding');
    return;
  }

  const { data: counselors } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'counselor')
    .limit(1);

  const defaultCounselorId = counselors?.[0]?.id ?? null;
  const demoModuleIds = moduleTemplates.map((template) => template.moduleId);

  for (const patient of patients as ProfileRow[]) {
    await supabase
      .from('patient_progress')
      .delete()
      .eq('patient_id', patient.id)
      .in('module_id', demoModuleIds);

    const modulesPayload = moduleTemplates.map((template, index) => ({
      patient_id: patient.id,
      assigned_counselor_id: patient.assigned_counselor_id ?? defaultCounselorId,
      module_id: template.moduleId,
      module_title: template.title,
      status: template.status,
      progress_percent: template.progressPercent,
      metadata: { summary: template.summary },
      started_at: new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 3).toISOString(),
      completed_at:
        template.status === 'completed'
          ? new Date(Date.now() - index * 1000 * 60 * 60 * 24).toISOString()
          : null,
      last_activity_at: new Date(Date.now() - index * 1000 * 60 * 30).toISOString(),
    }));

    const { data: insertedModules, error: modulesError } = await supabase
      .from('patient_progress')
      .insert(modulesPayload)
      .select('id,module_id');

    if (modulesError) {
      throw modulesError;
    }

    const itemsPayload = insertedModules.flatMap((moduleRow) => {
      const template = moduleTemplates.find((item) => item.moduleId === moduleRow.module_id);
      if (!template) {
        return [];
      }
      return template.items.map((item, index) => ({
        progress_id: moduleRow.id,
        item_key: `${moduleRow.module_id}:${index}`,
        title: item.title,
        status: item.status,
        order_index: index,
        metadata: { summary: item.summary },
        completed_at:
          item.status === 'completed'
            ? new Date(Date.now() - index * 1000 * 60 * 45).toISOString()
            : null,
      }));
    });

    if (itemsPayload.length > 0) {
      await supabase.from('patient_progress_items').insert(itemsPayload);
    }

    console.log(`   → Seeded progress for patient ${patient.full_name ?? patient.id}`);
  }

  console.log('✅ Seeded patient progress data');
}

async function main() {
  console.log('🌱 Seeding demo dashboard data...');

  try {
    await seedSystemHealth();
    await seedAdminActivity();
    await seedResourceMetrics();
    await seedPatientProgress();

    console.log('\n✅ Dashboard data seed complete.\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

