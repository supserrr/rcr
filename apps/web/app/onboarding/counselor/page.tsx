'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building,
  Calendar,
  CheckCircle,
  ClipboardList,
  Globe,
  GraduationCap,
  MessageCircle,
  Phone,
  ShieldCheck,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { AuthApi } from '../../../lib/api/auth';
import type {
  VisibilitySurface,
  VisibilitySettings,
  CounselorAvailabilityStatus,
  CounselorDocument,
} from '../../../lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { isOnboardingComplete, getDashboardRoute } from '../../../lib/auth';

interface CounselorOnboardingData {
  professionalTitle: string;
  practiceName: string;
  practiceLocation: string;
  serviceRegionsNote: string;
  serviceRegions: string[];
  primaryTimezone: string;
  supportedTimezones: string[];
  contactPhone: string;
  languages: string[];
  bio: string;
  approachSummary: string;
  yearsExperience: string;
  professionalHighlightsNote: string;
  professionalHighlights: string[];
  licenseNumber: string;
  licenseJurisdiction: string;
  licenseExpiry: string;
  issuingAuthority: string;
  highestDegree: string;
  university: string;
  graduationYear: string;
  hasLicense: boolean;
  resumeFile: File | null;
  licenseFile: File | null;
  certificationFiles: File[];
  specializations: string[];
  demographicsServed: string[];
  sessionModalities: string[];
  sessionDurations: number[];
  availabilityStatus: CounselorAvailabilityStatus;
  acceptingNewPatients: boolean;
  waitlistEnabled: boolean;
  telehealthOffered: boolean;
  inPersonOffered: boolean;
  supportedTimezonesNote: string;
  cpdStatus: string;
  cpdRenewalDueAt: string;
  professionalReferencesNote: string;
  motivationStatement: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  visibility: Record<VisibilitySurface, boolean>;
  consentAcknowledged: boolean;
  profileImage: File | null;
  profileImagePreview: string;
}

const TOTAL_STEPS = 5;

const LANGUAGE_OPTIONS = ['Kinyarwanda', 'English', 'French', 'Swahili'];

const SPECIALIZATION_OPTIONS = [
  'Cancer Support',
  'Grief Counseling',
  'Family Therapy',
  'Anxiety Management',
  'Depression Support',
  'Trauma Therapy',
  'Palliative Care',
  'Spiritual Counseling',
  'Peer Support',
  'Child & Adolescent Therapy',
  'Couples Counseling',
];

const DEMOGRAPHIC_OPTIONS = [
  'Adults',
  'Teens',
  'Children',
  'Caregivers',
  'Families',
  'Survivors',
  'Newly Diagnosed',
  'End-of-Life',
];

const TIMEZONE_OPTIONS = [
  'Africa/Kigali',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'UTC',
];

const SERVICE_REGION_SUGGESTIONS = [
  'Kigali City',
  'Northern Province',
  'Southern Province',
  'Eastern Province',
  'Western Province',
  'Remote / Telehealth',
];

const SESSION_MODALITY_OPTIONS: Array<{ value: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'chat', label: 'Text Chat', icon: MessageCircle },
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In-person', icon: Building },
];

const SESSION_DURATION_OPTIONS = [30, 45, 60, 90];

const VISIBILITY_SURFACES: Array<{ key: VisibilitySurface; title: string; description: string }> = [
  {
    key: 'publicLanding',
    title: 'Public Landing Page',
    description: 'Appear on the public counselors page so patients can discover you before signing in.',
  },
  {
    key: 'patientDirectory',
    title: 'Patient Directory',
    description: 'Be searchable by patients inside the app when they look for support.',
  },
  {
    key: 'internal',
    title: 'Internal Team Directory',
    description: 'Allow admins and fellow counselors to view your profile for coordination.',
  },
];

const AVAILABILITY_OPTIONS: Array<{ value: CounselorAvailabilityStatus; label: string; description: string }> = [
  {
    value: 'available',
    label: 'Available',
    description: 'Open to taking new patients immediately.',
  },
  {
    value: 'limited',
    label: 'Limited Availability',
    description: 'Limited slots remaining each week.',
  },
  {
    value: 'waitlist',
    label: 'Waitlist Only',
    description: 'Invite patients to join your waitlist for future openings.',
  },
  {
    value: 'unavailable',
    label: 'Temporarily Unavailable',
    description: 'Not accepting new sessions until further notice.',
  },
];

