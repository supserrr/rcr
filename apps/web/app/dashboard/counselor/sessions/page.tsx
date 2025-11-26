'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { SessionCard } from '../../../../components/dashboard/shared/SessionCard';
import { CounselorRescheduleModal } from '../../../../components/session/CounselorRescheduleModal';
import { CancelSessionModal } from '../../../../components/session/CancelSessionModal';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Info
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useSessions } from '../../../../hooks/useSessions';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import type { Session, RescheduleSessionInput, CreateSessionInput } from '@/lib/api/sessions';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { createClient } from '@/lib/supabase/client';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { Patient } from '../../../../lib/types';
import { fetchPatientProfilesFromSessions } from '../../../../lib/utils/fetchPatientProfiles';

export default function CounselorSessionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [counselorProfile, setCounselorProfile] = useState<AdminUser | null>(null);
  const [patientCache, setPatientCache] = useState<Map<string, AdminUser>>(new Map());
  const [viewingPatient, setViewingPatient] = useState<AdminUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [availableCounselors, setAvailableCounselors] = useState<Array<{ id: string; name: string; email?: string }>>([]);

  // Load sessions using the hook
  const counselorSessionsParams = useMemo(
    () => (user?.id ? { counselorId: user.id } : undefined),
    [user?.id]
  );

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    rescheduleSession,
    cancelSession,
    refreshSessions,
  } = useSessions(counselorSessionsParams, {
    enabled: Boolean(user?.id),
  });

  // Load counselor profile for specialty
  // Note: Patient data is loaded via the fallback useEffect below from session profiles
  useEffect(() => {
    const fetchCounselorProfile = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        if (!supabase) return;
        
        // Fetch counselor profile directly from profiles table (no admin privileges needed)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id,full_name,role,avatar_url,metadata,created_at,updated_at')
          .eq('id', user.id)
          .eq('role', 'counselor')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching counselor profile:', error);
          return;
        }
        
        if (profile) {
          // Map profile to AdminUser format
          const metadata = (profile.metadata || {}) as Record<string, unknown>;
          const email = 
            (typeof metadata.email === 'string' ? metadata.email : '') ||
            (typeof (profile as any).email === 'string' ? (profile as any).email : '') ||
            '';
          
          const counselorProfile: AdminUser = {
            id: profile.id,
            email: email,
            fullName: profile.full_name || (metadata.fullName as string) || (metadata.full_name as string),
            role: 'counselor' as const,
            isVerified: typeof metadata.isVerified === 'boolean' ? metadata.isVerified : (profile as any).email_confirmed_at !== null || false,
            avatarUrl: profile.avatar_url,
            metadata: metadata,
            specialty: metadata.specialty as string || (metadata.specialties as string[])?.[0],
            createdAt: profile.created_at || new Date().toISOString(),
            updatedAt: profile.updated_at || new Date().toISOString(),
          };
          
          setCounselorProfile(counselorProfile);
        }
      } catch (error) {
        console.error('Error fetching counselor profile:', error);
      }
    };

    fetchCounselorProfile();
  }, [user?.id]);

  // Load patients assigned to this counselor for the schedule modal
  useEffect(() => {
    const loadAssignedPatients = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        if (!supabase) return;
        
        // Query patients assigned to this counselor
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id,full_name,role,avatar_url,metadata,created_at,updated_at,phone_number,preferred_language,treatment_stage,contact_phone,emergency_contact_name,emergency_contact_phone,assigned_counselor_id,diagnosis,date_of_birth')
          .eq('role', 'patient')
          .eq('assigned_counselor_id', user.id);
        
        if (error) {
          console.error('[loadAssignedPatients] Error fetching assigned patients:', error);
          return;
        }
        
        if (profiles && profiles.length > 0) {
          // Map profiles to AdminUser format
          const assignedPatients: AdminUser[] = profiles.map((profile: any) => {
            const metadata = (profile.metadata || {}) as Record<string, unknown>;
            
            const email = 
              (typeof metadata.email === 'string' ? metadata.email : '') ||
              (typeof (profile as any).email === 'string' ? (profile as any).email : '') ||
              '';
            
            const fullName = profile.full_name || 
                            (metadata.full_name as string) || 
                            (metadata.fullName as string) ||
                            (email ? email.split('@')[0] : 'Patient');
            
            const avatarUrl = profile.avatar_url || 
                             (metadata.avatar_url as string) || 
                             (metadata.avatarUrl as string) ||
                             undefined;
            
            return {
              id: profile.id,
              email: email,
              fullName: fullName,
              avatarUrl: avatarUrl,
              role: 'patient' as const,
              metadata: metadata,
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
          
          // Merge with existing patients list
          setPatients(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPatients = assignedPatients.filter(p => !existingIds.has(p.id));
            return [...prev, ...newPatients];
          });
          
          // Update cache
          setPatientCache(prev => {
            const newCache = new Map(prev);
            assignedPatients.forEach((patient) => {
              newCache.set(patient.id, patient);
            });
            return newCache;
          });
        }
      } catch (error) {
        console.error('[loadAssignedPatients] Error loading assigned patients:', error);
      }
    };
    
    loadAssignedPatients();
  }, [user?.id]);

  // Note: Patient profiles are also fetched via the FALLBACK useEffect below
  // which runs when sessions are loaded and ensures we have patient data from sessions

  // Filter sessions based on tab
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(session => {
      if (session.status !== 'scheduled') return false;
      
      // Parse date (session.date is a string in YYYY-MM-DD format)
      const sessionDate = new Date(session.date);
      
      // If session has a time, combine date and time
      if (session.time) {
        // Parse time (format: HH:MM or HH:MM:SS)
        const [hours, minutes] = session.time.split(':').map(Number);
        const sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        // Session is upcoming if the datetime hasn't passed
        return sessionDateTime > now;
      }
      
      // If no time specified, check if date is today or in the future
      // Set to end of day for date-only comparison
      const endOfSessionDate = new Date(sessionDate);
      endOfSessionDate.setHours(23, 59, 59, 999);
      return endOfSessionDate > now;
    });
  }, [sessions]);

  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || session.status === 'cancelled'
  );

  const allSessions = sessions;

  // Fetch patient names directly from sessions if not in loaded list
  // This is a fallback when AdminApi.listUsers doesn't return patients
  useEffect(() => {
    // Always fetch patient profiles from sessions if we have sessions
    // This ensures we have patient data even if AdminApi.listUsers fails
    // Run immediately if we have sessions, don't wait for patientsLoading
    if (sessions.length > 0) {
      const uniquePatientIds = Array.from(new Set(sessions.map(s => s.patientId).filter(Boolean)));
      const existingPatientIds = new Set(patients.map(p => p.id));
      const cachePatientIds = new Set(patientCache.keys());
      const missingPatientIds = uniquePatientIds.filter(id => 
        !existingPatientIds.has(id) && !cachePatientIds.has(id)
      );
      
      if (missingPatientIds.length === 0) {
        return; // All patients already loaded
      }
      
      const supabase = createClient();
      if (!supabase) return;
      
      // Fetch patient profiles directly from profiles table for missing patient IDs
      (async () => {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.debug(`[FALLBACK] Fetching ${missingPatientIds.length} missing patients from profiles`);
          }
          
          // Query profiles - RLS should allow access since we have sessions with these patients
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id,full_name,role,avatar_url,metadata,created_at,updated_at,phone_number,preferred_language,treatment_stage,contact_phone,emergency_contact_name,emergency_contact_phone,assigned_counselor_id,diagnosis,date_of_birth')
            .in('id', missingPatientIds)
            .in('role', ['patient', 'guest']);
          
          if (error) {
            console.error('[FALLBACK] Failed to fetch patient profiles from sessions:', error);
            return;
          }
          
          if (profiles && profiles.length > 0) {
            // Map profiles to AdminUser format
            const fetchedPatients: AdminUser[] = profiles.map((profile: any) => {
              const metadata = (profile.metadata || {}) as Record<string, unknown>;
              
              // Get email from metadata
              const email = 
                (typeof metadata.email === 'string' ? metadata.email : '') ||
                (typeof (profile as any).email === 'string' ? (profile as any).email : '') ||
                '';
              
              // Extract full name from multiple possible sources - be very thorough
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
              
              if (process.env.NODE_ENV === 'development') {
                console.debug(`[FALLBACK] Fetched patient ${profile.id}: "${fullName}"`);
              }
              
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
                role: 'patient' as const,
                isVerified: typeof metadata.isVerified === 'boolean' ? metadata.isVerified : (profile as any).email_confirmed_at !== null || false,
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
            
            // Add to patients list and cache (merge with existing)
            setPatients(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newPatients = fetchedPatients.filter(p => !existingIds.has(p.id));
              if (process.env.NODE_ENV === 'development' && newPatients.length > 0) {
                console.debug(`[FALLBACK] Added ${newPatients.length} patients to list`);
              }
              return [...prev, ...newPatients];
            });
            
            setPatientCache(prev => {
              const newCache = new Map(prev);
              fetchedPatients.forEach((patient) => {
                newCache.set(patient.id, patient);
              });
              if (process.env.NODE_ENV === 'development') {
                console.debug(`[FALLBACK] Updated cache with ${fetchedPatients.length} patients. Cache size: ${newCache.size}`);
              }
              return newCache;
            });
          } else {
            console.warn(`[FALLBACK] No patient profiles found for IDs:`, missingPatientIds);
          }
        } catch (error) {
          console.error('[FALLBACK] Error fetching patient profiles from sessions:', error);
          if (error instanceof Error) {
            console.error('[FALLBACK] Error stack:', error.stack);
          }
        }
      })();
    }
  }, [sessions, patients.length, patientCache.size]); // Run when sessions change or when patients/cache are updated

  const getPatientName = (patientId: string): string => {
    // First check the loaded patients list
    let patient = patients.find(p => p.id === patientId);
    
    // If not found, check cache
    if (!patient) {
      patient = patientCache.get(patientId) || undefined;
    }
    
    // If found, extract name from multiple possible fields
    if (patient) {
      // Check fullName first (this is the primary field set by AdminApi)
      if (patient.fullName && typeof patient.fullName === 'string' && patient.fullName.trim()) {
        return patient.fullName.trim();
      }
      
      // Check metadata fields
      if (patient.metadata && typeof patient.metadata === 'object' && patient.metadata !== null) {
        const metadata = patient.metadata as Record<string, unknown>;
        
        // Try full_name
        if (typeof metadata.full_name === 'string' && metadata.full_name.trim()) {
          return metadata.full_name.trim();
        }
        
        // Try name
        if (typeof metadata.name === 'string' && metadata.name.trim()) {
          return metadata.name.trim();
        }
        
        // Try fullName in metadata
        if (typeof metadata.fullName === 'string' && metadata.fullName.trim()) {
          return metadata.fullName.trim();
        }
      }
      
      // Fallback to email username
      if (typeof patient.email === 'string' && patient.email) {
        const emailUsername = patient.email.split('@')[0];
        if (emailUsername && emailUsername.trim()) {
          return emailUsername.trim();
        }
      }
      
      // Log only if patient found but no name extracted (unexpected case)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[getPatientName] Patient ${patientId} found but no name extracted:`, {
        fullName: patient.fullName,
        email: patient.email,
        hasMetadata: !!patient.metadata,
        });
      }
    }
    
    // If sessions are loaded but patient still not found after a delay, log a warning
    // This helps debug if the fallback mechanism isn't working
    if (!sessionsLoading && sessions.length > 0) {
      // Only warn if we have sessions (meaning patient data should have been loaded by now)
      // Use a small delay check to avoid false warnings during initial render
      const hasSessionsWithThisPatient = sessions.some(s => s.patientId === patientId);
      if (hasSessionsWithThisPatient) {
        // Patient should be loaded via fallback mechanism
        // Only log once per patient to avoid spam
      if (process.env.NODE_ENV === 'development') {
          console.debug(`[getPatientName] Patient ${patientId} from session not yet loaded, will be fetched by fallback`);
        }
      }
    }
    
    // If we have sessions but patient not loaded yet, return a placeholder
    // The fallback mechanism should load it soon
    const hasSessionWithPatient = sessions.some(s => s.patientId === patientId);
    if (hasSessionWithPatient && !sessionsLoading) {
      // Patient should be loaded, but isn't yet - might be loading
      return 'Loading...';
    }
    
    // Return default placeholder - this is expected during initial render
    return 'Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    // First check the loaded patients list
    let patient = patients.find(p => p.id === patientId);
    
    // If not found, check cache
    if (!patient) {
      patient = patientCache.get(patientId) || undefined;
    }
    
    if (patient) {
      // Extract avatar from multiple possible fields with debug logging
      const rawAvatar = patient.avatarUrl ||
                       (patient.metadata?.avatar_url as string) ||
                       (patient.metadata?.avatarUrl as string) ||
                       (patient.metadata?.avatar as string) ||
                       undefined;
      
      if (rawAvatar) {
        const normalized = normalizeAvatarUrl(rawAvatar);
        if (normalized && process.env.NODE_ENV === 'development') {
          console.debug(`[getPatientAvatar] ✅ Found avatar for ${patientId}: ${normalized}`);
        }
        return normalized;
      } else if (process.env.NODE_ENV === 'development') {
        console.debug(`[getPatientAvatar] Patient ${patientId} found but no avatar URL`, {
          avatarUrl: patient.avatarUrl,
          metadata: patient.metadata,
        });
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.debug(`[getPatientAvatar] Patient ${patientId} not found in patients or cache`);
    }
    
    return undefined;
  };

  const getCounselorSpecialty = () => {
    // First check counselor profile from API
    if (counselorProfile?.specialty) {
      return counselorProfile.specialty;
    }
    
    // Check counselor profile metadata
    if (counselorProfile?.metadata && typeof counselorProfile.metadata === 'object') {
      const metadata = counselorProfile.metadata as Record<string, unknown>;
      if (typeof metadata.specialty === 'string' && metadata.specialty.trim()) {
        return metadata.specialty.trim();
      }
      if (Array.isArray(metadata.specialties) && metadata.specialties.length > 0) {
        const firstSpecialty = metadata.specialties[0];
        if (typeof firstSpecialty === 'string' && firstSpecialty.trim()) {
          return firstSpecialty.trim();
        }
      }
      if (typeof metadata.expertise === 'string' && metadata.expertise.trim()) {
        return metadata.expertise.trim();
      }
    }
    
    // Check auth user metadata
    if (user?.metadata && typeof user.metadata === 'object') {
      const userMetadata = user.metadata as Record<string, unknown>;
      if (typeof userMetadata.specialty === 'string' && userMetadata.specialty.trim()) {
        return userMetadata.specialty.trim();
      }
      if (Array.isArray(userMetadata.specialties) && userMetadata.specialties.length > 0) {
        const firstSpecialty = userMetadata.specialties[0];
        if (typeof firstSpecialty === 'string' && firstSpecialty.trim()) {
          return firstSpecialty.trim();
        }
      }
      if (typeof userMetadata.expertise === 'string' && userMetadata.expertise.trim()) {
        return userMetadata.expertise.trim();
      }
    }
    
    // Final fallback
    return 'General Counseling';
  };

  const getCounselorAvatar = () => {
    // Get counselor's own avatar from their profile or auth user
    if (counselorProfile?.avatarUrl) {
      return normalizeAvatarUrl(counselorProfile.avatarUrl);
    }
    if (user?.avatar) {
      return normalizeAvatarUrl(user.avatar);
    }
    // Check metadata
    const metadata = (counselorProfile?.metadata ?? {}) as Record<string, unknown>;
    const rawAvatar = (metadata.avatar_url as string) ||
                      (metadata.avatarUrl as string) ||
                      (metadata.avatar as string) ||
                      undefined;
    if (rawAvatar) {
      return normalizeAvatarUrl(rawAvatar);
    }
    return undefined;
  };

  const handleJoinSession = (session: Session) => {
    // Navigate to the session room
    router.push(`/dashboard/counselor/sessions/session/${session.id}`);
  };


  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (
    sessionId: string | undefined, 
    newDate: Date, 
    newTime: string, 
    newDuration: number, 
    notes?: string
  ) => {
    if (!user || !sessionId) return;
    
    // Type guard: after the check above, sessionId is definitely a string
    // TypeScript doesn't narrow after return, so we use a type assertion
    const id = sessionId as string;
    
    try {
      // Reschedule only updates date and time, duration is handled separately if needed
      const rescheduleData = {
        date: newDate.toISOString().split('T')[0], // YYYY-MM-DD
        time: newTime,
        reason: notes || 'Rescheduled by counselor',
      } as RescheduleSessionInput;
      await rescheduleSession(id as string, rescheduleData);
      
      // If duration changed, update session separately
      if (newDuration && selectedSession && newDuration !== selectedSession.duration) {
        // Note: We might need to update duration separately if the API supports it
        // For now, we'll just reschedule and note the duration change in the reason
      }
      
      toast.success('Session rescheduled successfully! Patient has been notified.');
      setIsRescheduleOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule session. Please try again.');
    }
  };


  const handleScheduleSession = () => {
    setIsScheduleOpen(true);
  };

  const handleConfirmSchedule = async (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => {
    if (!user) return;
    
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      // Validate patient exists in loaded patients list or cache
      const patient = patients.find(p => p.id === sessionData.patientId) || patientCache.get(sessionData.patientId);
      if (!patient) {
        toast.error('Patient not found. Please select a valid patient.');
        return;
      }
      
      // Type guard: after the check above, user.id is definitely a string
      // TypeScript doesn't narrow after return, so we use a type assertion
      const counselorId = user.id as string;
      
      const createData = {
        patientId: sessionData.patientId,
        counselorId: counselorId as string,
        date: sessionData.date.toISOString().split('T')[0], // YYYY-MM-DD
        time: sessionData.time,
        duration: sessionData.duration,
        type: sessionData.sessionType,
        notes: sessionData.notes,
      } as CreateSessionInput;
      await createSession(createData);
      toast.success('Session scheduled successfully! Patient has been notified.');
      setIsScheduleOpen(false);
      await refreshSessions();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule session. Please try again.');
    }
  };

  const handleCancelSession = (session: Session) => {
    setSelectedSession(session);
    setIsCancelOpen(true);
  };

  const handleViewPatientProfile = async (patientId: string) => {
    // First check if patient is already loaded
    let patient = patients.find(p => p.id === patientId) || patientCache.get(patientId);
    
    if (patient) {
      setViewingPatient(patient);
      setIsProfileOpen(true);
    } else {
      // Patient not found in cache, query through sessions to respect RLS policies
      // This allows viewing profiles of patients in sessions, even if not yet assigned
      try {
        toast.loading('Loading patient information...', { id: 'loading-patient' });
        
        // Find a session with this patient to establish the relationship
        const patientSession = sessions.find(s => s.patientId === patientId && s.counselorId === user?.id);
        
        if (!patientSession) {
          throw new Error('You can only view profiles of patients you have sessions with.');
        }
        
        // Use the shared utility function to fetch patient profile
        // This respects RLS and handles both patient and guest roles
        console.log('[handleViewPatientProfile] Fetching patient profile...');
        const fetchedPatients = await fetchPatientProfilesFromSessions([patientId]);
        
        if (fetchedPatients.length === 0) {
          // If still no profile, try AdminApi as a fallback
          try {
            patient = await AdminApi.getUser(patientId);
          } catch (adminError) {
            console.warn('[handleViewPatientProfile] AdminApi also failed:', adminError);
            throw new Error('Patient not found. You may only view profiles of patients you have sessions with.');
          }
        } else {
          patient = fetchedPatients[0];
        }
        
        // Add to cache for future use
        if (patient) {
          patientCache.set(patientId, patient);
          // Update patients list if needed
          if (!patients.find(p => p.id === patientId)) {
            setPatients(prev => [...prev, patient!]);
          }
          
          setViewingPatient(patient);
          setIsProfileOpen(true);
          console.log('[handleViewPatientProfile] ✅ Patient profile loaded successfully');
        } else {
          throw new Error('Patient not found. You may only view profiles of patients you have sessions with.');
        }
        
        toast.dismiss('loading-patient');
      } catch (error) {
        console.error('[handleViewPatientProfile] Error loading patient:', error);
        toast.dismiss('loading-patient');
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load patient information. You may only view profiles of patients you have sessions with.';
        toast.error(errorMessage);
      }
    }
  };

  const handleViewSessionInfo = (session: Session) => {
    setSelectedSession(session);
    // For now, we can navigate to the session detail page or show a modal
    // Since we already have session detail page, we'll navigate there
    router.push(`/dashboard/counselor/sessions/session/${session.id}`);
  };

  const handleAssignPatient = async (patientId: string, counselorId: string) => {
    try {
      // assignPatientToCounselor already returns the updated patient data
      const updatedPatient = await AdminApi.assignPatientToCounselor(patientId, counselorId);
      toast.success('Patient assigned successfully');
      // Use the returned patient data instead of making another API call
      if (viewingPatient) {
        setViewingPatient(updatedPatient);
        // Update patient in cache
        setPatientCache(prev => {
          const newCache = new Map(prev);
          newCache.set(patientId, updatedPatient);
          return newCache;
        });
        // Update patient in list
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign patient');
      throw error;
    }
  };

  // Load available counselors for "Pass to Colleague" feature
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        const response = await AdminApi.listUsers({ role: 'counselor' });
        const counselors = response.users
          .filter(c => c.id !== user?.id) // Exclude current counselor
          .map(c => ({
            id: c.id,
            name: c.fullName || c.email || 'Counselor',
            email: c.email
          }));
        setAvailableCounselors(counselors);
      } catch (error) {
        console.error('Error loading counselors:', error);
      }
    };

    if (user?.id && isProfileOpen) {
      loadCounselors();
    }
  }, [user?.id, isProfileOpen]);

  const handleConfirmCancel = async (sessionId: string, reason: string, notes?: string) => {
    if (!user) return;
    
    try {
      await cancelSession(sessionId, { reason });
      toast.success('Session cancelled successfully! Patient has been notified.');
      setIsCancelOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel session. Please try again.');
    }
  };

  if (authLoading || sessionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (sessionsError) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading sessions</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="My Sessions"
        description="Manage your counseling sessions and view session history"
      />

      {/* Quick Stats */}
      <AnimatedGrid className="grid gap-4 md:grid-cols-4" staggerDelay={0.1}>
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Next session in 2 hours
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'cancelled').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Sessions</h2>
        </div>
        <Button onClick={handleScheduleSession} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {/* Sessions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            All ({allSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    patientName={getPatientName(session.patientId)}
                    patientAvatar={getPatientAvatar(session.patientId)}
                    patientId={session.patientId}
                    counselorName={user?.name || 'Counselor'}
                    counselorSpecialty={getCounselorSpecialty()}
                    counselorAvatar={getCounselorAvatar()}
                    counselorId={session.counselorId}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
                    onCancel={handleCancelSession}
                    onViewPatientProfile={handleViewPatientProfile}
                    onViewSessionInfo={handleViewSessionInfo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled sessions at the moment
                </p>
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {allSessions.length > 0 ? (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleScheduleSession} variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Another Session
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allSessions.map((session) => (
                    <SessionCard
                    key={session.id}
                    session={session}
                    patientName={getPatientName(session.patientId)}
                    patientAvatar={getPatientAvatar(session.patientId)}
                    patientId={session.patientId}
                    counselorName={user?.name || 'Counselor'}
                    counselorSpecialty={getCounselorSpecialty()}
                    counselorAvatar={getCounselorAvatar()}
                    counselorId={session.counselorId}
                    onJoin={session.status === 'scheduled' ? handleJoinSession : undefined}
                    onReschedule={session.status === 'scheduled' ? handleRescheduleSession : undefined}
                    onCancel={session.status === 'scheduled' ? handleCancelSession : undefined}
                    onViewPatientProfile={handleViewPatientProfile}
                    onViewSessionInfo={handleViewSessionInfo}
                  />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by scheduling your first session
                </p>
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reschedule Modal */}
      <CounselorRescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
        onReschedule={handleConfirmReschedule as any}
      />

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
        userRole="counselor"
        onCancel={handleConfirmCancel as any}
      />

      {/* Schedule Session Modal */}
      {user && (
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          counselorId={user?.id || ''}
          counselorName={user.name || 'Counselor'}
          patients={patients.map(patient => ({
            id: patient.id,
            name: patient.fullName || patient.email,
            avatar: undefined // AdminUser doesn't have avatar
          }))}
          onSchedule={handleConfirmSchedule}
        />
      )}

      {/* Patient Profile Modal */}
      {viewingPatient && user && (
        <ProfileViewModal
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setViewingPatient(null);
          }}
          user={{
            id: viewingPatient.id,
            name: viewingPatient.fullName || viewingPatient.email || 'Patient',
            email: viewingPatient.email,
            role: 'patient' as const,
            avatar: viewingPatient.avatarUrl,
            createdAt: new Date(viewingPatient.createdAt),
            // Pass all metadata and fields from AdminUser
            metadata: viewingPatient.metadata || {},
            // Health info - check direct fields first, then metadata
            diagnosis: viewingPatient.cancerType || (viewingPatient.metadata?.diagnosis as string) || (viewingPatient.metadata?.cancer_type as string) || (viewingPatient.metadata?.cancerType as string),
            treatmentStage: viewingPatient.treatmentStage || (viewingPatient.metadata?.treatment_stage as string) || (viewingPatient.metadata?.treatmentStage as string),
            cancerType: viewingPatient.cancerType || (viewingPatient.metadata?.cancer_type as string) || (viewingPatient.metadata?.cancerType as string),
            currentTreatment: (viewingPatient.metadata?.current_treatment as string) || (viewingPatient.metadata?.currentTreatment as string),
            diagnosisDate: (viewingPatient.metadata?.diagnosis_date as string) || (viewingPatient.metadata?.diagnosisDate as string),
            // Personal info - check direct fields first, then metadata
            age: (typeof viewingPatient.age === 'string' ? viewingPatient.age : typeof viewingPatient.age === 'number' ? String(viewingPatient.age) : undefined) || (viewingPatient.metadata?.age as string) || ((viewingPatient.metadata?.age as number) ? String(viewingPatient.metadata?.age) : undefined),
            gender: viewingPatient.gender as string || (viewingPatient.metadata?.gender as string),
            location: viewingPatient.location as string || (viewingPatient.metadata?.location as string) || (viewingPatient.metadata?.address as string),
            phoneNumber: viewingPatient.contactPhone || viewingPatient.phoneNumber || (viewingPatient.metadata?.contactPhone as string) || (viewingPatient.metadata?.contact_phone as string) || (viewingPatient.metadata?.phone as string) || (viewingPatient.metadata?.phoneNumber as string),
            preferredLanguage: viewingPatient.preferredLanguage || (viewingPatient.metadata?.preferred_language as string) || (viewingPatient.metadata?.preferredLanguage as string) || (viewingPatient.metadata?.language as string),
            // Support info
            supportNeeds: (viewingPatient.metadata?.support_needs as string[]) || (viewingPatient.metadata?.supportNeeds as string[]),
            familySupport: (viewingPatient.metadata?.family_support as string) || (viewingPatient.metadata?.familySupport as string),
            consultationType: (viewingPatient.metadata?.consultation_type as string[]) || (viewingPatient.metadata?.consultationType as string[]),
            specialRequests: (viewingPatient.metadata?.special_requests as string) || (viewingPatient.metadata?.specialRequests as string),
            // Emergency contact - check direct fields first, then metadata
            emergencyContactName: viewingPatient.emergencyContactName || (viewingPatient.metadata?.emergency_contact_name as string) || (viewingPatient.metadata?.emergencyContactName as string),
            emergencyContactPhone: viewingPatient.emergencyContactPhone || (viewingPatient.metadata?.emergency_contact_phone as string) || (viewingPatient.metadata?.emergencyContactPhone as string),
            emergencyContact: (viewingPatient.metadata?.emergency_contact as string) || (viewingPatient.metadata?.emergencyContact as string),
            // Assignment
            assignedCounselor: viewingPatient.metadata?.assigned_counselor_id as string || ((viewingPatient as any).assigned_counselor_id as string) || undefined,
            // Progress
            moduleProgress: (viewingPatient.metadata?.module_progress as Record<string, number>) || undefined,
          } as Patient}
          userType="patient"
          currentUserRole="counselor"
          onAssignPatient={handleAssignPatient}
          currentCounselorId={user.id}
          availableCounselors={availableCounselors}
        />
      )}
    </div>
  );
}
