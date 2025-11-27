'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@workspace/ui/components/button";
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { Footer } from '@workspace/ui/components/ui/footer';
import { ThemeTogglerButton } from '@workspace/ui/components/animate-ui/components/buttons/theme-toggler';
import { RCRLogo } from '@workspace/ui/components/rcr-logo';
import { Search, Filter, MessageCircle, Video, Phone } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AdminApi, type AdminUser } from '@/lib/api/admin';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { useProfileUpdates } from '@/hooks/useRealtime';
import type { RealtimeProfile } from '@/lib/realtime/client';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';
import type { CounselorProfileRecord } from '@/lib/types';

/**
 * Counselor profile data structure
 */
interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  languages: string[];
  experienceYears?: number | null;
  reviews: number;
  availability: 'available' | 'busy' | 'offline';
  availabilityStatus?: string;
  availabilityDisplay?: string;
  photo?: string;
  bio: string;
  education: string;
  certifications: string[];
  consultationTypes: ('chat' | 'video' | 'phone')[];
  completedSessions?: number;
}

const toString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

const toNumberLoose = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = Number.parseFloat(match[0]);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
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

const mergeStringArrays = (...values: unknown[]): string[] | undefined => {
  const merged = new Set<string>();
  values.forEach((value) => {
    const array = toStringArray(value);
    if (array) {
      array.forEach((item) => {
        const normalized = item.trim();
        if (normalized.length > 0) {
          merged.add(normalized);
  }
      });
    }
  });
  return merged.size > 0 ? Array.from(merged) : undefined;
};

const createKeySet = (keys: string[]): Set<string> =>
  new Set(keys.map((key) => key.toLowerCase()));

const extractStringCandidate = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }

  const direct = toString(value);
  if (direct) {
    return direct;
  }

  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    return (
      toString(source.url) ??
      toString(source.href) ??
      toString(source.value) ??
      (typeof source.text === 'string' ? source.text.trim() : undefined)
    );
  }

  return undefined;
};

const findStringByKeys = (
  subject: unknown,
  keys: Set<string>,
  visited: WeakSet<object> = new WeakSet(),
): string | undefined => {
  if (Array.isArray(subject)) {
    for (const item of subject) {
      const nested = findStringByKeys(item, keys, visited);
      if (nested) {
        return nested;
      }
    }
    return undefined;
  }

  if (!subject || typeof subject !== 'object') {
    return undefined;
  }

  const obj = subject as Record<string, unknown>;
  if (visited.has(obj)) {
    return undefined;
  }
  visited.add(obj);

  for (const [rawKey, rawValue] of Object.entries(obj)) {
    const normalizedKey = rawKey.toLowerCase();
    if (keys.has(normalizedKey)) {
      const candidate = extractStringCandidate(rawValue);
      if (candidate) {
        return candidate;
      }
    }
    const nested = findStringByKeys(rawValue, keys, visited);
    if (nested) {
      return nested;
  }
  }

  return undefined;
};

const AVATAR_KEYS = createKeySet([
  'avatar',
  'avatar_url',
  'avatarurl',
  'profileimage',
  'profile_image',
  'profile_image_url',
  'profilepicture',
  'profile_picture',
  'photo',
  'photo_url',
  'photoUrl',
  'image',
  'image_url',
  'imageurl',
  'picture',
  'google_avatar',
  'googleavatar',
]);

const BIO_KEYS = createKeySet(['bio', 'about', 'description', 'summary', 'profile_bio']);