const createInitialFormData = (): CounselorOnboardingData => ({
  professionalTitle: '',
  practiceName: '',
  practiceLocation: '',
  serviceRegionsNote: '',
  serviceRegions: [],
  primaryTimezone: 'Africa/Kigali',
  supportedTimezones: ['Africa/Kigali'],
  contactPhone: '',
  languages: [],
  bio: '',
  approachSummary: '',
  yearsExperience: '',
  professionalHighlightsNote: '',
  professionalHighlights: [],
  licenseNumber: '',
  licenseJurisdiction: '',
  licenseExpiry: '',
  issuingAuthority: '',
  highestDegree: '',
  university: '',
  graduationYear: '',
  hasLicense: true,
  resumeFile: null,
  licenseFile: null,
  certificationFiles: [],
  specializations: [],
  demographicsServed: [],
  sessionModalities: ['chat', 'video', 'phone'],
  sessionDurations: [60],
  availabilityStatus: 'available',
  acceptingNewPatients: true,
  waitlistEnabled: false,
  telehealthOffered: true,
  inPersonOffered: false,
  supportedTimezonesNote: '',
  cpdStatus: 'current',
  cpdRenewalDueAt: '',
  professionalReferencesNote: '',
  motivationStatement: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  visibility: {
    publicLanding: true,
    patientDirectory: true,
    internal: true,
  },
  consentAcknowledged: false,
  profileImage: null,
  profileImagePreview: '',
});

const toVisibilitySettings = (visibility: Record<VisibilitySurface, boolean>): VisibilitySettings => ({
  publicLanding: visibility.publicLanding,
  patientDirectory: visibility.patientDirectory,
  internal: visibility.internal,
});

const parseMultilineList = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const parseProfessionalReferences = (value: string) =>
  parseMultilineList(value).map((line) => {
    const [name, organization, email, phone] = line.split('|').map((part) => part.trim());
    return {
      name,
      organization,
      email,
      phone,
    };
  });

const toggleValue = <T,>(collection: T[], value: T): T[] =>
  collection.includes(value)
    ? collection.filter((item) => item !== value)
    : [...collection, value];

