'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { LandingStyleCounselorCard } from '@workspace/ui/components/landing-style-counselor-card';
import { SessionBookingModal } from '../../../../components/session/SessionBookingModal';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Search, Filter, Star } from 'lucide-react';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import type { Counselor } from '@workspace/ui/lib/types';

type CounselorProfile = Counselor & {
  metadata?: Record<string, unknown>;
  phoneNumber?: string;
  location?: string;
  languages?: string[];
  bio?: string;
  credentials?: string;
};

const toString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
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

const findStringArrayByKeys = (
  subject: unknown,
  keys: Set<string>,
  visited: WeakSet<object> = new WeakSet(),
): string[] | undefined => {
  if (Array.isArray(subject)) {
    for (const item of subject) {
      const nested = findStringArrayByKeys(item, keys, visited);
      if (nested && nested.length > 0) {
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
      const arrayCandidate = toStringArray(rawValue);
      if (arrayCandidate && arrayCandidate.length > 0) {
        return arrayCandidate;
      }
      const stringCandidate = extractStringCandidate(rawValue);
      if (stringCandidate) {
        return [stringCandidate];
      }
    }
    const nested = findStringArrayByKeys(rawValue, keys, visited);
    if (nested && nested.length > 0) {
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
]);

const EMAIL_KEYS = createKeySet(['email', 'contact_email', 'primary_email', 'work_email']);
const PHONE_KEYS = createKeySet([
  'phone',
  'phone_number',
  'phonenumber',
  'contact_phone',
  'mobile',
  'mobile_phone',
]);
const LOCATION_KEYS = createKeySet(['location', 'city', 'country', 'address']);
const BIO_KEYS = createKeySet(['bio', 'about', 'description', 'summary', 'profile_bio']);
const CREDENTIAL_KEYS = createKeySet([
  'credentials',
  'certifications',
  'licenses',
  'qualifications',
  'achievements',
]);
const LANGUAGE_KEYS = createKeySet([
  'languages',
  'language_preferences',
  'spoken_languages',
  'preferred_languages',
]);

const sanitizeAvailability = (value?: string): Counselor['availability'] => {
  if (value === 'busy' || value === 'offline') {
    return value;
  }
  return 'available';
};

const mapAdminUserToCounselor = (user: AdminUser): CounselorProfile => {
  const metadata = (user.metadata ?? {}) as Record<string, unknown>;
  const specialty =
    toString(user.specialty) ??
    toString(metadata.specialty) ??
    toStringArray(metadata.specialties)?.[0] ??
    toString(metadata.expertise) ??
    'General Counseling';

  const experience =
    toNumber(user.experience) ??
    toNumber(metadata.experience) ??
    toNumber(metadata.experienceYears) ??
    toNumber(metadata.experience_years) ??
    0;

  const availability = sanitizeAvailability(
    toString(user.availability) ?? toString(metadata.availability),
  );

  const avatar =
    toString(user.avatarUrl) ??
    findStringByKeys(metadata, AVATAR_KEYS);

  const phoneNumber =
    toString(user.phoneNumber) ??
    findStringByKeys(metadata, PHONE_KEYS);

  const location =
    toString(user.location) ??
    findStringByKeys(metadata, LOCATION_KEYS);

  const languages =
    toStringArray(user.languages) ??
    findStringArrayByKeys(metadata, LANGUAGE_KEYS);

  const bio =
    toString(user.bio) ??
    findStringByKeys(metadata, BIO_KEYS);

  const credentialSource =
    user.credentials ??
    metadata.credentials ??
    metadata.certifications ??
    metadata.licenses;

  const credentialArray = toStringArray(credentialSource);
  const credentialString = credentialArray?.join(', ') ?? toString(credentialSource);

  const patients = toStringArray(metadata.patients);

  const name =
    toString(user.fullName) ??
    toString(metadata.full_name) ??
    toString(metadata.name) ??
    toString(user.email) ??
    'Counselor';

  const createdAt =
    toString(user.createdAt) ??
    new Date().toISOString();

  const credentialText =
    credentialString ??
    findStringByKeys(metadata, CREDENTIAL_KEYS);

  const email =
    toString(user.email) ??
    findStringByKeys(metadata, EMAIL_KEYS) ??
    '';

  return {
    id: user.id,
    name,
    email,
    role: 'counselor',
    avatar,
    createdAt: new Date(createdAt),
    specialty,
    experience,
    availability,
    patients,
    metadata,
    phoneNumber,
    location,
    languages,
    bio,
    credentials: credentialText ?? undefined,
  };
};

export default function PatientCounselorsPage() {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState<CounselorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedCounselor, setSelectedCounselor] = useState<CounselorProfile | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfileCounselor, setSelectedProfileCounselor] = useState<CounselorProfile | null>(null);

  // Load counselors
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        const mapped = response.users.map(mapAdminUserToCounselor);
        if (typeof window !== 'undefined') {
          (window as unknown as { __RCR_counselors?: unknown }).__RCR_counselors = {
            raw: response.users,
            mapped,
          };
        }
        console.log('[patient counselors] raw admin users', response.users);
        setCounselors(mapped);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            console.log('[patient counselors] mapped counselors state', mapped);
          }, 0);
        }
      } catch (error) {
        console.error('Error loading counselors:', error);
        toast.error('Failed to load counselors');
      } finally {
        setLoading(false);
      }
    };

    loadCounselors();
  }, []);

  // Get unique specialties from counselors
  const specialties = useMemo(() => {
    const values = new Set<string>();
    counselors.forEach((counselor) => {
      if (counselor.specialty) {
        values.add(counselor.specialty);
      }
    });
    return ['all', ...Array.from(values)];
  }, [counselors]);
  const availabilityOptions = ['all', 'available', 'busy', 'offline'];

  const filteredCounselors = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return counselors.filter((counselor) => {
      const matchesSearch =
        search.length === 0 ||
        counselor.name.toLowerCase().includes(search) ||
        (counselor.specialty?.toLowerCase().includes(search) ?? false) ||
        (counselor.bio?.toLowerCase().includes(search) ?? false);

      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        counselor.specialty?.toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesAvailability =
        selectedAvailability === 'all' ||
        counselor.availability === selectedAvailability;
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });
  }, [counselors, searchTerm, selectedSpecialty, selectedAvailability]);

  const handleBookSession = (counselorId: string) => {
    const counselor = counselors.find(c => c.id === counselorId);
    if (counselor) {
      setSelectedCounselor(counselor);
      setIsBookingModalOpen(true);
    }
  };

  const handleConfirmBooking = (bookingData: any) => {
    console.log('Booking confirmed:', bookingData);
    // Here you would typically send the booking data to your backend
    // For now, we'll just log it
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedCounselor(null);
  };

  const handleViewProfile = (counselorId: string) => {
    const counselor = counselors.find(c => c.id === counselorId);
    if (counselor) {
      setSelectedProfileCounselor(counselor);
      setIsProfileOpen(true);
    }
  };

  const handleSendMessage = (counselorId: string) => {
    console.log('Send message to counselor:', counselorId);
    // Implement messaging logic
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Find a Counselor"
        description="Connect with experienced counselors who can support you on your journey"
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search counselors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty === 'all' ? 'All Specialties' : specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            {availabilityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'all' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtered by your criteria</span>
        </div>
      </div>

      {/* Counselors Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner variant="bars" size={32} className="text-primary" />
        </div>
      ) : filteredCounselors.length > 0 ? (
        <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
          {filteredCounselors.map((counselor, index) => (
            <LandingStyleCounselorCard
              key={counselor.id}
              id={counselor.id}
              name={counselor.name}
              avatar={counselor.avatar}
              specialty={counselor.specialty}
              availability={counselor.availability}
              experience={counselor.experience}
              onBookSession={handleBookSession}
              onViewProfile={handleViewProfile}
              delay={index * 0.1}
            />
          ))}
        </AnimatedGrid>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No counselors found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('all');
              setSelectedAvailability('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Featured Counselors */}
      {counselors.filter(c => (c.experience ?? 0) >= 5).length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-foreground" />
            <h2 className="text-xl font-semibold">Featured Counselors</h2>
          </div>
          
          <AnimatedGrid className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
            {counselors
              .filter(counselor => (counselor.experience ?? 0) >= 5)
              .slice(0, 4)
              .map((counselor, index) => (
                <div key={counselor.id} className="relative">
                  <LandingStyleCounselorCard
                    id={counselor.id}
                    name={counselor.name}
                    avatar={counselor.avatar}
                    specialty={counselor.specialty}
                    availability={counselor.availability}
                    experience={counselor.experience}
                    onBookSession={handleBookSession}
                    onViewProfile={handleViewProfile}
                    delay={index * 0.15}
                  />
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg z-30">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              ))}
          </AnimatedGrid>
        </div>
      )}

      {/* Booking Modal */}
      {selectedCounselor && (
        <SessionBookingModal
          counselor={selectedCounselor}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookingConfirmed={handleConfirmBooking}
        />
      )}

      {/* Profile View Modal */}
      {selectedProfileCounselor && (
        <ProfileViewModal
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedProfileCounselor(null);
          }}
          user={selectedProfileCounselor}
          userType="counselor"
          currentUserRole="patient"
        />
      )}
    </div>
  );
}
