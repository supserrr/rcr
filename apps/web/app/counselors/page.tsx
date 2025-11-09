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
  photo?: string;
  bio: string;
  education: string;
  certifications: string[];
  consultationTypes: ('chat' | 'video' | 'phone')[];
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const sanitizeAvailability = (
  value?: string | null,
): 'available' | 'busy' | 'offline' => {
  if (value === 'busy' || value === 'offline') {
    return value;
  }
  return 'available';
};

const adminUserToLandingCounselor = (user: AdminUser): Counselor => {
  const metadata = (user.metadata ?? {}) as Record<string, unknown>;

  const name =
    typeof user.fullName === 'string' && user.fullName.trim().length > 0
      ? user.fullName
      : typeof metadata.full_name === 'string' && metadata.full_name.trim().length > 0
      ? metadata.full_name
      : user.email || 'Counselor';

  const title =
    (typeof metadata.title === 'string' && metadata.title.trim().length > 0
      ? metadata.title
      : typeof user.specialty === 'string' && user.specialty.trim().length > 0
      ? user.specialty
      : 'Counselor');

  const specialties = (() => {
    const specialtyList = toStringArray(metadata.specialties ?? metadata.expertise);
    if (specialtyList.length > 0) {
      return specialtyList;
    }
    if (typeof user.specialty === 'string' && user.specialty.trim().length > 0) {
      return [user.specialty.trim()];
    }
    return ['Counseling'];
  })();

  const languages = (() => {
    if (user.languages && user.languages.length > 0) {
      return user.languages;
    }
    const metadataLanguages = toStringArray(metadata.languages ?? metadata.language_preferences);
    if (metadataLanguages.length > 0) {
      return metadataLanguages;
    }
    return ['Kinyarwanda'];
  })();

  const experienceYearsRaw =
    typeof user.experience === 'number'
      ? user.experience
      : typeof metadata.experience === 'number'
      ? metadata.experience
      : typeof metadata.experienceYears === 'number'
      ? metadata.experienceYears
      : typeof metadata.experience_years === 'number'
      ? metadata.experience_years
      : undefined;

  const experienceYears =
    typeof experienceYearsRaw === 'number' && Number.isFinite(experienceYearsRaw)
      ? Math.max(0, Math.round(experienceYearsRaw))
      : undefined;

  const availability = sanitizeAvailability(
    user.availability ??
      (typeof metadata.availability === 'string' ? metadata.availability : undefined),
  );

  const bio =
    typeof metadata.bio === 'string' && metadata.bio.trim().length > 0
      ? metadata.bio
      : 'This counselor is here to support you throughout your journey.';

  const education =
    typeof metadata.education === 'string' && metadata.education.trim().length > 0
      ? metadata.education
      : 'Details coming soon.';

  const certifications =
    toStringArray(metadata.certifications ?? metadata.credentials ?? metadata.licenses);

  const consultationTypes = (() => {
    const types = toStringArray(metadata.consultation_types ?? metadata.consultationTypes);
    const allowed: ('chat' | 'video' | 'phone')[] = ['chat', 'video', 'phone'];
    const filtered = types
      .map((type) => type.toLowerCase())
      .filter((type): type is 'chat' | 'video' | 'phone' => allowed.includes(type as any));
    return filtered.length > 0 ? filtered : allowed;
  })();

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
    photo: user.avatarUrl,
    bio,
    education,
    certifications,
    consultationTypes,
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
      (typeof metadata.specialty === 'string' ? metadata.specialty : undefined),
    experience:
      (typeof profile.experience_years === 'number' ? profile.experience_years : undefined) ??
      (typeof metadata.experience === 'number' ? metadata.experience : undefined),
    availability:
      (typeof profile.availability === 'string' ? profile.availability : undefined) ??
      (typeof metadata.availability === 'string' ? metadata.availability : undefined),
    avatarUrl:
      (typeof profile.avatar_url === 'string' ? profile.avatar_url : undefined) ??
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined) ??
      (typeof metadata.avatar === 'string' ? metadata.avatar : undefined),
    phoneNumber:
      (typeof profile.phone_number === 'string' ? profile.phone_number : undefined) ??
      (typeof metadata.phoneNumber === 'string' ? metadata.phoneNumber : undefined),
    location:
      (typeof metadata.location === 'string' ? metadata.location : undefined),
    languages: toStringArray(metadata.languages ?? metadata.language_preferences),
    bio: typeof metadata.bio === 'string' ? metadata.bio : undefined,
    credentials: metadata.credentials as string | string[] | undefined,
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
      : 'Experience info coming soon';

  const description = `${counselor.title}${
    experienceLabel ? ` • ${experienceLabel}` : ''
  }`;

  return (
    <div className="relative w-80 h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm dark:shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Full Cover Image */}
      <img
        src={counselor.photo}
        alt={counselor.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

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
        const mapped = response.users.map(adminUserToLandingCounselor).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
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
        const existingIndex = previous.findIndex((c) => c.id === counselor.id);

        if (eventType === 'DELETE') {
          if (existingIndex === -1) {
            return previous;
          }
          const next = [...previous];
          next.splice(existingIndex, 1);
          return next;
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