export default function CounselorOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, checkAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  const certificationFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CounselorOnboardingData>(createInitialFormData);

  const progressPercent = useMemo(
    () => Math.round((currentStep / TOTAL_STEPS) * 100),
    [currentStep],
  );

  // Check if user has already completed onboarding and redirect
  useEffect(() => {
    if (!authLoading && user) {
      const onboardingComplete = isOnboardingComplete(user);
      if (onboardingComplete) {
        // User has already completed onboarding, redirect to dashboard
        const dashboardRoute = getDashboardRoute(user.role);
        router.replace(dashboardRoute);
      }
    }
  }, [user, authLoading, router]);

  const handleVisibilityToggle = (surface: VisibilitySurface, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [surface]: value,
      },
    }));
  };

  const handleLanguagesToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: toggleValue(prev.languages, language),
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: toggleValue(prev.specializations, specialization),
    }));
  };

  const handleDemographicsToggle = (demographic: string) => {
    setFormData((prev) => ({
      ...prev,
      demographicsServed: toggleValue(prev.demographicsServed, demographic),
    }));
  };

  const handleModalityToggle = (modality: string) => {
    setFormData((prev) => ({
      ...prev,
      sessionModalities: toggleValue(prev.sessionModalities, modality),
    }));
  };

  const handleDurationToggle = (duration: number) => {
    setFormData((prev) => ({
      ...prev,
      sessionDurations: prev.sessionDurations.includes(duration)
        ? prev.sessionDurations.filter((value) => value !== duration)
        : [...prev.sessionDurations, duration].sort((a, b) => a - b),
    }));
  };

  const handleProfileImageChange = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: null,
        profileImagePreview: '',
      }));
      return;
    }
    const isImage = /image\/png|image\/jpeg|image\/jpg/.test(file.type);
    const isSmallEnough = file.size <= 2 * 1024 * 1024;
    if (!isImage || !isSmallEnough) {
      toast.error('Please upload a JPG or PNG image up to 2MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
      profileImagePreview: previewUrl,
    }));
  };

  const handleFileListChange = (files: FileList | null, key: 'resumeFile' | 'licenseFile' | 'certificationFiles') => {
    if (!formData.hasLicense && (key === 'licenseFile' || key === 'certificationFiles')) {
      return;
    }
    if (!files || files.length === 0) {
      if (key === 'certificationFiles') {
        setFormData((prev) => ({ ...prev, certificationFiles: [] }));
      } else {
        setFormData((prev) => ({ ...prev, [key]: null }));
      }
      return;
    }

    if (key === 'certificationFiles') {
      setFormData((prev) => ({
        ...prev,
        certificationFiles: Array.from(files),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: files[0],
    }));
  };

  const handleLicenseToggle = (value: boolean) => {
    setFormData((prev) => {
      if (value) {
        return {
          ...prev,
          hasLicense: false,
          licenseNumber: '',
          issuingAuthority: '',
          licenseJurisdiction: '',
          licenseExpiry: '',
          licenseFile: null,
          certificationFiles: [],
        };
      }

      return {
        ...prev,
        hasLicense: true,
      };
    });
  };

  // Validation function for each step
  const validateStep = (step: number): { isValid: boolean; errorMessage?: string } => {
    switch (step) {
      case 1: // Account Basics
        if (!formData.bio.trim()) {
          return { isValid: false, errorMessage: 'Please provide a short bio.' };
        }
        if (!formData.approachSummary.trim()) {
          return { isValid: false, errorMessage: 'Please describe your therapeutic approach.' };
        }
        if (formData.languages.length === 0) {
          return { isValid: false, errorMessage: 'Please select at least one language you provide support in.' };
        }
        if (formData.serviceRegions.length === 0) {
          return { isValid: false, errorMessage: 'Please select at least one region you serve.' };
        }
        return { isValid: true };
      
      case 2: // Professional Credentials
        if (!formData.resumeFile) {
          return { isValid: false, errorMessage: 'Please upload your resume/CV (required).' };
        }
        if (formData.hasLicense && !formData.licenseFile) {
          return { isValid: false, errorMessage: 'Please upload your license document (required when license is provided).' };
        }
        return { isValid: true };
      
      case 3: // Practice Details
        if (formData.specializations.length === 0) {
          return { isValid: false, errorMessage: 'Please select at least one specialization.' };
        }
        if (!formData.motivationStatement.trim()) {
          return { isValid: false, errorMessage: 'Please provide your motivation to join RCR.' };
        }
        return { isValid: true };
      
      case 4: // Care Delivery & Availability
        if (formData.sessionModalities.length === 0) {
          return { isValid: false, errorMessage: 'Please select at least one session modality.' };
        }
        if (formData.sessionDurations.length === 0) {
          return { isValid: false, errorMessage: 'Please select at least one session duration.' };
        }
        return { isValid: true };
      
      case 5: // Emergency Contact & Consent
        if (!formData.emergencyContactName.trim()) {
          return { isValid: false, errorMessage: 'Please provide your emergency contact name.' };
        }
        if (!formData.emergencyContactPhone.trim()) {
          return { isValid: false, errorMessage: 'Please provide your emergency contact phone number.' };
        }
        if (!formData.consentAcknowledged) {
          return { isValid: false, errorMessage: 'Please acknowledge that your information is accurate.' };
        }
        return { isValid: true };
      
      default:
        return { isValid: true };
    }
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || 'Please complete all required fields before continuing.');
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((step) => step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const handleSubmit = async () => {
    // Final validation before submission
    const validation = validateStep(TOTAL_STEPS);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || 'Please complete all required fields before submitting.');
      return;
    }

    if (!formData.consentAcknowledged) {
      toast.error('Please acknowledge that your information is accurate before submitting.');
      return;
    }

    setIsSubmitting(true);
    const submittedAt = new Date().toISOString();

    try {
      let avatarUrl: string | undefined;
      if (formData.profileImage) {
        try {
          const uploadResult = await AuthApi.uploadProfileImage(formData.profileImage);
          avatarUrl = uploadResult.url;
          toast.success('Profile image uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          toast.error('Failed to upload profile image. Continuing without image...');
        }
      }

      const visibilitySettings = toVisibilitySettings(formData.visibility);
      const trimmedProfessionalTitle = formData.professionalTitle.trim();
      const hasLicense = formData.hasLicense;

      const shouldUploadDocuments =
        Boolean(formData.resumeFile) ||
        (hasLicense && (Boolean(formData.licenseFile) || formData.certificationFiles.length > 0));

      let uploadedDocuments: CounselorDocument[] = [];
      if (shouldUploadDocuments) {
        uploadedDocuments = await AuthApi.uploadCounselorDocuments({
          resumeFile: formData.resumeFile ?? undefined,
          licenseFile: hasLicense ? formData.licenseFile ?? undefined : undefined,
          certificationFiles: hasLicense ? formData.certificationFiles : [],
        });
      }

      const resumeDocument = uploadedDocuments.find((document) => document.documentType === 'resume');
      const licenseDocument = uploadedDocuments.find((document) => document.documentType === 'license');
      const certificationDocumentUploads = uploadedDocuments.filter(
        (document) => document.documentType === 'certification',
      );

      const certificationDocumentsForProfile =
        certificationDocumentUploads.length > 0
          ? certificationDocumentUploads.map((document) => ({
              name: document.displayName ?? 'Certification',
              url: document.storagePath,
            }))
          : [];

      const uploadedDocumentsMetadata =
        uploadedDocuments.length > 0
          ? uploadedDocuments.map((document) => ({
              label: document.displayName ?? document.documentType,
              url: document.storagePath,
              type: document.documentType,
            }))
          : [];

      const counselorProfilePayload = {
        practiceName: formData.practiceName.trim() || undefined,
        practiceLocation: formData.practiceLocation.trim() || undefined,
        serviceRegions: formData.serviceRegions,
        primaryTimezone: formData.primaryTimezone,
        supportedTimezones: formData.supportedTimezones,
        acceptingNewPatients: formData.acceptingNewPatients,
        waitlistEnabled: formData.waitlistEnabled,
        availabilityStatus: formData.availabilityStatus,
        sessionModalities: formData.sessionModalities,
        sessionDurations: formData.sessionDurations,
        telehealthOffered: formData.telehealthOffered,
        inPersonOffered: formData.inPersonOffered,
        languages: formData.languages,
        specializations: formData.specializations,
        demographicsServed: formData.demographicsServed,
        approachSummary: formData.approachSummary.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        yearsExperience: formData.yearsExperience ? Number.parseInt(formData.yearsExperience, 10) : undefined,
        professionalHighlights: formData.professionalHighlights,
        licenseNumber: hasLicense ? formData.licenseNumber.trim() || undefined : undefined,
        licenseJurisdiction: hasLicense ? formData.licenseJurisdiction.trim() || undefined : undefined,
        licenseExpiry: hasLicense ? formData.licenseExpiry || undefined : undefined,
        licenseDocumentUrl: licenseDocument?.storagePath ?? undefined,
        resumeUrl: resumeDocument?.storagePath ?? undefined,
        certificationDocuments: certificationDocumentsForProfile,
        cpdStatus: formData.cpdStatus.trim() || undefined,
        cpdRenewalDueAt: formData.cpdRenewalDueAt || undefined,
        professionalReferences: parseProfessionalReferences(formData.professionalReferencesNote),
        motivationStatement: formData.motivationStatement.trim() || undefined,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        metadata: {
          professionalTitle: trimmedProfessionalTitle || undefined,
          licenseProvided: hasLicense,
          certificationFileNames:
            certificationDocumentUploads.length > 0
              ? certificationDocumentUploads.map(
                  (document) => document.displayName ?? document.storagePath.split('/').pop() ?? 'Certification',
                )
              : formData.certificationFiles.map((file) => file.name),
          resumeFileName:
            resumeDocument?.displayName ?? formData.resumeFile?.name ?? undefined,
          licenseFileName: hasLicense
            ? licenseDocument?.displayName ?? formData.licenseFile?.name ?? undefined
            : undefined,
        },
      };

      const metadata: Record<string, unknown> = {
        professionalTitle: trimmedProfessionalTitle || undefined,
        title: trimmedProfessionalTitle || undefined,
        practiceName: formData.practiceName,
        practiceLocation: formData.practiceLocation,
        serviceRegions: formData.serviceRegions,
        primaryTimezone: formData.primaryTimezone,
        supportedTimezones: formData.supportedTimezones,
        contactPhone: formData.contactPhone,
        languages: formData.languages,
        bio: formData.bio,
        approachSummary: formData.approachSummary,
        yearsOfExperience: formData.yearsExperience,
        professionalHighlights: formData.professionalHighlights,
        licenseNumber: hasLicense ? formData.licenseNumber : undefined,
        licenseJurisdiction: hasLicense ? formData.licenseJurisdiction : undefined,
        licenseExpiry: hasLicense ? formData.licenseExpiry : undefined,
        issuingAuthority: hasLicense ? formData.issuingAuthority : undefined,
        highestDegree: formData.highestDegree,
        university: formData.university,
        graduationYear: formData.graduationYear,
        specializations: formData.specializations,
        demographicsServed: formData.demographicsServed,
        sessionModalities: formData.sessionModalities,
        sessionDurations: formData.sessionDurations,
        availabilityStatus: formData.availabilityStatus,
        acceptingNewPatients: formData.acceptingNewPatients,
        waitlistEnabled: formData.waitlistEnabled,
        telehealthOffered: formData.telehealthOffered,
        inPersonOffered: formData.inPersonOffered,
        cpdStatus: formData.cpdStatus,
        cpdRenewalDueAt: formData.cpdRenewalDueAt,
        licenseProvided: hasLicense,
        professionalReferencesRaw: formData.professionalReferencesNote,
        motivation: formData.motivationStatement,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        visibilitySettings,
        onboarding_completed: true,
        onboarding_completed_at: submittedAt,
      };

      if (uploadedDocumentsMetadata.length > 0) {
        metadata.uploadedDocuments = uploadedDocumentsMetadata;
        metadata.documents = uploadedDocumentsMetadata;
      }

      if (resumeDocument) {
        metadata.resumeFile = resumeDocument.storagePath;
        metadata.resume_file = resumeDocument.storagePath;
        metadata.resumeFileName = resumeDocument.displayName ?? resumeDocument.storagePath.split('/').pop();
      } else if (formData.resumeFile?.name) {
        metadata.resumeFileName = formData.resumeFile.name;
      }

      if (licenseDocument) {
        metadata.licenseFile = licenseDocument.storagePath;
        metadata.license_file = licenseDocument.storagePath;
        metadata.licenseFileName = licenseDocument.displayName ?? licenseDocument.storagePath.split('/').pop();
      } else if (hasLicense && formData.licenseFile?.name) {
        metadata.licenseFileName = formData.licenseFile.name;
      }

      if (certificationDocumentsForProfile.length > 0) {
        metadata.certificationDocuments = certificationDocumentsForProfile;
        metadata.certification_documents = certificationDocumentsForProfile;
        metadata.certificationFileNames = certificationDocumentsForProfile
          .map((document) => document.name)
          .filter(Boolean);
      } else if (formData.certificationFiles.length > 0) {
        metadata.certificationFileNames = formData.certificationFiles.map((file) => file.name);
      }

      const updatePayload = {
        professionalTitle: trimmedProfessionalTitle || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        metadata,
        avatar: avatarUrl,
        visibilitySettings,
        approvalStatus: 'pending' as const,
        approvalSubmittedAt: submittedAt,
        counselorProfile: counselorProfilePayload,
      };

      await AuthApi.updateProfile(updatePayload);
      await checkAuth();

      toast.success('Thanks! Your application is submitted for review. We will notify you as soon as it is approved.');
      router.push('/dashboard/counselor/pending');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Account Basics</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Introduce yourself, describe your practice, and upload a profile photo so patients recognize you.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Professional Title <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., Dr., Counselor, Reverend"
          value={formData.professionalTitle}
          onChange={(event) => setFormData((prev) => ({ ...prev, professionalTitle: event.target.value }))}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Add an honorific or role label that should appear before your name.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Practice or Organization Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="Rwanda Cancer Relief Counseling Center"
            value={formData.practiceName}
            onChange={(event) => setFormData((prev) => ({ ...prev, practiceName: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">Leave blank if you practice independently.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Primary Contact Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="tel"
            placeholder="e.g., +250 700 000 000"
            value={formData.contactPhone}
            onChange={(event) => setFormData((prev) => ({ ...prev, contactPhone: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">Shared with the Rwanda Cancer Relief team for coordination only.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Primary Practice Location <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="City, facility, or telehealth"
            value={formData.practiceLocation}
            onChange={(event) => setFormData((prev) => ({ ...prev, practiceLocation: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">Mention where patients will typically meet you, even if remote.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Primary Timezone <span className="text-muted-foreground">(choose the one you use most)</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={formData.primaryTimezone}
            onChange={(event) => setFormData((prev) => ({ ...prev, primaryTimezone: event.target.value }))}
          >
            {TIMEZONE_OPTIONS.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">We use this to schedule sessions at the right hours.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Regions You Serve <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SERVICE_REGION_SUGGESTIONS.map((region) => (
            <Badge
              key={region}
              variant={formData.serviceRegions.includes(region) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  serviceRegions: toggleValue(prev.serviceRegions, region),
                }))
              }
            >
              {region}
            </Badge>
          ))}
        </div>
        <Textarea
          placeholder="Add any additional regions (one per line)"
          value={formData.serviceRegionsNote}
          onChange={(event) => {
            const note = event.target.value;
            const additionalRegions = parseMultilineList(note);
            setFormData((prev) => ({
              ...prev,
              serviceRegionsNote: note,
              serviceRegions: Array.from(
                new Set([...prev.serviceRegions.filter((region) => SERVICE_REGION_SUGGESTIONS.includes(region)), ...additionalRegions]),
              ),
            }));
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Languages You Provide Support In <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => handleLanguagesToggle(language)}
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.languages.includes(language)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Short Bio <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Share your background, years of service, and what inspires your work."
            value={formData.bio}
            onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
            className="min-h-[120px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Therapeutic Approach <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Focus areas, methodologies, and what patients can expect in sessions."
            value={formData.approachSummary}
            onChange={(event) => setFormData((prev) => ({ ...prev, approachSummary: event.target.value }))}
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Years of Professional Experience</label>
          <Input
            type="number"
            min={0}
            placeholder="e.g., 5"
            value={formData.yearsExperience}
            onChange={(event) => setFormData((prev) => ({ ...prev, yearsExperience: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Professional Highlights (optional)</label>
          <Textarea
            placeholder="Add awards or recognitions (one per line)"
            value={formData.professionalHighlightsNote}
            onChange={(event) => {
              const note = event.target.value;
              setFormData((prev) => ({
                ...prev,
                professionalHighlightsNote: note,
                professionalHighlights: parseMultilineList(note),
              }));
            }}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
        <Avatar className="h-24 w-24">
          {formData.profileImagePreview ? (
            <AvatarImage src={formData.profileImagePreview} alt="Profile preview" />
          ) : (
            <AvatarFallback>CP</AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center gap-3">
          <input
            ref={profileFileInputRef}
            id="counselor-profile-upload"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(event) => handleProfileImageChange(event.target.files?.[0] || null)}
          />
          <Button variant="outline" size="sm" type="button" onClick={() => profileFileInputRef.current?.click()}>
            Upload Photo
          </Button>
          {formData.profileImage && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => handleProfileImageChange(null)}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG or PNG, up to 2MB</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Professional Credentials</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share your education and licensing so we can verify compliance before activating your account.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/10 p-4">
        <Switch
          checked={!formData.hasLicense}
          onCheckedChange={handleLicenseToggle}
          aria-label="Toggle license requirement"
        />
        <div>
          <p className="text-sm font-medium text-foreground">I don’t have an active license yet</p>
          <p className="text-xs text-muted-foreground">
            If you are still in training or awaiting documentation, you can skip the license upload for now and add it later from your settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            License Number <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., RCR-2025-1234"
            value={formData.licenseNumber}
            onChange={(event) => setFormData((prev) => ({ ...prev, licenseNumber: event.target.value }))}
            disabled={!formData.hasLicense}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Issuing Authority <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="Rwanda Medical Council"
            value={formData.issuingAuthority}
            onChange={(event) => setFormData((prev) => ({ ...prev, issuingAuthority: event.target.value }))}
            disabled={!formData.hasLicense}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            License Jurisdiction <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="Province, country, or licensing board"
            value={formData.licenseJurisdiction}
            onChange={(event) => setFormData((prev) => ({ ...prev, licenseJurisdiction: event.target.value }))}
            disabled={!formData.hasLicense}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            License Expiry Date <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="date"
            value={formData.licenseExpiry}
            onChange={(event) => setFormData((prev) => ({ ...prev, licenseExpiry: event.target.value }))}
            disabled={!formData.hasLicense}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Highest Degree</label>
          <Input
            type="text"
            placeholder="e.g., Master of Counseling"
            value={formData.highestDegree}
            onChange={(event) => setFormData((prev) => ({ ...prev, highestDegree: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Institution</label>
          <Input
            type="text"
            placeholder="University or training center"
            value={formData.university}
            onChange={(event) => setFormData((prev) => ({ ...prev, university: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Graduation Year</label>
          <Input
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            placeholder="e.g., 2018"
            value={formData.graduationYear}
            onChange={(event) => setFormData((prev) => ({ ...prev, graduationYear: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload Resume/CV (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.resumeFile ? formData.resumeFile.name : 'Click to upload or drag and drop'}
            </p>
            <input
              ref={resumeFileInputRef}
              type="file"
              accept=".pdf"
              onChange={(event) => handleFileListChange(event.target.files, 'resumeFile')}
              className="hidden"
              id="resume-upload"
            />
            <Button variant="outline" size="sm" type="button" onClick={() => resumeFileInputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload License (PDF/Image) {formData.hasLicense && <span className="text-red-500">*</span>}
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              formData.hasLicense ? 'border-border' : 'border-border/50 bg-muted/30 text-muted-foreground'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.hasLicense
                ? formData.licenseFile
                  ? formData.licenseFile.name
                  : 'Click to upload or drag and drop'
                : 'You can add your license later from settings.'}
            </p>
            <input
              ref={licenseFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => handleFileListChange(event.target.files, 'licenseFile')}
              className="hidden"
              id="license-upload"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => licenseFileInputRef.current?.click()}
              disabled={!formData.hasLicense}
            >
              Choose File
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Certifications (PDF/Image)</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              formData.hasLicense ? 'border-border' : 'border-border/50 bg-muted/30 text-muted-foreground'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {formData.hasLicense
                ? formData.certificationFiles.length > 0
                  ? `${formData.certificationFiles.length} file(s) selected`
                  : 'Click to upload or drag and drop'
                : 'You can upload certifications once they are issued.'}
            </p>
            <input
              ref={certificationFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(event) => handleFileListChange(event.target.files, 'certificationFiles')}
              className="hidden"
              id="certifications-upload"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => certificationFileInputRef.current?.click()}
              disabled={!formData.hasLicense}
            >
              Choose File(s)
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-muted/10 border border-border rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm text-muted-foreground">
            Uploading documents now speeds up approval, but you can also add missing items later from your settings.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Practice Details</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Help patients understand who you serve and the areas you specialize in.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Specializations <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SPECIALIZATION_OPTIONS.map((specialization) => (
            <button
              key={specialization}
              type="button"
              onClick={() => handleSpecializationToggle(specialization)}
              className={`p-3 rounded-lg border text-left transition-all ${
                formData.specializations.includes(specialization)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {specialization}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Populations You Serve</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMOGRAPHIC_OPTIONS.map((demographic) => (
            <button
              key={demographic}
              type="button"
              onClick={() => handleDemographicsToggle(demographic)}
              className={`p-3 rounded-lg border text-center transition-all ${
                formData.demographicsServed.includes(demographic)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {demographic}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Motivation to Join RCR <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="What inspires you to support cancer patients and families?"
            value={formData.motivationStatement}
            onChange={(event) => setFormData((prev) => ({ ...prev, motivationStatement: event.target.value }))}
            className="min-h-[120px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Professional References</label>
          <Textarea
            placeholder="Format: Name | Organization | Email | Phone (one per line)"
            value={formData.professionalReferencesNote}
            onChange={(event) => setFormData((prev) => ({ ...prev, professionalReferencesNote: event.target.value }))}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Care Delivery & Availability</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tell us how you deliver care so patients can find the right support quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Session Modalities <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SESSION_MODALITY_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleModalityToggle(value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.sessionModalities.includes(value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Typical Session Durations <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {SESSION_DURATION_OPTIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => handleDurationToggle(duration)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  formData.sessionDurations.includes(duration)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Accepting New Patients</p>
              <p className="text-xs text-muted-foreground">Toggle off if you are currently full.</p>
            </div>
            <Switch
              checked={formData.acceptingNewPatients}
              onCheckedChange={(value) => setFormData((prev) => ({ ...prev, acceptingNewPatients: value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Waitlist</p>
              <p className="text-xs text-muted-foreground">Let patients request a spot when you are full.</p>
            </div>
            <Switch
              checked={formData.waitlistEnabled}
              onCheckedChange={(value) => setFormData((prev) => ({ ...prev, waitlistEnabled: value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Offer Telehealth</p>
              <p className="text-xs text-muted-foreground">Provide video or phone sessions.</p>
            </div>
            <Switch
              checked={formData.telehealthOffered}
              onCheckedChange={(value) => setFormData((prev) => ({ ...prev, telehealthOffered: value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Offer In-person Sessions</p>
              <p className="text-xs text-muted-foreground">Let patients know if they can meet you on site.</p>
            </div>
            <Switch
              checked={formData.inPersonOffered}
              onCheckedChange={(value) => setFormData((prev) => ({ ...prev, inPersonOffered: value }))}
            />
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="font-medium text-foreground">Availability Status</p>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, availabilityStatus: value }))}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  formData.availabilityStatus === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Additional Timezones You Cover</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {TIMEZONE_OPTIONS.filter((tz) => tz !== 'Africa/Kigali').map((timezone) => (
            <Badge
              key={timezone}
              variant={formData.supportedTimezones.includes(timezone) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  supportedTimezones: toggleValue(prev.supportedTimezones, timezone),
                }))
              }
            >
              {timezone}
            </Badge>
          ))}
        </div>
        <Textarea
          placeholder="Add any other timezones (one per line)"
          value={formData.supportedTimezonesNote}
          onChange={(event) => {
            const note = event.target.value;
            const additionalZones = parseMultilineList(note);
            setFormData((prev) => ({
              ...prev,
              supportedTimezonesNote: note,
              supportedTimezones: Array.from(new Set([...prev.supportedTimezones.filter((tz) => TIMEZONE_OPTIONS.includes(tz)), ...additionalZones])),
            }));
          }}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Compliance & Visibility</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Confirm your compliance status and decide where your profile should be visible.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Continuing Professional Development Status <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., Current, Renewal in progress"
            value={formData.cpdStatus}
            onChange={(event) => setFormData((prev) => ({ ...prev, cpdStatus: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Let us know if you are up to date or still working toward renewal.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Next Renewal Date <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="date"
            value={formData.cpdRenewalDueAt}
            onChange={(event) => setFormData((prev) => ({ ...prev, cpdRenewalDueAt: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank if you do not have a scheduled CPD renewal date yet.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="font-medium text-foreground">Profile Visibility</p>
        <div className="grid grid-cols-1 gap-3">
          {VISIBILITY_SURFACES.map(({ key, title, description }) => (
            <div key={key} className="flex items-start justify-between rounded-lg border border-border p-4">
              <div className="pr-4">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={formData.visibility[key]}
                onCheckedChange={(value) => handleVisibilityToggle(key, value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Emergency Contact Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Name of emergency contact"
            value={formData.emergencyContactName}
            onChange={(event) => setFormData((prev) => ({ ...prev, emergencyContactName: event.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Emergency Contact Phone <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            placeholder="e.g., +250 700 000 000"
            value={formData.emergencyContactPhone}
            onChange={(event) => setFormData((prev) => ({ ...prev, emergencyContactPhone: event.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              By toggling this control, you confirm that all information provided is accurate and that you understand your profile must be approved before accessing the counselor dashboard.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Switch
                checked={formData.consentAcknowledged}
                onCheckedChange={(value) => setFormData((prev) => ({ ...prev, consentAcknowledged: value }))}
              />
              <span className="text-sm text-foreground">I confirm the information above is accurate.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <Card className="w-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
          <CardHeader className="text-center relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0" />
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground relative z-10">
              Counselor Application
            </CardTitle>
            <CardDescription className="text-base sm:text-lg relative z-10">
              Complete your professional profile to join our counselor network
            </CardDescription>
            <div className="mt-6 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
                <span className="text-sm text-muted-foreground">{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {renderCurrentStep()}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || (currentStep === TOTAL_STEPS && !formData.consentAcknowledged)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : currentStep === TOTAL_STEPS
                        ? 'Submit for Review'
                        : 'Next'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