const adminUserToLandingCounselor = (user: AdminUser): Counselor | null => {
  // Only show approved counselors on public page
  if (user.approvalStatus && user.approvalStatus !== 'approved') {
    return null;
  }
  
  // Respect visibility settings if set
  if (user.visibilitySettings && user.visibilitySettings.publicLanding === false) {
    return null;
  }

  const metadata = (user.metadata ?? {}) as Record<string, unknown>;
  const rawMetadataCounselorProfile =
    (metadata['counselorProfile'] as unknown) ?? metadata['counselor_profile'];
  const counselorProfileFromMetadata =
    rawMetadataCounselorProfile && typeof rawMetadataCounselorProfile === 'object'
      ? (rawMetadataCounselorProfile as Record<string, unknown>)
      : undefined;
  const counselorProfileRecord = user.counselorProfile ?? undefined;

  const specialty =
    toString(user.specialty) ??
    toString(metadata['specialty']) ??
    toStringArray(metadata['specializations'])?.[0] ??
    toStringArray(metadata['specialties'])?.[0] ??
    toStringArray(counselorProfileRecord?.specializations)?.[0] ??
    (counselorProfileFromMetadata
      ? toStringArray(counselorProfileFromMetadata['specializations'])?.[0]
      : undefined) ??
    toString(metadata['expertise']) ??
    'General Counseling';

  const experienceCandidates: unknown[] = [
    user.experience,
    (user as unknown as { experienceYears?: unknown }).experienceYears,
    counselorProfileRecord?.yearsExperience,
    metadata['experience'],
    metadata['experienceYears'],
    metadata['experience_years'],
    metadata['years_experience'],
    metadata['yearsOfExperience'],
    metadata['years_of_experience'],
    counselorProfileFromMetadata?.['experience'],
    counselorProfileFromMetadata?.['experienceYears'],
    counselorProfileFromMetadata?.['yearsExperience'],
    counselorProfileFromMetadata?.['experience_years'],
    counselorProfileFromMetadata?.['years_of_experience'],
    counselorProfileFromMetadata?.['yearsOfExperience'],
  ];

  const experienceNumbers = experienceCandidates
    .map((candidate) => toNumberLoose(candidate))
    .filter((value): value is number => value !== undefined && Number.isFinite(value) && value >= 0);
  const resolvedExperience = experienceNumbers.length > 0 ? Math.max(...experienceNumbers) : undefined;
  const experienceYears = resolvedExperience ?? undefined;

  const availabilitySources: unknown[] = [
    user.availability,
    metadata['availability'],
    counselorProfileFromMetadata?.['availability'],
    user.availabilityStatus,
    counselorProfileRecord?.availabilityStatus,
    counselorProfileFromMetadata?.['availabilityStatus'],
    metadata['availabilityStatus'],
    metadata['availability_status'],
    metadata['status'],
    metadata['currentAvailability'],
  ];

  const availabilityDisplayMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    limited: 'Limited Spots',
    waitlist: 'Waitlist',
    offline: 'Offline',
    unavailable: 'Unavailable',
  };

  let availabilityKey = 'available';

  for (const source of availabilitySources) {
    const str = toString(source);
    if (!str) {
      continue;
    }
    const normalized = str.trim().toLowerCase();
    const compact = normalized.replace(/[\s_-]+/g, '');
    let mapped = compact;
    if (compact === 'limitedspots' || compact === 'limitedavailability') {
      mapped = 'limited';
    } else if (compact === 'booked' || compact === 'partial') {
      mapped = 'busy';
    } else if (compact === 'notavailable' || compact === 'outofoffice') {
      mapped = 'unavailable';
    } else if (compact === 'away' || compact === 'inactive') {
      mapped = 'unavailable';
    }

    if (
      ['available', 'busy', 'limited', 'waitlist', 'offline', 'unavailable'].includes(mapped)
    ) {
      availabilityKey = mapped;
      break;
    }
  }

  const availabilityDisplay =
    availabilityDisplayMap[availabilityKey] ?? availabilityDisplayMap.available;

  let availability: 'available' | 'busy' | 'offline';
  if (availabilityKey === 'offline' || availabilityKey === 'unavailable') {
    availability = 'offline';
  } else if (availabilityKey === 'busy' || availabilityKey === 'limited' || availabilityKey === 'waitlist') {
    availability = 'busy';
  } else {
    availability = 'available';
  }

  const sessionModalities =
    mergeStringArrays(
      user.sessionModalities,
      user.consultationTypes,
      counselorProfileRecord?.sessionModalities,
      metadata['sessionModalities'],
      metadata['session_modalities'],
      metadata['consultationTypes'],
      metadata['consultation_types'],
      metadata['modalities'],
      counselorProfileFromMetadata?.['sessionModalities'],
      counselorProfileFromMetadata?.['session_modalities'],
      counselorProfileFromMetadata?.['consultationTypes'],
      counselorProfileFromMetadata?.['consultation_types'],
    ) ?? undefined;

  const consultationTypesRaw = sessionModalities ?? user.consultationTypes ?? metadata['consultationTypes'] ?? metadata['consultation_types'];

  const consultationTypes = (() => {
    const types = toStringArray(consultationTypesRaw);
    const allowed: ('chat' | 'video' | 'phone')[] = ['chat', 'video', 'phone'];
    if (!types || types.length === 0) {
      return allowed;
    }
    const filtered = types
      .map((type) => type.toLowerCase())
      .filter((type): type is 'chat' | 'video' | 'phone' => {
        const normalized = type.toLowerCase();
        if (normalized.includes('chat') || normalized === 'messaging' || normalized === 'text') {
          return allowed.includes('chat');
        }
        if (normalized.includes('video') || normalized === 'videocall' || normalized === 'videoconference') {
          return allowed.includes('video');
        }
        if (normalized.includes('phone') || normalized === 'call' || normalized === 'voice' || normalized === 'audio') {
          return allowed.includes('phone');
        }
        return allowed.includes(normalized as any);
      });
    return filtered.length > 0 ? filtered : allowed;
  })();

  const rawAvatar =
    toString(user.avatarUrl) ??
    findStringByKeys(metadata, AVATAR_KEYS);
  const photo = normalizeAvatarUrl(rawAvatar);

  const baseName =
    toString(user.fullName) ??
    toString(metadata.full_name) ??
    toString(metadata.name) ??
    toString(user.email) ??
    'Counselor';
  const professionalTitle =
    toString(metadata.professionalTitle) ??
    toString(metadata.professional_title) ??
    toString(metadata.title);
  const name = (() => {
    if (!professionalTitle) {
      return baseName;
    }
    // Check if baseName already starts with the professional title to avoid duplication
    const titleLower = professionalTitle.trim().toLowerCase();
    const baseNameLower = baseName.trim().toLowerCase();
    if (baseNameLower.startsWith(titleLower)) {
      return baseName.trim();
    }
    return `${professionalTitle} ${baseName}`.trim();
  })();

  const title = specialty;

  const specialties = (() => {
    const specialtyList = mergeStringArrays(
      user.specializations,
      metadata['specializations'],
      metadata['specialties'],
      counselorProfileRecord?.specializations,
      counselorProfileFromMetadata?.['specializations'],
      specialty ? [specialty] : undefined,
    );
    return specialtyList && specialtyList.length > 0 ? specialtyList : [specialty || 'Counseling'];
  })();

  const languages = (() => {
    const langList = mergeStringArrays(
      user.languages,
      counselorProfileRecord?.languages,
      metadata['languages'],
      metadata['languagePreferences'],
      metadata['language_preferences'],
    );
    return langList && langList.length > 0 ? langList : ['Kinyarwanda'];
  })();

  const bio =
    toString(user.bio) ??
    toString(counselorProfileRecord?.bio) ??
    (counselorProfileFromMetadata
      ? toString(counselorProfileFromMetadata['bio'])
      : undefined) ??
    findStringByKeys(metadata, BIO_KEYS) ??
    'This counselor is here to support you throughout your journey.';

  const education =
    toString(metadata.education) ??
    toString(metadata['educationHistory']) ??
    'Details coming soon.';

  const certifications = (() => {
    const certList = mergeStringArrays(
      metadata['certifications'],
      metadata['credentials'],
      metadata['licenses'],
      user.credentials ? (Array.isArray(user.credentials) ? user.credentials : [user.credentials]) : undefined,
    );
    return certList && certList.length > 0 ? certList : [];
  })();

  const sessionStats = user.sessionStats;
  const completedSessions =
    toNumberLoose(user.completedSessions) ??
    toNumberLoose(sessionStats?.completedSessions) ??
    toNumberLoose(metadata['completedSessions']) ??
    toNumberLoose(metadata['completed_sessions']);

  const reviews =
    typeof metadata.reviews === 'number'
      ? metadata.reviews
      : typeof metadata.rating_count === 'number'
      ? metadata.rating_count
      : 0;

  return {
    id: user.id,
    name,
    title,
    specialties,
    languages,
    experienceYears,
    reviews,
    availability,
    availabilityStatus: availabilityKey,
    availabilityDisplay,
    photo,
    bio,
    education,
    certifications,
    consultationTypes,
    completedSessions,
  };
};

