#!/usr/bin/env tsx
/**
 * Configure Resend SMTP in Supabase via Management API
 * 
 * This script helps you configure Resend as your SMTP provider for Supabase.
 * 
 * Usage:
 *   tsx scripts/configure-resend-smtp.ts
 * 
 * Environment Variables Required:
 *   - SUPABASE_ACCESS_TOKEN: Your Supabase access token (get from https://supabase.com/dashboard/account/tokens)
 *   - SUPABASE_PROJECT_REF: Your Supabase project reference (e.g., "bdsepglppqbnazfepvmi")
 *   - RESEND_API_KEY: Your Resend API key
 *   - RESEND_FROM_EMAIL: Your verified Resend email address (e.g., "noreply@yourdomain.com")
 *   - RESEND_FROM_NAME: Your sender name (e.g., "Rwanda Cancer Relief")
 * 
 * Optional:
 *   - RESEND_SMTP_PORT: SMTP port (default: 587)
 */

// Load environment variables
import 'dotenv/config';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'Rwanda Cancer Relief';
const RESEND_SMTP_PORT = process.env.RESEND_SMTP_PORT || '587';

interface SupabaseAuthConfig {
  external_email_enabled: boolean;
  mailer_secure_email_change_enabled: boolean;
  mailer_autoconfirm: boolean;
  smtp_admin_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_sender_name: string;
}

/**
 * Configure Resend SMTP in Supabase
 */
async function configureResendSMTP() {
  // Validate required environment variables
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('[ERROR] Error: SUPABASE_ACCESS_TOKEN is required');
    console.error('   Get it from: https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  if (!SUPABASE_PROJECT_REF) {
    console.error('[ERROR] Error: SUPABASE_PROJECT_REF is required');
    console.error('   Find it in your Supabase project URL: https://supabase.com/dashboard/project/[PROJECT_REF]');
    process.exit(1);
  }

  if (!RESEND_API_KEY) {
    console.error('[ERROR] Error: RESEND_API_KEY is required');
    console.error('   Get it from: https://resend.com/api-keys');
    process.exit(1);
  }

  if (!RESEND_FROM_EMAIL) {
    console.error('[ERROR] Error: RESEND_FROM_EMAIL is required');
    console.error('   Use a verified email address from your Resend account');
    process.exit(1);
  }

  console.log('Configuring Resend SMTP for Supabase...\n');

  const authConfig: SupabaseAuthConfig = {
    external_email_enabled: true,
    mailer_secure_email_change_enabled: true,
    mailer_autoconfirm: false,
    smtp_admin_email: RESEND_FROM_EMAIL,
    smtp_host: 'smtp.resend.com',
    smtp_port: parseInt(RESEND_SMTP_PORT, 10),
    smtp_user: 'resend',
    smtp_pass: RESEND_API_KEY,
    smtp_sender_name: RESEND_FROM_NAME,
  };

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authConfig),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] Failed to configure Resend SMTP:');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Error: ${errorText}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log('[OK] Successfully configured Resend SMTP!\n');
    console.log('Configuration:');
    console.log(`   SMTP Host: ${authConfig.smtp_host}`);
    console.log(`   SMTP Port: ${authConfig.smtp_port}`);
    console.log(`   SMTP User: ${authConfig.smtp_user}`);
    console.log(`   From Email: ${authConfig.smtp_admin_email}`);
    console.log(`   From Name: ${authConfig.smtp_sender_name}`);
    console.log('\nNext steps:');
    console.log('   1. Test password reset in your application');
    console.log('   2. Check Resend dashboard for email logs');
    console.log('   3. Adjust rate limits in Supabase Dashboard → Authentication → Rate Limits');
    console.log('\nNote: Rate limit is set to 30 emails/hour by default.');
    console.log('   Adjust it in Supabase Dashboard based on your Resend plan limits.');
  } catch (error) {
    console.error('[ERROR] Error configuring Resend SMTP:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
    process.exit(1);
  }
}

// Run the configuration
configureResendSMTP().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

