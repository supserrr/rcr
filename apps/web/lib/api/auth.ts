/**
 * Authentication API service
 * 
 * Handles all authentication-related API calls using Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { User, SignInCredentials, SignUpCredentials } from '../auth';
import type {
  VisibilitySettings,
  CounselorProfileRecord,
  CounselorApprovalStatus,
  CounselorAvailabilityStatus,
  CounselorDocument,
} from '../types';

/**
 * Sign up response
 */
export interface SignUpResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Sign in response
 */
export interface SignInResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  professionalTitle?: string;
  role: 'patient' | 'counselor' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  onboardingCompleted?: boolean;
  preferredLanguage?: string;
  treatmentStage?: string;
  contactPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notificationPreferences?: Record<string, unknown>;
  securityPreferences?: Record<string, unknown>;
  supportPreferences?: Record<string, unknown>;
  visibilitySettings?: VisibilitySettings;
  approvalStatus?: CounselorApprovalStatus;
  approvalSubmittedAt?: string;
  approvalReviewedAt?: string;
  approvalNotes?: string;
  counselorProfile?: CounselorProfileRecord;
}

type ProfileTableRow = {
  metadata?: Record<string, unknown> | null;
  full_name?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  languages?: string[] | null;
  specialty?: string | null;
  experience_years?: number | null;
  availability?: string | null;
  preferred_language?: string | null;
  treatment_stage?: string | null;
  contact_phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notification_preferences?: Record<string, unknown> | null;
  security_preferences?: Record<string, unknown> | null;
  support_preferences?: Record<string, unknown> | null;
  visibility_settings?: VisibilitySettings | null;
  approval_status?: CounselorApprovalStatus | null;
  approval_submitted_at?: string | null;
  approval_reviewed_at?: string | null;
  approval_notes?: string | null;
};

interface SyncProfileOptions {
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
  role?: User['role'];
  isVerified?: boolean;
  specialty?: string;
  experienceYears?: number;
  availability?: string;
  preferredLanguage?: string;
  treatmentStage?: string;
  contactPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notificationPreferences?: Record<string, unknown>;
  securityPreferences?: Record<string, unknown>;
  supportPreferences?: Record<string, unknown>;
  visibilitySettings?: VisibilitySettings;
  approvalStatus?: CounselorApprovalStatus;
  approvalSubmittedAt?: string;
  approvalReviewedAt?: string;
  approvalReviewedBy?: string;
  approvalNotes?: string;
}

const coerceStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const coerceNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const coerceUserRoleValue = (value: unknown): User['role'] | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'patient' || normalized === 'counselor' || normalized === 'admin' || normalized === 'guest') {
    return normalized as User['role'];
  }
  return undefined;
};

const coerceBooleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
};

const getRecordValue = <T>(record: Record<string, unknown> | undefined, key: string): T | undefined => {
  if (!record) {
    return undefined;
  }
  return record[key] as T | undefined;
};

const coerceStringArrayValue = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const normalized = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : undefined;
  }

  return undefined;
};

const coerceRecordValue = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

type CounselorProfileUpdate = Partial<Omit<CounselorProfileRecord, 'profileId' | 'createdAt' | 'updatedAt'>> & {
  metadata?: Record<string, unknown>;
};