const mapProfileRecordToAdminUser = (profile: RealtimeProfile): AdminUser => {
  const metadata = (profile.metadata ?? {}) as Record<string, unknown>;

  return {
    id: profile.id,
    email:
      (typeof profile.email === 'string' ? profile.email : undefined) ??
      (typeof metadata.email === 'string' ? metadata.email : undefined) ??
      (typeof metadata.contact_email === 'string' ? metadata.contact_email : undefined) ??
      '',
    fullName:
      (typeof profile.full_name === 'string' ? profile.full_name : undefined) ??
      (typeof metadata.full_name === 'string' ? metadata.full_name : undefined),
    role: (profile.role as AdminUser['role']) || 'counselor',
    isVerified: Boolean(profile.is_verified),
    createdAt: profile.created_at ?? new Date().toISOString(),
    lastLogin: profile.updated_at ?? undefined,
    metadata,
    specialty:
      (typeof profile.specialty === 'string' ? profile.specialty : undefined) ??
      (typeof metadata.specialty === 'string' ? metadata.specialty : undefined) ??
      toStringArray(metadata.specializations)?.[0] ??
      toString(metadata.expertise),
    experience:
      (typeof profile.experience_years === 'number' ? profile.experience_years : undefined) ??
      toNumberLoose(metadata.experience) ??
      toNumberLoose(metadata.experienceYears) ??
      toNumberLoose(metadata.experience_years),
    experienceYears:
      (typeof profile.experience_years === 'number' ? profile.experience_years : undefined) ??
      toNumberLoose(metadata.experienceYears) ??
      toNumberLoose(metadata.experience_years) ??
      toNumberLoose(metadata.yearsOfExperience) ??
      toNumberLoose(metadata.years_of_experience),
    availability:
      (typeof profile.availability === 'string' ? profile.availability : undefined) ??
      (typeof metadata.availability === 'string' ? metadata.availability : undefined),
    availabilityStatus:
      (typeof profile.approval_status === 'string' ? profile.approval_status : undefined) ??
      (typeof metadata.availabilityStatus === 'string' ? metadata.availabilityStatus : undefined) ??
      (typeof metadata.availability_status === 'string' ? metadata.availability_status : undefined),
    avatarUrl:
      (typeof profile.avatar_url === 'string' ? profile.avatar_url : undefined) ??
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined) ??
      (typeof metadata.avatar === 'string' ? metadata.avatar : undefined),
    phoneNumber:
      (typeof profile.phone_number === 'string' ? profile.phone_number : undefined) ??
      (typeof metadata.phoneNumber === 'string' ? metadata.phoneNumber : undefined) ??
      (typeof metadata.contact_phone === 'string' ? metadata.contact_phone : undefined),
    location:
      (typeof metadata.location === 'string' ? metadata.location : undefined),
    languages: toStringArray(metadata.languages ?? metadata.language_preferences),
    bio: typeof metadata.bio === 'string' ? metadata.bio : undefined,
    credentials: metadata.credentials as string | string[] | undefined,
    specializations: toStringArray(metadata.specializations ?? metadata.specialties),
    sessionModalities: toStringArray(metadata.sessionModalities ?? metadata.session_modalities),
    consultationTypes: toStringArray(metadata.consultationTypes ?? metadata.consultation_types),
    visibilitySettings: (profile.visibility_settings as any) ?? (metadata.visibilitySettings as any),
    approvalStatus: (profile.approval_status as any) ?? (metadata.approvalStatus as any),
  };
};

