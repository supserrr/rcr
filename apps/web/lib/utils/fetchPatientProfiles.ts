/**
 * Utility function to fetch patient profiles with RLS-aware fallback
 * 
 * This function handles fetching patient profiles for counselors, respecting RLS policies.
 * It queries profiles directly from Supabase, which allows access to patients/guests
 * that counselors have sessions with.
 */

import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/lib/api/admin';

/**
 * Fetches patient profiles by IDs, respecting RLS policies
 * 
 * @param patientIds - Array of patient IDs to fetch
 * @returns Array of AdminUser objects representing the patients
 */
export async function fetchPatientProfilesFromSessions(
  patientIds: string[]
): Promise<AdminUser[]> {
  if (patientIds.length === 0) {
    return [];
  }

  const supabase = createClient();
  if (!supabase) {
    console.error('[fetchPatientProfilesFromSessions] Supabase client not available');
    return [];
  }

  try {
    // Query profiles - RLS should allow access since we have sessions with these patients
    // Include both 'patient' and 'guest' roles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id,full_name,role,avatar_url,metadata,created_at,updated_at,phone_number,preferred_language,treatment_stage,contact_phone,emergency_contact_name,emergency_contact_phone,assigned_counselor_id,diagnosis,date_of_birth')
      .in('id', patientIds)
      .in('role', ['patient', 'guest']);

    if (error) {
      console.error('[fetchPatientProfilesFromSessions] Failed to fetch patient profiles:', error);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[fetchPatientProfilesFromSessions] No patient profiles found for IDs:`, patientIds);
      }
      return [];
    }

    // Map profiles to AdminUser format
    const fetchedPatients: AdminUser[] = profiles.map((profile: any) => {
      const metadata = (profile.metadata || {}) as Record<string, unknown>;
      
      // Get email from metadata
      const email = 
        (typeof metadata.email === 'string' ? metadata.email : '') ||
        (typeof (profile as any).email === 'string' ? (profile as any).email : '') ||
        '';
      
      // Extract full name from multiple possible sources
      let fullName: string | undefined = undefined;
      
      // Try profile.full_name (most reliable)
      if (profile.full_name && typeof profile.full_name === 'string') {
        const trimmed = profile.full_name.trim();
        if (trimmed.length > 0) {
          fullName = trimmed;
        }
      }
      
      // Try metadata fields
      if (!fullName) {
        const nameCandidates = [
          metadata.name,
          metadata.full_name,
          metadata.fullName,
          metadata.displayName,
          metadata.display_name,
          metadata.userName,
          metadata.user_name,
        ];
        
        for (const candidate of nameCandidates) {
          if (typeof candidate === 'string') {
            const trimmed = candidate.trim();
            if (trimmed.length > 0) {
              fullName = trimmed;
              break;
            }
          }
        }
      }
      
      // Fallback to email username if we have email
      if (!fullName && email) {
        const emailUsername = email.split('@')[0]?.trim();
        if (emailUsername && emailUsername.length > 0) {
          // Capitalize first letter
          fullName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
        }
      }
      
      // Final fallback
      if (!fullName) {
        fullName = 'Patient';
      }
      
      // Extract avatar URL
      const avatarUrl = profile.avatar_url || 
                       (metadata.avatar_url as string) || 
                       (metadata.avatarUrl as string) ||
                       (metadata.avatar as string) ||
                       undefined;
      
      // Include all profile fields in metadata for complete patient information
      const enrichedMetadata = {
        ...metadata,
        // Include direct profile fields in metadata for easier access
        phone_number: profile.phone_number || metadata.phone_number,
        preferred_language: profile.preferred_language || metadata.preferred_language,
        treatment_stage: profile.treatment_stage || metadata.treatment_stage,
        contact_phone: profile.contact_phone || metadata.contact_phone,
        emergency_contact_name: profile.emergency_contact_name || metadata.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone || metadata.emergency_contact_phone,
        assigned_counselor_id: profile.assigned_counselor_id || metadata.assigned_counselor_id,
        diagnosis: (profile as any).diagnosis || metadata.diagnosis || metadata.cancer_type || metadata.cancerType,
        date_of_birth: (profile as any).date_of_birth || metadata.date_of_birth || metadata.dateOfBirth,
      };
      
      return {
        id: profile.id,
        email: email,
        fullName: fullName,
        avatarUrl: avatarUrl,
        role: (profile.role === 'guest' ? 'patient' : profile.role) as 'patient' | 'counselor' | 'admin',
        metadata: enrichedMetadata,
        // Include direct fields for easier access
        phoneNumber: profile.phone_number || (metadata.phone_number as string),
        preferredLanguage: profile.preferred_language || (metadata.preferred_language as string),
        treatmentStage: profile.treatment_stage || (metadata.treatment_stage as string),
        contactPhone: profile.contact_phone || (metadata.contact_phone as string),
        emergencyContactName: profile.emergency_contact_name || (metadata.emergency_contact_name as string),
        emergencyContactPhone: profile.emergency_contact_phone || (metadata.emergency_contact_phone as string),
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
      } as AdminUser;
    });

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[fetchPatientProfilesFromSessions] Fetched ${fetchedPatients.length} patient profiles`);
    }

    return fetchedPatients;
  } catch (error) {
    console.error('[fetchPatientProfilesFromSessions] Error fetching patient profiles:', error);
    if (error instanceof Error) {
      console.error('[fetchPatientProfilesFromSessions] Error stack:', error.stack);
    }
    return [];
  }
}