type CounselorProfileRow = {
  profile_id: string;
  practice_name: string | null;
  practice_location: string | null;
  service_regions: string[] | null;
  primary_timezone: string | null;
  supported_timezones: string[] | null;
  accepting_new_patients: boolean | null;
  waitlist_enabled: boolean | null;
  availability_status: CounselorAvailabilityStatus | null;
  session_modalities: string[] | null;
  session_durations: number[] | null;
  telehealth_offered: boolean | null;
  in_person_offered: boolean | null;
  languages: string[] | null;
  specializations: string[] | null;
  demographics_served: string[] | null;
  approach_summary: string | null;
  bio: string | null;
  years_experience: number | null;
  professional_highlights: string[] | null;
  education_history: Record<string, unknown>[] | null;
  license_number: string | null;
  license_jurisdiction: string | null;
  license_expiry: string | null;
  license_document_url: string | null;
  resume_url: string | null;
  certification_documents: Record<string, unknown>[] | null;
  cpd_status: string | null;
  cpd_renewal_due_at: string | null;
  professional_references: Record<string, unknown>[] | null;
  motivation_statement: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const mapCounselorProfileRow = (row: CounselorProfileRow): CounselorProfileRecord => {
  return {
    profileId: row.profile_id,
    practiceName: row.practice_name ?? undefined,
    practiceLocation: row.practice_location ?? undefined,
    serviceRegions: row.service_regions ?? [],
    primaryTimezone: row.primary_timezone ?? undefined,
    supportedTimezones: row.supported_timezones ?? [],
    acceptingNewPatients: row.accepting_new_patients ?? true,
    waitlistEnabled: row.waitlist_enabled ?? false,
    availabilityStatus: row.availability_status ?? 'available',
    sessionModalities: row.session_modalities ?? ['chat', 'video', 'phone'],
    sessionDurations: row.session_durations ?? [],
    telehealthOffered: row.telehealth_offered ?? true,
    inPersonOffered: row.in_person_offered ?? false,
    languages: row.languages ?? [],
    specializations: row.specializations ?? [],
    demographicsServed: row.demographics_served ?? [],
    approachSummary: row.approach_summary ?? undefined,
    bio: row.bio ?? undefined,
    yearsExperience: row.years_experience ?? undefined,
    professionalHighlights: row.professional_highlights ?? [],
    educationHistory: Array.isArray(row.education_history) ? row.education_history : [],
    licenseNumber: row.license_number ?? undefined,
    licenseJurisdiction: row.license_jurisdiction ?? undefined,
    licenseExpiry: row.license_expiry ?? undefined,
    licenseDocumentUrl: row.license_document_url ?? undefined,
    resumeUrl: row.resume_url ?? undefined,
    certificationDocuments: Array.isArray(row.certification_documents) ? row.certification_documents : [],
    cpdStatus: row.cpd_status ?? undefined,
    cpdRenewalDueAt: row.cpd_renewal_due_at ?? undefined,
    professionalReferences: Array.isArray(row.professional_references) ? row.professional_references : [],
    motivationStatement: row.motivation_statement ?? undefined,
    emergencyContactName: row.emergency_contact_name ?? undefined,
    emergencyContactPhone: row.emergency_contact_phone ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

type CounselorDocumentRow = {
  id: string;
  profile_id: string;
  document_type: CounselorDocument['documentType'];
  storage_path: string;
  display_name: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: CounselorDocument['status'];
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const mapCounselorDocumentRow = (row: CounselorDocumentRow): CounselorDocument => {
  return {
    id: row.id,
    profileId: row.profile_id,
    documentType: row.document_type,
    storagePath: row.storage_path,
    displayName: row.display_name ?? undefined,
    issuedAt: row.issued_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    status: row.status,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const slugifyForStorage = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
};

const buildDocumentStoragePath = (
  profileId: string,
  type: CounselorDocument['documentType'],
  fileName: string,
): { bucket: string; storagePath: string; objectPath: string } => {
  const bucket = 'counselor-documents';
  const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined;
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const slug = slugifyForStorage(baseName || 'document');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const safeExtension = extension ? extension.toLowerCase() : 'dat';
  const objectPath = `${profileId}/${type}/${timestamp}-${randomSuffix}-${slug}.${safeExtension}`;
  const storagePath = `${bucket}/${objectPath}`;
  return {
    bucket,
    storagePath,
    objectPath,
  };
};

async function syncProfileRecord(
  supabase: SupabaseClient,
  userId: string,
  options: SyncProfileOptions,
): Promise<void> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select(
      'metadata, full_name, avatar_url, phone_number, languages, specialty, experience_years, availability, preferred_language, treatment_stage, contact_phone, emergency_contact_name, emergency_contact_phone, notification_preferences, security_preferences, support_preferences, visibility_settings, approval_status, approval_submitted_at, approval_reviewed_at, approval_notes, approval_reviewed_by',
    )
    .eq('id', userId)
    .maybeSingle<ProfileTableRow & {
      visibility_settings?: VisibilitySettings | null;
      approval_status?: CounselorApprovalStatus | null;
      approval_submitted_at?: string | null;
      approval_reviewed_at?: string | null;
      approval_notes?: string | null;
      approval_reviewed_by?: string | null;
    }>();

  if (fetchError) {
    throw new Error(fetchError.message || 'Failed to load profile record');
  }

  const metadataSources: Array<Record<string, unknown>> = [
    (existingProfile?.metadata ?? {}) as Record<string, unknown>,
    options.userMetadata ?? {},
    options.metadata ?? {},
  ];

  const mergedMetadata = metadataSources.reduce<Record<string, unknown>>((acc, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
    });
    return acc;
  }, {});

  const payload: Record<string, unknown> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };

  const explicitRole = coerceUserRoleValue(options.role);
  const metadataRole = coerceUserRoleValue(getRecordValue(options.metadata, 'role'));
  const userMetadataRole = coerceUserRoleValue(getRecordValue(options.userMetadata, 'role'));
  const effectiveRole = explicitRole ?? metadataRole ?? userMetadataRole;

  if (effectiveRole) {
    payload.role = effectiveRole;
    mergedMetadata.role = effectiveRole;
  } else if (!existingProfile) {
    payload.role = 'guest';
  }

  if (payload.role && mergedMetadata.role !== payload.role) {
    mergedMetadata.role = payload.role;
  }

  const resolvedIsVerified =
    typeof options.isVerified === 'boolean'
      ? options.isVerified
      : coerceBooleanValue(getRecordValue(options.userMetadata, 'email_verified'));

  if (resolvedIsVerified !== undefined) {
    payload.is_verified = resolvedIsVerified;
  }

  if (options.visibilitySettings !== undefined) {
    payload.visibility_settings = options.visibilitySettings;
    mergedMetadata.visibilitySettings = options.visibilitySettings;
  } else if (existingProfile?.visibility_settings) {
    mergedMetadata.visibilitySettings = existingProfile.visibility_settings;
  }

  if (options.approvalStatus !== undefined) {
    payload.approval_status = options.approvalStatus;
    mergedMetadata.approvalStatus = options.approvalStatus;
  } else if (existingProfile?.approval_status) {
    mergedMetadata.approvalStatus = existingProfile.approval_status;
  }

  if (options.approvalSubmittedAt !== undefined) {
    payload.approval_submitted_at = options.approvalSubmittedAt;
    mergedMetadata.approvalSubmittedAt = options.approvalSubmittedAt;
  } else if (existingProfile?.approval_submitted_at) {
    mergedMetadata.approvalSubmittedAt = existingProfile.approval_submitted_at;
  }

  if (options.approvalReviewedAt !== undefined) {
    payload.approval_reviewed_at = options.approvalReviewedAt;
    mergedMetadata.approvalReviewedAt = options.approvalReviewedAt;
  } else if (existingProfile?.approval_reviewed_at) {
    mergedMetadata.approvalReviewedAt = existingProfile.approval_reviewed_at;
  }

  if (options.approvalNotes !== undefined) {
    payload.approval_notes = options.approvalNotes;
    mergedMetadata.approvalNotes = options.approvalNotes;
  } else if (existingProfile?.approval_notes) {
    mergedMetadata.approvalNotes = existingProfile.approval_notes;
  }

  if (options.approvalReviewedBy !== undefined) {
    payload.approval_reviewed_by = options.approvalReviewedBy;
  }

  if (Object.keys(mergedMetadata).length > 0) {
    payload.metadata = mergedMetadata;
  }

  const userMeta = (options.userMetadata ?? {}) as Record<string, unknown>;

  const fallbackFullName =
    coerceStringValue(userMeta['full_name']) ??
    coerceStringValue(userMeta['fullName']) ??
    coerceStringValue(userMeta['name']);

  const fallbackAvatar =
    coerceStringValue(userMeta['avatar_url']) ??
    coerceStringValue(userMeta['avatarUrl']) ??
    coerceStringValue(userMeta['avatar']);

  const fallbackAvailability = coerceStringValue(userMeta['availability']);
  const fallbackSpecialty =
    coerceStringValue(userMeta['specialty']) ?? coerceStringValue(userMeta['expertise']);
  const fallbackExperience = coerceNumberValue(
    userMeta['experience'] ?? userMeta['experienceYears'] ?? userMeta['experience_years'],
  );
  const fallbackPreferredLanguage =
    coerceStringValue(options.metadata?.preferredLanguage) ??
    coerceStringValue(options.metadata?.language) ??
    coerceStringValue(userMeta['preferredLanguage']) ??
    coerceStringValue(userMeta['language']) ??
    coerceStringValue(existingProfile?.preferred_language);
  const fallbackTreatmentStage =
    coerceStringValue(options.metadata?.treatmentStage) ??
    coerceStringValue(userMeta['treatmentStage']) ??
    coerceStringValue(existingProfile?.treatment_stage);
  const fallbackContactPhone =
    coerceStringValue(options.contactPhone) ??
    coerceStringValue(options.metadata?.contactPhone) ??
    coerceStringValue(options.metadata?.phoneNumber) ??
    coerceStringValue(userMeta['contactPhone']) ??
    coerceStringValue(userMeta['phoneNumber']) ??
    coerceStringValue(existingProfile?.contact_phone) ??
    coerceStringValue(existingProfile?.phone_number);
  const fallbackEmergencyContactName =
    coerceStringValue(options.metadata?.emergencyContactName) ??
    coerceStringValue(userMeta['emergencyContactName']) ??
    coerceStringValue(existingProfile?.emergency_contact_name);
  const fallbackEmergencyContactPhone =
    coerceStringValue(options.metadata?.emergencyContactPhone) ??
    coerceStringValue(userMeta['emergencyContactPhone']) ??
    coerceStringValue(existingProfile?.emergency_contact_phone);
  const fallbackNotificationPreferences =
    coerceRecordValue(options.metadata?.notificationPreferences) ??
    coerceRecordValue(userMeta['notificationPreferences']) ??
    coerceRecordValue(userMeta['notification_preferences']) ??
    coerceRecordValue(existingProfile?.notification_preferences ?? undefined);
  const fallbackSecurityPreferences =
    coerceRecordValue(options.metadata?.securityPreferences) ??
    coerceRecordValue(userMeta['securityPreferences']) ??
    coerceRecordValue(userMeta['security_preferences']) ??
    coerceRecordValue(existingProfile?.security_preferences ?? undefined);
  const fallbackSupportPreferences =
    coerceRecordValue(options.metadata?.supportPreferences) ??
    coerceRecordValue(userMeta['supportPreferences']) ??
    coerceRecordValue(userMeta['support_preferences']) ??
    coerceRecordValue(existingProfile?.support_preferences ?? undefined);

  const assignWithFallback = (
    key: string,
    explicit: unknown,
    fallback: unknown,
    existing: unknown,
  ) => {
    if (explicit !== undefined) {
      payload[key] = explicit;
      return;
    }

    if (!existingProfile || existing === null || existing === undefined) {
      if (fallback !== undefined) {
        payload[key] = fallback;
      }
    }
  };

  const explicitFullName = coerceStringValue(options.fullName);
  const explicitAvatar = coerceStringValue(options.avatarUrl);
  const explicitAvailability = coerceStringValue(options.availability);
  const explicitSpecialty = coerceStringValue(options.specialty);
  const explicitExperience = coerceNumberValue(options.experienceYears);
  const explicitPreferredLanguage = coerceStringValue(options.preferredLanguage);
  const explicitTreatmentStage = coerceStringValue(options.treatmentStage);
  const explicitContactPhone = coerceStringValue(options.contactPhone);
  const explicitEmergencyContactName = coerceStringValue(options.emergencyContactName);
  const explicitEmergencyContactPhone = coerceStringValue(options.emergencyContactPhone);
  const explicitNotificationPreferences =
    options.notificationPreferences !== undefined
      ? coerceRecordValue(options.notificationPreferences) ?? {}
      : undefined;
  const explicitSecurityPreferences =
    options.securityPreferences !== undefined
      ? coerceRecordValue(options.securityPreferences) ?? {}
      : undefined;
  const explicitSupportPreferences =
    options.supportPreferences !== undefined
      ? coerceRecordValue(options.supportPreferences) ?? {}
      : undefined;

  assignWithFallback('full_name', explicitFullName, fallbackFullName, existingProfile?.full_name);
  assignWithFallback('avatar_url', explicitAvatar, fallbackAvatar, existingProfile?.avatar_url);
  assignWithFallback(
    'availability',
    explicitAvailability,
    fallbackAvailability,
    existingProfile?.availability,
  );
  assignWithFallback(
    'specialty',
    explicitSpecialty,
    fallbackSpecialty,
    existingProfile?.specialty,
  );
  assignWithFallback(
    'experience_years',
    explicitExperience,
    fallbackExperience,
    existingProfile?.experience_years,
  );
  assignWithFallback(
    'preferred_language',
    explicitPreferredLanguage,
    fallbackPreferredLanguage,
    existingProfile?.preferred_language,
  );
  assignWithFallback(
    'treatment_stage',
    explicitTreatmentStage,
    fallbackTreatmentStage,
    existingProfile?.treatment_stage,
  );
  assignWithFallback(
    'contact_phone',
    explicitContactPhone,
    fallbackContactPhone,
    existingProfile?.contact_phone,
  );
  assignWithFallback(
    'emergency_contact_name',
    explicitEmergencyContactName,
    fallbackEmergencyContactName,
    existingProfile?.emergency_contact_name,
  );
  assignWithFallback(
    'emergency_contact_phone',
    explicitEmergencyContactPhone,
    fallbackEmergencyContactPhone,
    existingProfile?.emergency_contact_phone,
  );

  const isEmptyObject = (value?: Record<string, unknown> | null): boolean =>
    !value || Object.keys(value).length === 0;

  const assignJsonColumn = (
    key: 'notification_preferences' | 'security_preferences' | 'support_preferences',
    explicit?: Record<string, unknown>,
    fallback?: Record<string, unknown>,
    existing?: Record<string, unknown> | null,
  ) => {
    if (explicit !== undefined) {
      payload[key] = explicit;
      return;
    }
    if ((existing === null || existing === undefined || isEmptyObject(existing)) && fallback) {
      payload[key] = fallback;
    }
  };

  assignJsonColumn(
    'notification_preferences',
    explicitNotificationPreferences,
    fallbackNotificationPreferences,
    existingProfile?.notification_preferences ?? null,
  );
  assignJsonColumn(
    'security_preferences',
    explicitSecurityPreferences,
    fallbackSecurityPreferences,
    existingProfile?.security_preferences ?? null,
  );
  assignJsonColumn(
    'support_preferences',
    explicitSupportPreferences,
    fallbackSupportPreferences,
    existingProfile?.support_preferences ?? null,
  );

  const effectivePreferredLanguage =
    explicitPreferredLanguage ?? fallbackPreferredLanguage ?? existingProfile?.preferred_language;
  if (effectivePreferredLanguage) {
    mergedMetadata.preferredLanguage = effectivePreferredLanguage;
  }

  const effectiveTreatmentStage =
    explicitTreatmentStage ?? fallbackTreatmentStage ?? existingProfile?.treatment_stage;
  if (effectiveTreatmentStage) {
    mergedMetadata.treatmentStage = effectiveTreatmentStage;
  }

  const effectiveContactPhone =
    explicitContactPhone ?? fallbackContactPhone ?? existingProfile?.contact_phone;
  if (effectiveContactPhone) {
    mergedMetadata.contactPhone = effectiveContactPhone;
    mergedMetadata.phoneNumber = effectiveContactPhone;
  }

  const effectiveEmergencyContactName =
    explicitEmergencyContactName ??
    fallbackEmergencyContactName ??
    existingProfile?.emergency_contact_name;
  if (effectiveEmergencyContactName) {
    mergedMetadata.emergencyContactName = effectiveEmergencyContactName;
  }

  const effectiveEmergencyContactPhone =
    explicitEmergencyContactPhone ??
    fallbackEmergencyContactPhone ??
    existingProfile?.emergency_contact_phone;
  if (effectiveEmergencyContactPhone) {
    mergedMetadata.emergencyContactPhone = effectiveEmergencyContactPhone;
  }

  const effectiveNotificationPreferences =
    explicitNotificationPreferences ??
    payload.notification_preferences ??
    fallbackNotificationPreferences ??
    (isEmptyObject(existingProfile?.notification_preferences)
      ? undefined
      : (existingProfile?.notification_preferences ?? undefined));
  if (effectiveNotificationPreferences !== undefined) {
    mergedMetadata.notificationPreferences = effectiveNotificationPreferences;
  }

  const effectiveSecurityPreferences =
    explicitSecurityPreferences ??
    payload.security_preferences ??
    fallbackSecurityPreferences ??
    (isEmptyObject(existingProfile?.security_preferences)
      ? undefined
      : (existingProfile?.security_preferences ?? undefined));
  if (effectiveSecurityPreferences !== undefined) {
    mergedMetadata.securityPreferences = effectiveSecurityPreferences;
  }

  const effectiveSupportPreferences =
    explicitSupportPreferences ??
    payload.support_preferences ??
    fallbackSupportPreferences ??
    (isEmptyObject(existingProfile?.support_preferences)
      ? undefined
      : (existingProfile?.support_preferences ?? undefined));
  if (effectiveSupportPreferences !== undefined) {
    mergedMetadata.supportPreferences = effectiveSupportPreferences;
  }

  const payloadKeys = Object.keys(payload).filter((key) => key !== 'id' && key !== 'updated_at');
  const hasMeaningfulUpdate =
    payloadKeys.length > 0 ||
    (payload.metadata !== undefined &&
      JSON.stringify(payload.metadata) !== JSON.stringify(existingProfile?.metadata ?? {}));

  if (!hasMeaningfulUpdate) {
    return;
  }

  const { error: writeError } = existingProfile
    ? await supabase.from('profiles').update(payload).eq('id', userId)
    : await supabase.from('profiles').insert(payload);

  if (writeError) {
    throw new Error(writeError.message || 'Failed to sync profile');
  }
}

async function syncCounselorProfile(
  supabase: SupabaseClient,
  profileId: string,
  input?: CounselorProfileUpdate | null,
): Promise<void> {
  if (!input || Object.keys(input).length === 0) {
    return;
  }

  const payload: Record<string, unknown> = {
    profile_id: profileId,
  };

  const assign = (key: string, value: unknown) => {
    if (value !== undefined) {
      payload[key] = value;
    }
  };

  assign('practice_name', input.practiceName);
  assign('practice_location', input.practiceLocation);
  assign('service_regions', input.serviceRegions);
  assign('primary_timezone', input.primaryTimezone);
  assign('supported_timezones', input.supportedTimezones);
  assign('accepting_new_patients', input.acceptingNewPatients);
  assign('waitlist_enabled', input.waitlistEnabled);
  assign('availability_status', input.availabilityStatus);
  assign('session_modalities', input.sessionModalities);
  assign('session_durations', input.sessionDurations);
  assign('telehealth_offered', input.telehealthOffered);
  assign('in_person_offered', input.inPersonOffered);
  assign('languages', input.languages);
  assign('specializations', input.specializations);
  assign('demographics_served', input.demographicsServed);
  assign('approach_summary', input.approachSummary);
  assign('bio', input.bio);
  assign('years_experience', input.yearsExperience);
  assign('professional_highlights', input.professionalHighlights);
  assign('education_history', input.educationHistory);
  assign('license_number', input.licenseNumber);
  assign('license_jurisdiction', input.licenseJurisdiction);
  assign('license_expiry', input.licenseExpiry);
  assign('license_document_url', input.licenseDocumentUrl);
  assign('resume_url', input.resumeUrl);
  assign('certification_documents', input.certificationDocuments);
  assign('cpd_status', input.cpdStatus);
  assign('cpd_renewal_due_at', input.cpdRenewalDueAt);
  assign('professional_references', input.professionalReferences);
  assign('motivation_statement', input.motivationStatement);
  assign('emergency_contact_name', input.emergencyContactName);
  assign('emergency_contact_phone', input.emergencyContactPhone);
  assign('metadata', input.metadata);

  if (Object.keys(payload).length <= 1) {
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from('counselor_profiles')
    .select('profile_id')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'Failed to load counselor profile');
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('counselor_profiles')
      .update(payload)
      .eq('profile_id', profileId);

    if (updateError) {
      throw new Error(updateError.message || 'Failed to update counselor profile');
    }
  } else {
    const { error: insertError } = await supabase
      .from('counselor_profiles')
      .insert(payload);

    if (insertError) {
      throw new Error(insertError.message || 'Failed to create counselor profile');
    }
  }
}