/**
 * Counselor profile card component inspired by ProfileCard design
 */
function CounselorCard({ counselor }: { counselor: Counselor }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const router = useRouter();
  const { isAuthenticated, redirectToSignIn } = useAuth();

  const handleFollow = () => {
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      redirectToSignIn();
      return;
    }
    
    // If authenticated, redirect to patient dashboard sessions page with counselor ID
    // The counselor ID can be used to pre-select the counselor when booking
    router.push(`/dashboard/patient/sessions?counselorId=${counselor.id}`);
  };

  // Create a description that includes specialties and languages
  const experienceLabel =
    typeof counselor.experienceYears === 'number' && counselor.experienceYears > 0
      ? `${counselor.experienceYears} ${
          counselor.experienceYears === 1 ? 'year' : 'years'
        } experience`
      : undefined;

  const description = `${counselor.title}${
    experienceLabel ? ` • ${experienceLabel}` : ''
  }`;

  // Get availability badge styling
  const getAvailabilityBadgeStyle = () => {
    const status = counselor.availabilityStatus ?? counselor.availability;
    if (status === 'available') {
      return 'bg-green-500/90 text-white border-green-400';
    } else if (status === 'busy' || status === 'limited' || status === 'waitlist') {
      return 'bg-yellow-500/90 text-white border-yellow-400';
    } else {
      return 'bg-gray-500/90 text-white border-gray-400';
    }
  };

  const availabilityDisplay = counselor.availabilityDisplay ?? 
    (counselor.availability === 'available' ? 'Available' : 
     counselor.availability === 'busy' ? 'Busy' : 'Offline');

  // Generate initials for fallback
  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return '??';
    }
    const parts = trimmed.split(/\s+/).filter((p) => p.length > 0);
    if (parts.length >= 2) {
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      if (first && last) {
        return `${first}${last}`.toUpperCase();
      }
    }
    return trimmed.substring(0, 2).toUpperCase() || '??';
  };

  const initials = counselor.photo ? undefined : getInitials(counselor.name);

  return (
    <div className="relative w-80 h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm dark:shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Full Cover Image or Gradient Background */}
      {counselor.photo ? (
      <img
        src={counselor.photo}
        alt={counselor.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            // Fallback to gradient background if image fails to load
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }
          }}
        />
      ) : null}
      {/* Gradient background with initials fallback */}
      <div 
        className={`avatar-fallback absolute inset-0 w-full h-full ${counselor.photo ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background/50`}
        style={{ display: counselor.photo ? 'none' : 'flex' }}
      >
        {initials && (
          <span className="text-6xl font-bold text-primary/60">{initials}</span>
        )}
      </div>
      
      {/* Availability Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge 
          variant="outline" 
          className={`${getAvailabilityBadgeStyle()} border backdrop-blur-sm text-xs font-semibold shadow-lg`}
        >
          {availabilityDisplay}
        </Badge>
      </div>

      {/* Smooth Blur Overlay - Multiple layers for seamless fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 via-background/20 via-background/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/90 via-background/60 via-background/30 via-background/15 via-background/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/85 via-background/40 to-transparent backdrop-blur-sm" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
        {/* Name */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {counselor.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Consultation Types */}
        <div className="flex gap-2 flex-wrap">
          {counselor.consultationTypes.includes('chat') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Badge>
          )}
          {counselor.consultationTypes.includes('video') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
          {counselor.consultationTypes.includes('phone') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <Phone className="w-3 h-3 mr-1" />
              Phone
            </Badge>
          )}
        </div>


        {/* Action Button */}
        <button
          onClick={handleFollow}
          className={`w-full cursor-pointer py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border border-border/20 shadow-sm transform-gpu ${
            isFollowing 
              ? "bg-muted text-muted-foreground hover:bg-muted/80" 
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {isFollowing ? "Booked" : "Book Session"}
        </button>
      </div>
    </div>
  );
}

/**
 * Counselors page component
 */
export default function CounselorsPage() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        const mapped = response.users
          .map(adminUserToLandingCounselor)
          .filter((counselor): counselor is Counselor => counselor !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCounselors(mapped);
      } catch (error) {
        console.error('Failed to load counselors:', error);
        toast.error('Failed to load counselors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCounselors();
  }, []);

  const profileSubscriptionFilters = useMemo(
    () => ({ role: 'counselor' as const }),
    [],
  );

  const handleRealtimeProfileUpdate = useCallback(
    (profile: RealtimeProfile, { eventType }: { eventType: string; oldRecord: Record<string, unknown> | null }) => {
      if (!profile?.id) {
        return;
      }

      const adminUser = mapProfileRecordToAdminUser(profile);
      const counselor = adminUserToLandingCounselor(adminUser);

      setCounselors((previous) => {
        const existingIndex = previous.findIndex((c) => c.id === adminUser.id);

        if (eventType === 'DELETE') {
          return existingIndex === -1
            ? previous
            : previous.filter((counselorItem) => counselorItem.id !== adminUser.id);
        }

        if (!counselor) {
          return existingIndex === -1
            ? previous
            : previous.filter((counselorItem) => counselorItem.id !== adminUser.id);
        }

        if (existingIndex === -1) {
          return [...previous, counselor].sort((a, b) => a.name.localeCompare(b.name));
        }

        const next = [...previous];
        next[existingIndex] = counselor;
        return next;
      });
    },
    [],
  );

  useProfileUpdates(
    profileSubscriptionFilters,
    handleRealtimeProfileUpdate,
    (error) => {
      console.error('Realtime counselor subscription error:', error);
    },
  );

  const filteredCounselors = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return counselors;
    }

    return counselors.filter((counselor) => {
      const matchesName = counselor.name.toLowerCase().includes(search);
      const matchesSpecialties = counselor.specialties.some((specialty) =>
        specialty.toLowerCase().includes(search),
      );
      const matchesLanguages = counselor.languages.some((language) =>
        language.toLowerCase().includes(search),
      );
      const matchesBio = counselor.bio.toLowerCase().includes(search);

      return matchesName || matchesSpecialties || matchesLanguages || matchesBio;
    });
  }, [counselors, searchTerm]);

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-jakarta-sans text-4xl lg:text-6xl font-semibold text-foreground mb-6">
            Meet Our Counselors
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our counselors combine professional expertise with genuine empathy to support your emotional and mental well-being throughout your healing journey.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                placeholder="Search counselors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Counselors Grid */}
      <section className="pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            {loading ? (
              <p className="font-jakarta-sans text-muted-foreground">Loading counselors…</p>
            ) : (
              <p className="font-jakarta-sans text-muted-foreground">
                {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner variant="bars" size={32} className="text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {filteredCounselors.map((counselor) => (
                  <CounselorCard key={counselor.id} counselor={counselor} />
                ))}
              </div>

              {filteredCounselors.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-jakarta-sans text-muted-foreground text-lg">
                    No counselors found matching your search.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<RCRLogo variant="simple" width={32} height={32} />}
        brandName="Rwanda Cancer Relief"
        mainLinks={[
          { href: "/get-help", label: "Get Help" },
          { href: "/counselors", label: "Find a Counselor" },
          { href: "/about", label: "About Us" },
          { href: "/resources", label: "Resources" },
          { href: "/contact", label: "Contact" },
          { href: "/signin", label: "Sign In" },
          { href: "/signup/patient", label: "Patient Sign Up" },
          { href: "/signup/counselor", label: "Counselor Sign Up" }
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" }
        ]}
        socialLinks={[
          { 
            label: "Facebook", 
            href: "https://facebook.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          },
          { 
            label: "Twitter", 
            href: "https://twitter.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          },
          { 
            label: "Instagram", 
            href: "https://instagram.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-5.543 1.297c.718 0 1.297.579 1.297 1.297s-.579 1.297-1.297 1.297-1.297-.579-1.297-1.297.579-1.297 1.297-1.297z"/></svg>
          }
        ]}
        copyright={{
          text: "© 2025 Rwanda Cancer Relief",
          license: "All rights reserved."
        }}
        themeToggle={
          <div className="flex items-center justify-center">
            <ThemeTogglerButton variant="outline" size="default" direction="ltr" modes={['light', 'dark']} className="h-10 w-10 rounded-full" />
          </div>
        }
      />
    </main>
  );
}
