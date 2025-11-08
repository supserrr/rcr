<!-- Dashboard data requirements -->

# Dashboard Data Guide

This document explains the additional Supabase tables, views, and tooling that power the patient, counselor, and admin dashboards.

## Database Artifacts

| Artifact | Type | Purpose |
| --- | --- | --- |
| `patient_progress` | Table | Tracks module progress per patient with counselor assignment metadata. |
| `patient_progress_items` | Table | Stores checklist items for each module. |
| `resource_metrics` | Table | Aggregates view/download counts per resource and (optionally) per user. |
| `resource_summary_metrics` | View | Summarises resource metrics for dashboard cards. |
| `patient_session_stats` | View | Aggregated session stats per patient (totals, upcoming, completed). |
| `counselor_session_stats` | View | Aggregated session stats per counselor. |
| `system_health` | Table | Tracks operational status for key subsystems. |
| `admin_activity_log` | Table | Records admin actions for the activity feed. |

Each table/view is created in migration `20251107000015_dashboard_data_infrastructure.sql`.

## Seeding Demo Data

A seed script is provided for local/demo environments:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
pnpm --filter web seed:dashboard
```

The script populates:

- Sample system health entries
- Recent admin activity
- Resource metrics (views/downloads)
- Progress modules for up to three patients

> **Note:** Seeded data uses `demo-` module IDs so it can be safely rerun. Real data is untouched.

## Validating Dashboard Data

Run the dashboard test script to ensure views and tables are reachable:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
pnpm --filter web test:dashboard-data
```

The script checks that:

- Session stats views return data
- Resource summary view is accessible
- System health and admin activity tables contain records
- Patient progress data exists

## Required Environment Variables

Both seed and test scripts require a service role key.

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Project URL (e.g. `https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key with full privileges |

For local development you can also supply `NEXT_PUBLIC_SUPABASE_DEV_URL` and `NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY` for the web app itself.

## Hook & API Usage

- `usePatientProgress`, `useSessionStats`, `useChatSummary`, and `useResourceSummaries` hydrate patient/counselor dashboards.
- `AdminApi.getAnalytics`, `AdminApi.listSystemHealth`, and `AdminApi.listAdminActivity` power the admin dashboard cards.

Refer to:

- `frontend/apps/web/lib/api/progress.ts`
- `frontend/apps/web/lib/api/sessions.ts`
- `frontend/apps/web/lib/api/resources.ts`
- `frontend/apps/web/lib/api/admin.ts`

for implementation details.

## Troubleshooting

- If system health/activity feeds are empty, run the seed script.
- Ensure the authenticated user has an `admin` role to access admin APIs.
- Views rely on Supabase RLS policies; use the service role key for scripts.