/**
 * Authentication API service
 */
export class AuthApi {
  /**
   * Sign up a new user using Supabase
   */
  static async signUp(credentials: SignUpCredentials): Promise<SignInResponse> {
    const supabase = createClient();
    if (!supabase) {
      // Check if env vars are actually set
      const hasUrl = typeof window !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_URL : false;
      const hasKey = typeof window !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : false;
      
      throw new Error(
        `Supabase is not configured. ` +
        `URL: ${hasUrl ? 'Set' : 'Missing'}, ` +
        `Key: ${hasKey ? 'Set' : 'Missing'}. ` +
        `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables and redeploy.`
      );
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      options: {
        data: {
          full_name: credentials.name,
        role: credentials.role,
        },
      },
    });

    if (error) {
      // Provide more helpful error messages
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT') || error.message?.includes('invalid_token')) {
        // Log the actual error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('Supabase signUp error:', error);
        }
        throw new Error(
          'Invalid Supabase API key. Please verify: ' +
          '1. NEXT_PUBLIC_SUPABASE_ANON_KEY matches the anon/public key from Supabase Settings → API. ' +
          '2. The key is set in Vercel Environment Variables (not just .env.local). ' +
          '3. You have redeployed after setting the variables. ' +
          '4. The key is the anon/public key (not the service_role key).'
        );
      }
      if (error.message?.includes('Invalid URL') || error.message?.includes('fetch')) {
        throw new Error(
          'Invalid Supabase URL. Please verify: ' +
          '1. NEXT_PUBLIC_SUPABASE_URL is set to https://your-project-id.supabase.co ' +
          '2. The URL is set in Vercel Environment Variables. ' +
          '3. You have redeployed after setting the variables.'
        );
      }
      throw new Error(error.message || 'Failed to create account');
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    // Handle case where email confirmation is required (no session)
    if (!data.session) {
      // Transform user to User type
      const userMetadata = data.user.user_metadata || {};
      const user: User = {
        id: data.user.id,
        email: data.user.email || credentials.email,
        name: userMetadata.full_name || credentials.name,
        role: (userMetadata.role as User['role']) || credentials.role,
        avatar: userMetadata.avatar_url,
        isVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
      };

      // Return with empty tokens - user needs to confirm email
      return {
        user,
        tokens: {
          accessToken: '',
          refreshToken: '',
        },
      };
    }

    // Transform user to User type
    const userMetadata = data.user.user_metadata || {};
    const professionalTitleSignUp =
      coerceStringValue(userMetadata.professionalTitle) ??
      coerceStringValue((userMetadata as Record<string, unknown>).professional_title) ??
      coerceStringValue(userMetadata.title);
    const baseNameSignUp =
      coerceStringValue(userMetadata.full_name) ??
      coerceStringValue(userMetadata.name) ??
      credentials.name ??
      data.user.email ??
      credentials.email;
    const displayNameSignUp = professionalTitleSignUp
      ? `${professionalTitleSignUp} ${baseNameSignUp}`.trim()
      : baseNameSignUp;

    const user: User = {
      id: data.user.id,
      email: data.user.email || credentials.email,
      name: displayNameSignUp,
      title: professionalTitleSignUp,
      role: (userMetadata.role as User['role']) || credentials.role,
      avatar: userMetadata.avatar_url,
      isVerified: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    };

    try {
      await syncProfileRecord(supabase, data.user.id, {
        fullName: displayNameSignUp,
        metadata: { ...userMetadata },
        userMetadata,
        role: user.role,
        isVerified: user.isVerified,
        approvalStatus: user.role === 'counselor' ? 'pending' : undefined,
      });
    } catch (syncError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.signUp] Failed to sync profile', syncError);
      }
    }

    return {
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Sign in an existing user using Supabase
   */
  static async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in');
      }

    if (!data.user || !data.session) {
      throw new Error('Failed to sign in - no user or session returned');
    }

    // Transform user to User type
    const userMetadata = data.user.user_metadata || {};
    const professionalTitleSignIn =
      coerceStringValue(userMetadata.professionalTitle) ??
      coerceStringValue((userMetadata as Record<string, unknown>).professional_title) ??
      coerceStringValue(userMetadata.title);
    const baseNameSignIn =
      coerceStringValue(userMetadata.full_name) ??
      coerceStringValue(userMetadata.name) ??
      data.user.email ??
      '';
    const displayNameSignIn = professionalTitleSignIn
      ? `${professionalTitleSignIn} ${baseNameSignIn}`.trim()
      : baseNameSignIn;

    const user: User = {
      id: data.user.id,
      email: data.user.email || credentials.email,
      name: displayNameSignIn,
      title: professionalTitleSignIn,
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: userMetadata.avatar_url,
      isVerified: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    };

    try {
      await syncProfileRecord(supabase, data.user.id, {
        fullName: displayNameSignIn,
        metadata: { ...userMetadata },
        userMetadata,
        role: user.role,
        isVerified: user.isVerified,
      });
    } catch (syncError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.signIn] Failed to sync profile', syncError);
      }
    }

    return {
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Sign out current user using Supabase
   */
  static async signOut(): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  /**
   * Get the current authenticated user profile using Supabase.
   *
   * @returns The authenticated user or null when no active session is present.
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      const normalizedMessage = error.message?.toLowerCase() ?? '';
      if (
        normalizedMessage.includes('auth session missing') ||
        normalizedMessage.includes('session not found') ||
        normalizedMessage.includes('refresh_token_not_found')
      ) {
        return null;
      }
      throw new Error(error.message || 'Failed to get current user');
    }

    if (!user) {
      return null;
    }

    const userMetadata = user.user_metadata || {};
    const derivedRole = (userMetadata.role as User['role']) || 'patient';
    let mergedMetadata: Record<string, unknown> = { ...userMetadata };
    let displayName = (userMetadata.full_name as string | undefined) || user.email || '';
    let avatarUrl = (userMetadata.avatar_url as string | undefined) || undefined;
    let visibilitySettings: VisibilitySettings | undefined;
    let approvalStatus: CounselorApprovalStatus | undefined;
    let approvalSubmittedAt: string | undefined;
    let approvalReviewedAt: string | undefined;
    let approvalNotes: string | undefined;
    let counselorProfile: CounselorProfileRecord | undefined;
    let counselorDocuments: CounselorDocument[] = [];

    if (user.last_sign_in_at) {
      mergedMetadata.lastSignInAt = user.last_sign_in_at;
    }

    type ProfileRow = {
      full_name?: string | null;
      avatar_url?: string | null;
      metadata?: Record<string, unknown> | null;
      specialty?: string | null;
      experience_years?: number | null;
      availability?: string | null;
      phone_number?: string | null;
      languages?: string[] | null;
      preferred_language?: string | null;
      treatment_stage?: string | null;
      contact_phone?: string | null;
      emergency_contact_name?: string | null;
      emergency_contact_phone?: string | null;
      notification_preferences?: Record<string, unknown> | null;
      security_preferences?: Record<string, unknown> | null;
      support_preferences?: Record<string, unknown> | null;
      visibility_settings?: VisibilitySettings | null;
      approval_status?: CounselorApprovalStatus | null;
      approval_submitted_at?: string | null;
      approval_reviewed_at?: string | null;
      approval_notes?: string | null;
    };

    const { data: profileRow } = await supabase
      .from('profiles')
      .select(
        'full_name, avatar_url, metadata, specialty, experience_years, availability, phone_number, languages, preferred_language, treatment_stage, contact_phone, emergency_contact_name, emergency_contact_phone, notification_preferences, security_preferences, support_preferences, visibility_settings, approval_status, approval_submitted_at, approval_reviewed_at, approval_notes',
      )
      .eq('id', user.id)
      .maybeSingle<ProfileRow>();

    if (profileRow) {
      const profileMetadata = profileRow.metadata ?? {};
      mergedMetadata = {
        ...profileMetadata,
        ...mergedMetadata,
      };

      if (profileRow.full_name) {
        displayName = profileRow.full_name;
      }
      if (profileRow.avatar_url) {
        avatarUrl = profileRow.avatar_url;
      }
      if (profileRow.specialty) {
        mergedMetadata.specialty = profileRow.specialty;
      }
      if (typeof profileRow.experience_years === 'number') {
        mergedMetadata.experience = profileRow.experience_years;
        mergedMetadata.experience_years = profileRow.experience_years;
      }
      if (profileRow.availability) {
        mergedMetadata.availability = profileRow.availability;
      }
      if (profileRow.phone_number) {
        mergedMetadata.phoneNumber = profileRow.phone_number;
      }
      if (Array.isArray(profileRow.languages) && profileRow.languages.length > 0) {
        mergedMetadata.languages = profileRow.languages;
      }
      if (profileRow.preferred_language) {
        mergedMetadata.preferredLanguage = profileRow.preferred_language;
        mergedMetadata.language = profileRow.preferred_language;
      }
      if (profileRow.treatment_stage) {
        mergedMetadata.treatmentStage = profileRow.treatment_stage;
      }
      if (profileRow.contact_phone) {
        mergedMetadata.contactPhone = profileRow.contact_phone;
        mergedMetadata.phoneNumber = profileRow.contact_phone;
      }
      if (profileRow.emergency_contact_name) {
        mergedMetadata.emergencyContactName = profileRow.emergency_contact_name;
      }
      if (profileRow.emergency_contact_phone) {
        mergedMetadata.emergencyContactPhone = profileRow.emergency_contact_phone;
      }
      if (profileRow.notification_preferences) {
        mergedMetadata.notificationPreferences = profileRow.notification_preferences;
      }
      if (profileRow.security_preferences) {
        mergedMetadata.securityPreferences = profileRow.security_preferences;
      }
      if (profileRow.support_preferences) {
        mergedMetadata.supportPreferences = profileRow.support_preferences;
      }
      if (profileRow.visibility_settings) {
        visibilitySettings = profileRow.visibility_settings;
        mergedMetadata.visibilitySettings = profileRow.visibility_settings;
      }
      if (profileRow.approval_status) {
        approvalStatus = profileRow.approval_status;
        mergedMetadata.approvalStatus = profileRow.approval_status;
        mergedMetadata.approval_status = profileRow.approval_status;
      }
      if (profileRow.approval_submitted_at) {
        approvalSubmittedAt = profileRow.approval_submitted_at;
        mergedMetadata.approvalSubmittedAt = profileRow.approval_submitted_at;
      }
      if (profileRow.approval_reviewed_at) {
        approvalReviewedAt = profileRow.approval_reviewed_at;
        mergedMetadata.approvalReviewedAt = profileRow.approval_reviewed_at;
      }
      if (profileRow.approval_notes) {
        approvalNotes = profileRow.approval_notes;
        mergedMetadata.approvalNotes = profileRow.approval_notes;
      }
    }

    if (derivedRole === 'counselor') {
      const { data: counselorProfileRow, error: counselorProfileError } = await supabase
        .from('counselor_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle<CounselorProfileRow>();

      if (counselorProfileError && process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.getCurrentUser] Failed to load counselor profile', counselorProfileError);
      }

      if (counselorProfileRow) {
        counselorProfile = mapCounselorProfileRow(counselorProfileRow);
        mergedMetadata.counselorProfile = counselorProfile;
      }

      const { data: documentsRows, error: documentsError } = await supabase
        .from('counselor_documents')
        .select('*')
        .eq('profile_id', user.id);

      if (documentsError && process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.getCurrentUser] Failed to load counselor documents', documentsError);
      }

      if (Array.isArray(documentsRows) && documentsRows.length > 0) {
        counselorDocuments = documentsRows.map(mapCounselorDocumentRow);

        const documentMetadata = counselorDocuments.map((document) => ({
          label: document.displayName ?? document.documentType,
          url: document.storagePath,
          type: document.documentType,
        }));
        mergedMetadata.uploadedDocuments = documentMetadata;
        mergedMetadata.documents = documentMetadata;

        const resumeDocument = counselorDocuments.find((document) => document.documentType === 'resume');
        if (resumeDocument) {
          mergedMetadata.resumeFile = resumeDocument.storagePath;
          mergedMetadata.resume_file = resumeDocument.storagePath;
        }

        const licenseDocument = counselorDocuments.find((document) => document.documentType === 'license');
        if (licenseDocument) {
          mergedMetadata.licenseFile = licenseDocument.storagePath;
          mergedMetadata.license_file = licenseDocument.storagePath;
        }

        const certificationDocs = counselorDocuments.filter((document) => document.documentType === 'certification');
        if (certificationDocs.length > 0) {
          mergedMetadata.certificationDocuments = certificationDocs.map((document) => ({
            name: document.displayName ?? 'Certification',
            url: document.storagePath,
          }));
          mergedMetadata.certification_documents = mergedMetadata.certificationDocuments;
        }
      }
    }

    if (counselorDocuments.length > 0) {
      const documentMetadata = counselorDocuments.map((document) => ({
        label: document.displayName ?? document.documentType,
        url: document.storagePath,
        type: document.documentType,
      }));
      mergedMetadata.uploadedDocuments = documentMetadata;
      mergedMetadata.documents = documentMetadata;

      const resumeDocument = counselorDocuments.find((document) => document.documentType === 'resume');
      if (resumeDocument) {
        mergedMetadata.resumeFile = resumeDocument.storagePath;
        mergedMetadata.resume_file = resumeDocument.storagePath;
      }

      const licenseDocument = counselorDocuments.find((document) => document.documentType === 'license');
      if (licenseDocument) {
        mergedMetadata.licenseFile = licenseDocument.storagePath;
        mergedMetadata.license_file = licenseDocument.storagePath;
      }

      const certificationDocs = counselorDocuments.filter((document) => document.documentType === 'certification');
      if (certificationDocs.length > 0) {
        mergedMetadata.certificationDocuments = certificationDocs.map((document) => ({
          name: document.displayName ?? 'Certification',
          url: document.storagePath,
        }));
        mergedMetadata.certification_documents = mergedMetadata.certificationDocuments;
      }
    }

    const metadataAvatar =
      coerceStringValue(userMetadata.avatar_url) ??
      coerceStringValue(userMetadata.avatar);
    const shouldSyncAvatar =
      !!metadataAvatar &&
      (!profileRow || profileRow.avatar_url !== metadataAvatar);

    if (shouldSyncAvatar) {
      try {
        await syncProfileRecord(supabase, user.id, {
          avatarUrl: metadataAvatar,
          userMetadata,
          metadata: mergedMetadata,
        });
        avatarUrl = metadataAvatar;
        mergedMetadata.avatar_url = metadataAvatar;
      } catch (syncError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AuthApi.getCurrentUser] Failed to sync avatar', syncError);
        }
      }
    }

    const professionalTitle =
      coerceStringValue(mergedMetadata.professionalTitle) ??
      coerceStringValue((mergedMetadata as Record<string, unknown>).professional_title) ??
      coerceStringValue(mergedMetadata.title);

    if (professionalTitle) {
      mergedMetadata.professionalTitle = professionalTitle;
      mergedMetadata.professional_title = professionalTitle;
      mergedMetadata.title = professionalTitle;
      displayName = displayName ? `${professionalTitle} ${displayName}`.trim() : professionalTitle;
    }

    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: displayName,
      title: professionalTitle ?? undefined,
      role: derivedRole,
      avatar: avatarUrl,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
      metadata: mergedMetadata,
      visibilitySettings,
      approvalStatus,
      approvalSubmittedAt,
      approvalReviewedAt,
      approvalNotes,
      counselorProfile,
      documents: counselorDocuments,
    };

    if (approvalNotes) {
      (userData as User & { approvalNotes?: string }).approvalNotes = approvalNotes;
    }

    if (counselorProfile) {
      (userData as User & { counselorProfile?: CounselorProfileRecord }).counselorProfile = counselorProfile;
    }

    return userData;
  }

  /**
   * Refresh authentication token using Supabase
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error || !session) {
      throw new Error(error?.message || 'Failed to refresh session');
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }

  /**
   * Update user profile using Supabase
   */
  static async updateProfile(data: {
    fullName?: string;
    professionalTitle?: string;
    phoneNumber?: string;
    contactPhone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    preferredLanguage?: string;
    treatmentStage?: string;
    notificationPreferences?: Record<string, unknown>;
    securityPreferences?: Record<string, unknown>;
    supportPreferences?: Record<string, unknown>;
    avatar?: string;
    metadata?: Record<string, unknown>;
    visibilitySettings?: VisibilitySettings;
    approvalStatus?: CounselorApprovalStatus;
    approvalSubmittedAt?: string;
    approvalReviewedAt?: string;
    approvalReviewedBy?: string;
    approvalNotes?: string;
    counselorProfile?: CounselorProfileUpdate;
  }): Promise<User> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user first
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !currentUser) {
      throw new Error(getUserError?.message || 'Failed to get current user');
    }

    const updateData: Record<string, unknown> = {
      ...currentUser.user_metadata,
      ...(data.metadata ?? {}),
    };

    if (data.fullName !== undefined) {
      updateData.full_name = data.fullName;
    }
    if (data.professionalTitle !== undefined) {
      updateData.professionalTitle = data.professionalTitle;
      updateData.professional_title = data.professionalTitle;
      updateData.title = data.professionalTitle;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phone_number = data.phoneNumber;
    }
    if (data.contactPhone !== undefined) {
      updateData.contact_phone = data.contactPhone;
      updateData.contactPhone = data.contactPhone;
    }
    if (data.emergencyContactName !== undefined) {
      updateData.emergency_contact_name = data.emergencyContactName;
      updateData.emergencyContactName = data.emergencyContactName;
    }
    if (data.emergencyContactPhone !== undefined) {
      updateData.emergency_contact_phone = data.emergencyContactPhone;
      updateData.emergencyContactPhone = data.emergencyContactPhone;
    }
    if (data.preferredLanguage !== undefined) {
      updateData.preferred_language = data.preferredLanguage;
      updateData.preferredLanguage = data.preferredLanguage;
      updateData.language = data.preferredLanguage;
    }
    if (data.treatmentStage !== undefined) {
      updateData.treatment_stage = data.treatmentStage;
      updateData.treatmentStage = data.treatmentStage;
    }
    if (data.notificationPreferences !== undefined) {
      updateData.notificationPreferences = data.notificationPreferences;
    }
    if (data.securityPreferences !== undefined) {
      updateData.securityPreferences = data.securityPreferences;
    }
    if (data.supportPreferences !== undefined) {
      updateData.supportPreferences = data.supportPreferences;
    }
    if (data.avatar !== undefined) {
      updateData.avatar_url = data.avatar;
    }
    if (data.visibilitySettings !== undefined) {
      updateData.visibility_settings = data.visibilitySettings;
      updateData.visibilitySettings = data.visibilitySettings;
    }
    if (data.approvalStatus !== undefined) {
      updateData.approval_status = data.approvalStatus;
    }
    if (data.approvalNotes !== undefined) {
      updateData.approval_notes = data.approvalNotes;
    }

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (error || !user) {
      throw new Error(error?.message || 'Failed to update profile');
    }

    const userMetadata = user.user_metadata || {};
    const derivedRole = (userMetadata.role as User['role']) || 'patient';
    const rawMetadata = (data.metadata ?? {}) as Record<string, unknown>;

    const getMetadataString = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const candidate = coerceStringValue(rawMetadata[key]);
        if (candidate) {
          return candidate;
        }
      }
      return undefined;
    };

    const getMetadataNumber = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const candidate = coerceNumberValue(rawMetadata[key]);
        if (candidate !== undefined) {
          return candidate;
        }
      }
      return undefined;
    };

    const getMetadataStringArray = (...keys: string[]): string[] | undefined => {
      for (const key of keys) {
        const candidate = coerceStringArrayValue(rawMetadata[key]);
        if (candidate && candidate.length > 0) {
          return candidate;
        }
      }
      return undefined;
    };

    const sanitizedFullName = coerceStringValue(data.fullName);
    const sanitizedProfessionalTitle =
      coerceStringValue(data.professionalTitle) ??
      getMetadataString('professionalTitle', 'professional_title', 'title') ??
      coerceStringValue(userMetadata.professionalTitle) ??
      coerceStringValue((userMetadata as Record<string, unknown>)['professional_title']) ??
      coerceStringValue(userMetadata.title);
    const sanitizedPhoneNumber =
      coerceStringValue(data.phoneNumber) ??
      coerceStringValue(userMetadata.phone_number) ??
      getMetadataString('phoneNumber', 'phone_number', 'contact_phone', 'phone');
    const sanitizedAvatar =
      coerceStringValue(data.avatar) ??
      coerceStringValue(userMetadata.avatar_url) ??
      coerceStringValue(userMetadata.avatar);
    const sanitizedAvailability =
      getMetadataString('availability') ?? coerceStringValue(userMetadata.availability);
    const sanitizedSpecialty =
      getMetadataString('specialty', 'expertise') ?? coerceStringValue(userMetadata.specialty);
    const sanitizedExperience =
      getMetadataNumber('experience', 'experienceYears', 'experience_years') ??
      coerceNumberValue(userMetadata.experience_years);
    const sanitizedLanguages =
      getMetadataStringArray('languages', 'language_preferences') ??
      coerceStringArrayValue(userMetadata.languages);
    const sanitizedPreferredLanguage =
      coerceStringValue(data.preferredLanguage) ??
      getMetadataString('preferredLanguage', 'language') ??
      coerceStringValue(userMetadata.preferred_language) ??
      coerceStringValue(userMetadata.language);
    const sanitizedTreatmentStage =
      coerceStringValue(data.treatmentStage) ??
      getMetadataString('treatmentStage') ??
      coerceStringValue(userMetadata.treatment_stage);
    const sanitizedContactPhone =
      coerceStringValue(data.contactPhone) ??
      getMetadataString('contactPhone', 'phoneNumber', 'contact_phone', 'phone') ??
      sanitizedPhoneNumber;
    const sanitizedEmergencyContactName =
      coerceStringValue(data.emergencyContactName) ??
      getMetadataString('emergencyContactName') ??
      coerceStringValue(userMetadata.emergency_contact_name);
    const sanitizedEmergencyContactPhone =
      coerceStringValue(data.emergencyContactPhone) ??
      getMetadataString('emergencyContactPhone') ??
      coerceStringValue(userMetadata.emergency_contact_phone);
    const sanitizedNotificationPreferences =
      data.notificationPreferences !== undefined
        ? coerceRecordValue(data.notificationPreferences) ?? {}
        : coerceRecordValue(rawMetadata.notificationPreferences) ??
          coerceRecordValue(userMetadata.notificationPreferences) ??
          coerceRecordValue(userMetadata.notification_preferences);
    const sanitizedSecurityPreferences =
      data.securityPreferences !== undefined
        ? coerceRecordValue(data.securityPreferences) ?? {}
        : coerceRecordValue(rawMetadata.securityPreferences) ??
          coerceRecordValue(userMetadata.securityPreferences) ??
          coerceRecordValue(userMetadata.security_preferences);
    const sanitizedSupportPreferences =
      data.supportPreferences !== undefined
        ? coerceRecordValue(data.supportPreferences) ?? {}
        : coerceRecordValue(rawMetadata.supportPreferences) ??
          coerceRecordValue(userMetadata.supportPreferences) ??
          coerceRecordValue(userMetadata.support_preferences);

    try {
      await syncProfileRecord(supabase, user.id, {
        fullName: sanitizedFullName,
        metadata: {
          ...(data.metadata ?? {}),
          professionalTitle: sanitizedProfessionalTitle ?? undefined,
          title: sanitizedProfessionalTitle ?? undefined,
        },
        avatarUrl: sanitizedAvatar,
        userMetadata,
        availability: sanitizedAvailability,
        specialty: sanitizedSpecialty,
        experienceYears: sanitizedExperience,
        preferredLanguage: sanitizedPreferredLanguage,
        treatmentStage: sanitizedTreatmentStage,
        contactPhone: sanitizedContactPhone,
        emergencyContactName: sanitizedEmergencyContactName,
        emergencyContactPhone: sanitizedEmergencyContactPhone,
        notificationPreferences: sanitizedNotificationPreferences,
        securityPreferences: sanitizedSecurityPreferences,
        supportPreferences: sanitizedSupportPreferences,
        visibilitySettings: data.visibilitySettings,
        approvalStatus: data.approvalStatus,
        approvalSubmittedAt: data.approvalSubmittedAt,
        approvalReviewedAt: data.approvalReviewedAt,
        approvalReviewedBy: data.approvalReviewedBy,
        approvalNotes: data.approvalNotes,
      });
    } catch (syncError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.updateProfile] Failed to sync profile record', syncError);
      }
      // Continue without throwing so onboarding can complete even if profile sync fails
    }

    if (data.counselorProfile && derivedRole === 'counselor') {
      try {
        await syncCounselorProfile(supabase, user.id, data.counselorProfile);
      } catch (counselorSyncError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AuthApi.updateProfile] Failed to sync counselor profile', counselorSyncError);
        }
      }
    }

    const mergedMetadata: Record<string, unknown> = {
      ...userMetadata,
      ...(data.metadata ?? {}),
    };

    if (sanitizedPhoneNumber) {
      mergedMetadata.phoneNumber = sanitizedPhoneNumber;
    }
    if (sanitizedAvailability) {
      mergedMetadata.availability = sanitizedAvailability;
    }
    if (sanitizedSpecialty) {
      mergedMetadata.specialty = sanitizedSpecialty;
    }
    if (sanitizedExperience !== undefined) {
      mergedMetadata.experience = sanitizedExperience;
      mergedMetadata.experience_years = sanitizedExperience;
    }
    if (sanitizedLanguages && sanitizedLanguages.length > 0) {
      mergedMetadata.languages = sanitizedLanguages;
      mergedMetadata.language_preferences = sanitizedLanguages;
    }
    if (sanitizedPreferredLanguage) {
      mergedMetadata.preferredLanguage = sanitizedPreferredLanguage;
      mergedMetadata.language = sanitizedPreferredLanguage;
    }
    if (sanitizedProfessionalTitle) {
      mergedMetadata.professionalTitle = sanitizedProfessionalTitle;
      mergedMetadata.professional_title = sanitizedProfessionalTitle;
      mergedMetadata.title = sanitizedProfessionalTitle;
    }
    if (sanitizedTreatmentStage) {
      mergedMetadata.treatmentStage = sanitizedTreatmentStage;
    }
    if (sanitizedContactPhone) {
      mergedMetadata.contactPhone = sanitizedContactPhone;
      mergedMetadata.phoneNumber = sanitizedContactPhone;
    }
    if (sanitizedEmergencyContactName) {
      mergedMetadata.emergencyContactName = sanitizedEmergencyContactName;
    }
    if (sanitizedEmergencyContactPhone) {
      mergedMetadata.emergencyContactPhone = sanitizedEmergencyContactPhone;
    }
    if (sanitizedNotificationPreferences !== undefined) {
      mergedMetadata.notificationPreferences = sanitizedNotificationPreferences;
    }
    if (sanitizedSecurityPreferences !== undefined) {
      mergedMetadata.securityPreferences = sanitizedSecurityPreferences;
    }
    if (sanitizedSupportPreferences !== undefined) {
      mergedMetadata.supportPreferences = sanitizedSupportPreferences;
    }
    if (sanitizedAvatar) {
      mergedMetadata.avatar_url = sanitizedAvatar;
    } else if (coerceStringValue(userMetadata.avatar_url)) {
      mergedMetadata.avatar_url = coerceStringValue(userMetadata.avatar_url);
    }
    if (data.visibilitySettings) {
      mergedMetadata.visibilitySettings = data.visibilitySettings;
    }
    if (data.approvalStatus) {
      mergedMetadata.approvalStatus = data.approvalStatus;
    }
    if (data.approvalSubmittedAt) {
      mergedMetadata.approvalSubmittedAt = data.approvalSubmittedAt;
    }
    if (data.approvalReviewedAt) {
      mergedMetadata.approvalReviewedAt = data.approvalReviewedAt;
    }
    if (data.approvalNotes) {
      mergedMetadata.approvalNotes = data.approvalNotes;
    }
    if (data.counselorProfile) {
      mergedMetadata.counselorProfile = data.counselorProfile;
    }

    const finalAvatar = sanitizedAvatar || coerceStringValue(userMetadata.avatar_url) || undefined;

    let counselorProfile: CounselorProfileRecord | undefined;
    let counselorDocuments: CounselorDocument[] = [];
    if (derivedRole === 'counselor') {
      const { data: counselorProfileRow } = await supabase
        .from('counselor_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle<CounselorProfileRow>();

      if (counselorProfileRow) {
        counselorProfile = mapCounselorProfileRow(counselorProfileRow);
        mergedMetadata.counselorProfile = counselorProfile;
      }

      const { data: documentsRows, error: documentsError } = await supabase
        .from('counselor_documents')
        .select('*')
        .eq('profile_id', user.id);

      if (documentsError && process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.updateProfile] Failed to load counselor documents', documentsError);
      }

      if (!documentsError && Array.isArray(documentsRows) && documentsRows.length > 0) {
        counselorDocuments = documentsRows.map(mapCounselorDocumentRow);

        const documentMetadata = counselorDocuments.map((document) => ({
          label: document.displayName ?? document.documentType,
          url: document.storagePath,
          type: document.documentType,
        }));
        mergedMetadata.uploadedDocuments = documentMetadata;
        mergedMetadata.documents = documentMetadata;

        const resumeDocument = counselorDocuments.find((document) => document.documentType === 'resume');
        if (resumeDocument) {
          mergedMetadata.resumeFile = resumeDocument.storagePath;
          mergedMetadata.resume_file = resumeDocument.storagePath;
        }

        const licenseDocument = counselorDocuments.find((document) => document.documentType === 'license');
        if (licenseDocument) {
          mergedMetadata.licenseFile = licenseDocument.storagePath;
          mergedMetadata.license_file = licenseDocument.storagePath;
        }

        const certificationDocs = counselorDocuments.filter((document) => document.documentType === 'certification');
        if (certificationDocs.length > 0) {
          mergedMetadata.certificationDocuments = certificationDocs.map((document) => ({
            name: document.displayName ?? 'Certification',
            url: document.storagePath,
          }));
          mergedMetadata.certification_documents = mergedMetadata.certificationDocuments;
        }
      }
    }

    const baseName =
      sanitizedFullName ||
      coerceStringValue(userMetadata.full_name) ||
      coerceStringValue(userMetadata.name) ||
      user.email ||
      '';
    const displayName = sanitizedProfessionalTitle
      ? `${sanitizedProfessionalTitle} ${baseName}`.trim()
      : baseName;

    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: displayName,
      title: sanitizedProfessionalTitle ?? undefined,
      role: derivedRole,
      avatar: finalAvatar,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      metadata: mergedMetadata,
      documents: counselorDocuments,
    } as User & { metadata?: Record<string, unknown> };

    const preferredLanguageValue = coerceStringValue(mergedMetadata.preferredLanguage);
    if (preferredLanguageValue) {
      userData.preferredLanguage = preferredLanguageValue;
    }
    const treatmentStageValue = coerceStringValue(mergedMetadata.treatmentStage);
    if (treatmentStageValue) {
      userData.treatmentStage = treatmentStageValue;
    }
    const contactPhoneValue = coerceStringValue(
      mergedMetadata.contactPhone ?? mergedMetadata.phoneNumber,
    );
    if (contactPhoneValue) {
      userData.contactPhone = contactPhoneValue;
      userData.phoneNumber = contactPhoneValue;
    }
    const emergencyContactNameValue = coerceStringValue(mergedMetadata.emergencyContactName);
    if (emergencyContactNameValue) {
      userData.emergencyContactName = emergencyContactNameValue;
    }
    const emergencyContactPhoneValue = coerceStringValue(mergedMetadata.emergencyContactPhone);
    if (emergencyContactPhoneValue) {
      userData.emergencyContactPhone = emergencyContactPhoneValue;
    }
    const notificationPreferencesValue = coerceRecordValue(
      mergedMetadata.notificationPreferences,
    );
    if (notificationPreferencesValue) {
      userData.notificationPreferences = notificationPreferencesValue;
    }
    const securityPreferencesValue = coerceRecordValue(mergedMetadata.securityPreferences);
    if (securityPreferencesValue) {
      userData.securityPreferences = securityPreferencesValue;
    }
    const supportPreferencesValue = coerceRecordValue(mergedMetadata.supportPreferences);
    if (supportPreferencesValue) {
      userData.supportPreferences = supportPreferencesValue;
    }

    const effectiveVisibilitySettings =
      data.visibilitySettings ??
      (coerceRecordValue(mergedMetadata.visibilitySettings) as VisibilitySettings | undefined);
    if (effectiveVisibilitySettings) {
      userData.visibilitySettings = effectiveVisibilitySettings;
    }

    const effectiveApprovalStatus =
      data.approvalStatus ??
      (coerceStringValue(mergedMetadata.approvalStatus) as CounselorApprovalStatus | undefined);
    if (effectiveApprovalStatus) {
      userData.approvalStatus = effectiveApprovalStatus;
    }

    const effectiveApprovalSubmittedAt = data.approvalSubmittedAt ?? coerceStringValue(mergedMetadata.approvalSubmittedAt);
    if (effectiveApprovalSubmittedAt) {
      userData.approvalSubmittedAt = effectiveApprovalSubmittedAt;
    }

    const effectiveApprovalReviewedAt = data.approvalReviewedAt ?? coerceStringValue(mergedMetadata.approvalReviewedAt);
    if (effectiveApprovalReviewedAt) {
      userData.approvalReviewedAt = effectiveApprovalReviewedAt;
    }

    const effectiveApprovalNotes = data.approvalNotes ?? coerceStringValue(mergedMetadata.approvalNotes);
    if (effectiveApprovalNotes) {
      userData.approvalNotes = effectiveApprovalNotes;
    }

    if (counselorProfile) {
      userData.counselorProfile = counselorProfile;
    }

    return userData;
  }

  static async uploadCounselorDocuments(params: {
    resumeFile?: File | null;
    licenseFile?: File | null;
    certificationFiles?: File[] | null;
  }): Promise<CounselorDocument[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const filesToUpload: Array<{ file: File; type: CounselorDocument['documentType'] }> = [];
    if (params.resumeFile instanceof File) {
      filesToUpload.push({ file: params.resumeFile, type: 'resume' });
    }
    if (params.licenseFile instanceof File) {
      filesToUpload.push({ file: params.licenseFile, type: 'license' });
    }
    if (Array.isArray(params.certificationFiles)) {
      params.certificationFiles
        .filter((file): file is File => file instanceof File)
        .forEach((file) => {
          filesToUpload.push({ file, type: 'certification' });
        });
    }

    if (filesToUpload.length === 0) {
      return [];
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error(authError?.message || 'Failed to determine authenticated user.');
    }

    const uploadedDocuments: CounselorDocument[] = [];

    for (const { file, type } of filesToUpload) {
      const { bucket, storagePath, objectPath } = buildDocumentStoragePath(user.id, type, file.name);

      const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        throw new Error(uploadError.message || `Failed to upload ${type} document.`);
      }

      if (type === 'resume' || type === 'license') {
        const { error: deleteError } = await supabase
          .from('counselor_documents')
          .delete()
          .eq('profile_id', user.id)
          .eq('document_type', type);
        if (deleteError) {
          // Attempt to clean up the uploaded file before throwing
          await supabase.storage.from(bucket).remove([objectPath]).catch(() => undefined);
          throw new Error(deleteError.message || `Failed to replace existing ${type} document.`);
        }
      }

      const insertPayload = {
        profile_id: user.id,
        document_type: type,
        storage_path: storagePath,
        display_name: file.name,
      } satisfies Partial<CounselorDocumentRow>;

      const { data: insertedRow, error: insertError } = await supabase
        .from('counselor_documents')
        .insert(insertPayload)
        .select('*')
        .single<CounselorDocumentRow>();

      if (insertError || !insertedRow) {
        await supabase.storage.from(bucket).remove([objectPath]).catch(() => undefined);
        throw new Error(insertError?.message || `Failed to record ${type} document metadata.`);
      }

      uploadedDocuments.push(mapCounselorDocumentRow(insertedRow));
    }

    return uploadedDocuments;
  }

  /**
   * Upload profile image using Supabase Storage
   */
  static async uploadProfileImage(file: File): Promise<{ url: string; user: User }> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get current user
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !currentUser) {
      throw new Error(getUserError?.message || 'Failed to get current user');
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user metadata with avatar URL
    const { data: { user }, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...currentUser.user_metadata,
        avatar_url: publicUrl,
      },
    });

    if (updateError || !user) {
      throw new Error(updateError?.message || 'Failed to update user profile');
    }

    const userMetadata = user.user_metadata || {};

    await syncProfileRecord(supabase, user.id, {
      avatarUrl: publicUrl,
      userMetadata,
    });

    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: userMetadata.full_name || user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: publicUrl,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    };

    return {
      url: publicUrl,
      user: userData,
    };
  }

  /**
   * Change password using Supabase
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Update password with Supabase
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Request password reset using Supabase
   */
  static async forgotPassword(email: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * Reset password with token using Supabase
   */
  static async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Supabase handles password reset through the session
    // The token is typically handled via URL hash or query params
    // For now, we'll update the password if there's an active session
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
}

