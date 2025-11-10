/**
 * Authentication API service
 * 
 * Handles all authentication-related API calls using Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { User, SignInCredentials, SignUpCredentials } from '../auth';

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
};

interface SyncProfileOptions {
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
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

async function syncProfileRecord(
  supabase: SupabaseClient,
  userId: string,
  options: SyncProfileOptions,
): Promise<void> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select(
      'metadata, full_name, avatar_url, phone_number, languages, specialty, experience_years, availability, preferred_language, treatment_stage, contact_phone, emergency_contact_name, emergency_contact_phone, notification_preferences, security_preferences, support_preferences',
    )
    .eq('id', userId)
    .maybeSingle<ProfileTableRow>();

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
    const user: User = {
      id: data.user.id,
      email: data.user.email || credentials.email,
      name: userMetadata.full_name || data.user.email || '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: userMetadata.avatar_url,
      isVerified: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    };

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
    let mergedMetadata: Record<string, unknown> = { ...userMetadata };
    let displayName = (userMetadata.full_name as string | undefined) || user.email || '';
    let avatarUrl = (userMetadata.avatar_url as string | undefined) || undefined;

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
    };

    const { data: profileRow } = await supabase
      .from('profiles')
      .select(
        'full_name, avatar_url, metadata, specialty, experience_years, availability, phone_number, languages, preferred_language, treatment_stage, contact_phone, emergency_contact_name, emergency_contact_phone, notification_preferences, security_preferences, support_preferences',
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

    const userData: User = {
      id: user.id,
      email: user.email || '',
      name: displayName,
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: avatarUrl,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      metadata: mergedMetadata,
    } as User & { metadata?: Record<string, unknown> };

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

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (error || !user) {
      throw new Error(error?.message || 'Failed to update profile');
    }

    const userMetadata = user.user_metadata || {};
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
      avatarUrl: sanitizedAvatar,
      metadata: data.metadata,
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
      });
    } catch (syncError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthApi.updateProfile] Failed to sync profile record', syncError);
      }
      // Continue without throwing so onboarding can complete even if profile sync fails
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

    const finalAvatar = sanitizedAvatar || coerceStringValue(userMetadata.avatar_url) || undefined;

    const userData: User = {
      id: user.id,
      email: user.email || '',
      name:
        sanitizedFullName ||
        coerceStringValue(userMetadata.full_name) ||
        coerceStringValue(userMetadata.name) ||
        user.email ||
        '',
      role: (userMetadata.role as User['role']) || 'patient',
      avatar: finalAvatar,
      isVerified: user.email_confirmed_at !== null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      metadata: mergedMetadata,
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

    return userData;
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

