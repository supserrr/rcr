# Notification Operations Playbook

## Overview

The notification system powers in-app alerts for messages, patient assignments, session reminders, and platform announcements. Notifications are stored in the `notifications` table with scheduling metadata (`scheduled_for`, `delivery_status`, `priority`, `channels`) and normalized types defined in `notification_types`.

## Key Notification Types

| Type Key             | Purpose                                 | Default Priority | Default Delay |
|----------------------|------------------------------------------|------------------|---------------|
| `message_received`   | New chat message from a counselor/patient | high             | immediate     |
| `patient_assignment` | Counselor/patient assignment changes     | high/normal      | immediate     |
| `session_reminder`   | Upcoming counseling session reminder     | normal           | 60 minutes    |
| `system_alert`       | Administrative announcements             | critical         | immediate     |

User notification preferences are stored in `profiles.notification_preferences` and mapped automatically when enqueuing events.

## Dispatch Workflow

1. **Event ingestion**
   - Chat messages → `POST /api/notifications/events/message`
   - Session lifecycle (create/update/cancel) → `POST /api/notifications/events/session`
   - Patient assignments trigger a database-level trigger (`trigger_patient_assignment_notifications`) when `profiles.assigned_counselor_id` changes.

2. **Scheduling**
   - `NotificationService.ensureSessionReminderForSession` calculates reminder times using user `support_preferences.reminderLeadTime` or type defaults.
   - All enqueue helpers respect user notification preferences and default delivery channels.

3. **Dispatch**
   - `POST /api/notifications/dispatch` seeds session reminders and marks any due (`delivery_status` in `pending`/`scheduled` with `scheduled_for <= now`) as `sent`.
   - Recommended to run via cron every 5–10 minutes in production.

## Manual Testing

1. **Prerequisites**
   - Export `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a test user ID (`NOTIFICATION_TEST_USER_ID`).
   - Run migrations: `supabase db push` or ensure MCP migrations have been applied.

2. **Smoke Test Script**
   ```bash
   SUPABASE_URL=... \
   SUPABASE_SERVICE_ROLE_KEY=... \
   NOTIFICATION_TEST_USER_ID=... \
   pnpm tsx scripts/test-notification-system.ts
   ```
   Expected output: enqueue status (`pending`/`scheduled`) and number of dispatched notifications.

3. **Notifications Inbox**
   - Send a chat message between two accounts.
   - Verify the recipient sees a live in-app notification with the correct status badge and priority.

## Operational Procedures

- **Cron job (recommended)**
  ```bash
  curl -X POST https://<your-domain>/api/notifications/dispatch
  ```
  Schedule via platform-specific cron (e.g., Vercel Cron, GitHub Actions, or serverless scheduler).

- **Preference overrides**
  - Update `profiles.notification_preferences` JSON to disable specific notification types (`patientMessages`, `sessionReminders`, `systemAlerts`). The dispatcher respects these flags automatically.

- **Monitoring**
  - Track `notifications.delivery_status` for `failed` entries.
  - Review logs via Supabase's `api` service (notifications endpoints) and `postgres` logs for trigger-related errors.

## Troubleshooting

| Symptom                                   | Suggested Action                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------------------|
| 2FA emails not delivered                  | Verify `RESEND_API_KEY` or SMTP credentials, check server logs for delivery errors. |
| Session reminders not appearing           | Confirm cron calls `POST /api/notifications/dispatch`; ensure session status is `scheduled`. |
| Assignment notifications missing          | Verify `profiles.assigned_counselor_id` changed value and trigger exists (`\d t`). |
| Users receive notifications despite opt-out | Inspect `profiles.notification_preferences` for correct boolean flags.             |


