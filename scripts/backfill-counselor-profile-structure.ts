import 'dotenv/config';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  metadata: Record<string, unknown> | null;
  languages: string[] | null;
  contact_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  approval_status: string | null;
  visibility_settings: Record<string, unknown> | null;
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

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const toBooleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 't', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', 'f', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
};

const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const toNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toNumberValue(item))
      .filter((item): item is number => typeof item === 'number');
  }
  return [];
};

const parseProfessionalReferences = (value: unknown) =>
  toStringArray(value)
    .map((line) => {
      const [name, organization, email, phone] = line.split('|').map((part) => part.trim());
      if (!name && !organization && !email && !phone) {
        return null;
      }
      return {
        name: name || undefined,
        organization: organization || undefined,
        email: email || undefined,
        phone: phone || undefined,
      };
    })
    .filter((entry): entry is { name?: string; organization?: string; email?: string; phone?: string } => entry !== null);

async function main(): Promise<void> {
  console.log('Loading counselor profiles for backfill...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, metadata, languages, contact_phone, emergency_contact_name, emergency_contact_phone, approval_status, visibility_settings')
    .eq('role', 'counselor');

  if (error) {
    throw new Error(error.message || 'Failed to fetch counselor profiles');
  }

  const pendingUpdates: Array<{ id: string; result: 'updated' | 'skipped'; reason?: string }> = [];

  for (const profile of profiles ?? []) {
    const metadata = (profile.metadata ?? {}) as Record<string, unknown>;

    const serviceRegions = toStringArray(metadata.serviceRegions);
    const supportedTimezones = toStringArray(metadata.supportedTimezones).filter((tz) => tz.length > 0);
    const languages = profile.languages?.length ? profile.languages : toStringArray(metadata.languages);
    const specializations = toStringArray(metadata.specializations);
    const demographicsServed = toStringArray(metadata.demographicsServed ?? metadata.populationsServed);
    const sessionModalities = toStringArray(metadata.sessionModalities ?? metadata.consultationTypes);
    const sessionDurations = toNumberArray(metadata.sessionDurations);
    const professionalHighlights = toStringArray(metadata.professionalHighlights);
    const references = parseProfessionalReferences(metadata.professionalReferencesRaw ?? metadata.professionalReferences);

    const availabilityStatusRaw = toStringValue(metadata.availabilityStatus ?? metadata.availability);
    const availabilityStatus = (availabilityStatusRaw === 'limited' || availabilityStatusRaw === 'waitlist' || availabilityStatusRaw === 'unavailable')
      ? availabilityStatusRaw
      : 'available';

    const acceptingNewPatients = toBooleanValue(metadata.acceptingNewPatients);
    const waitlistEnabled = toBooleanValue(metadata.waitlistEnabled);
    const telehealthOffered = toBooleanValue(metadata.telehealthOffered);
    const inPersonOffered = toBooleanValue(metadata.inPersonOffered ?? metadata.offersInPerson);

    const counselorProfilePayload = {
      profile_id: profile.id,
      practice_name: toStringValue(metadata.practiceName) ?? null,
      practice_location: toStringValue(metadata.practiceLocation) ?? null,
      service_regions: serviceRegions,
      primary_timezone: toStringValue(metadata.primaryTimezone) ?? 'Africa/Kigali',
      supported_timezones: supportedTimezones.length > 0 ? supportedTimezones : ['Africa/Kigali'],
      accepting_new_patients: acceptingNewPatients ?? true,
      waitlist_enabled: waitlistEnabled ?? false,
      availability_status: availabilityStatus,
      session_modalities: sessionModalities.length > 0 ? sessionModalities : ['chat', 'video', 'phone'],
      session_durations: sessionDurations.length > 0 ? sessionDurations : [60],
      telehealth_offered: telehealthOffered ?? true,
      in_person_offered: inPersonOffered ?? false,
      languages,
      specializations,
      demographics_served: demographicsServed,
      approach_summary: toStringValue(metadata.approachSummary) ?? null,
      bio: toStringValue(metadata.bio) ?? null,
      years_experience: toNumberValue(metadata.yearsOfExperience ?? metadata.experience) ?? null,
      professional_highlights: professionalHighlights,
      license_number: toStringValue(metadata.licenseNumber) ?? null,
      license_jurisdiction: toStringValue(metadata.licenseJurisdiction) ?? null,
      license_expiry: toStringValue(metadata.licenseExpiry) ?? null,
      license_document_url: toStringValue(metadata.licenseDocumentUrl ?? metadata.licenseFileName) ?? null,
      resume_url: toStringValue(metadata.resumeFileName) ?? null,
      certification_documents: Array.isArray(metadata.certificationFileNames)
        ? (metadata.certificationFileNames as string[]).map((name) => ({ name }))
        : [],
      cpd_status: toStringValue(metadata.cpdStatus) ?? null,
      cpd_renewal_due_at: toStringValue(metadata.cpdRenewalDueAt) ?? null,
      professional_references: references,
      motivation_statement: toStringValue(metadata.motivation) ?? null,
      emergency_contact_name: toStringValue(metadata.emergencyContactName) ?? null,
      emergency_contact_phone: toStringValue(metadata.emergencyContactPhone) ?? null,
      metadata: {
        resumeFileName: toStringValue(metadata.resumeFileName),
        licenseFileName: toStringValue(metadata.licenseFileName),
      },
    };

    const visibilitySettings = profile.visibility_settings && Object.keys(profile.visibility_settings).length > 0
      ? profile.visibility_settings
      : {
          publicLanding: true,
          patientDirectory: true,
          internal: true,
        };

    const approvalStatus = profile.approval_status ?? (metadata.onboarding_completed ? 'approved' : 'approved');

    const { error: upsertError } = await supabase
      .from('counselor_profiles')
      .upsert({
        ...counselorProfilePayload,
        created_at: undefined,
        updated_at: undefined,
      });

    if (upsertError) {
      pendingUpdates.push({
        id: profile.id,
        result: 'skipped',
        reason: upsertError.message || 'Failed to upsert counselor_profile row',
      });
      continue;
    }

    const profileUpdatePayload: Record<string, unknown> = {
      visibility_settings: visibilitySettings,
      approval_status: approvalStatus,
      contact_phone: counselorProfilePayload.emergency_contact_phone ?? profile.contact_phone ?? null,
      emergency_contact_name: counselorProfilePayload.emergency_contact_name ?? profile.emergency_contact_name ?? null,
      emergency_contact_phone: counselorProfilePayload.emergency_contact_phone ?? profile.emergency_contact_phone ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update(profileUpdatePayload)
      .eq('id', profile.id);

    if (profileUpdateError) {
      pendingUpdates.push({
        id: profile.id,
        result: 'skipped',
        reason: profileUpdateError.message || 'Failed to update profiles row',
      });
      continue;
    }

    pendingUpdates.push({ id: profile.id, result: 'updated' });
  }

  const updatedCount = pendingUpdates.filter((entry) => entry.result === 'updated').length;
  const skippedCount = pendingUpdates.length - updatedCount;

  console.log('[OK] Counselor profile backfill completed.');
  console.table(pendingUpdates);
  console.log(`Summary: ${updatedCount} updated, ${skippedCount} skipped.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[ERROR] Backfill failed:', error);
    process.exit(1);
  });
