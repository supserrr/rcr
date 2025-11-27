'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  User, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  Bell, 
  Shield, 
  LogOut,
  Camera,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Settings2,
  UserCheck,
  Clock,
  MapPin,
  Award,
  Languages,
  Trash2,
  X,
  Plus,
  MessageCircle,
  Video,
  ClipboardList,
  GraduationCap,
  Send,
  HelpCircle,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { AuthApi } from '../../../../lib/api/auth';
import { toast } from 'sonner';
import { Textarea } from '@workspace/ui/components/textarea';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';
import type { VisibilitySettings, VisibilitySurface, CounselorApprovalStatus, CounselorAvailabilityStatus, CounselorDocument } from '../../../../lib/types';

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

const SESSION_MODALITY_OPTIONS = [
  { value: 'chat', label: 'Text Chat', icon: MessageCircle },
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In-person', icon: Users },
];

const SESSION_DURATION_OPTIONS = [30, 45, 60, 90];

const VISIBILITY_SURFACES: Array<{ key: VisibilitySurface; title: string; description: string }> = [
  {
    key: 'publicLanding',
    title: 'Public Landing Page',
    description: 'Allow prospective patients to discover you on the public counselors page.',
  },
  {
    key: 'patientDirectory',
    title: 'Patient Directory',
    description: 'Let registered patients find and book you inside the application.',
  },
  {
    key: 'internal',
    title: 'Internal Team Directory',
    description: 'Enable other counselors and admins to reference your profile for coordination.',
  },
];

const AVAILABILITY_OPTIONS: Array<{ value: CounselorAvailabilityStatus; label: string; description: string }> = [
  {
    value: 'available',
    label: 'Available',
    description: 'Open to accepting new patients immediately.',
  },
  {
    value: 'limited',
    label: 'Limited Availability',
    description: 'Limited weekly capacity remains.',
  },
  {
    value: 'waitlist',
    label: 'Waitlist Only',
    description: 'Invite patients to join a waitlist for future openings.',
  },
  {
    value: 'unavailable',
    label: 'Temporarily Unavailable',
    description: 'Currently not accepting new patients.',
  },
];

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

const getApprovalBadgeStyles = (status: CounselorApprovalStatus) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' };
    case 'pending':
      return { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' };
    case 'needs_more_info':
      return { label: 'More Info Needed', className: 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300' };
    case 'suspended':
      return { label: 'Suspended', className: 'bg-slate-200 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300' };
    default:
      return { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' };
  }
};

export default function CounselorSettingsPage() {
  const { user, isLoading: authLoading, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  // Support tickets - placeholder for now (no API endpoint yet)
  const myTickets: any[] = [];
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sessionReminders: true,
    patientMessages: true,
    resourceUpdates: true,
    systemAlerts: true
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    professionalTitle: '',
    email: user?.email || '',
    phoneNumber: '',
    contactPhone: '',
    practiceName: '',
    practiceLocation: '',
    serviceRegions: [] as string[],
    serviceRegionsNote: '',
    primaryTimezone: 'Africa/Kigali',
    supportedTimezones: ['Africa/Kigali'] as string[],
    supportedTimezonesNote: '',
    languages: [] as string[],
    bio: '',
    approachSummary: '',
    professionalHighlights: [] as string[],
    yearsExperience: '',
    specialty: '',
    credentials: '',
    experience: 0,
    location: '',
    language: 'en',
    timezone: 'Africa/Kigali',
    licenseNumber: '',
    licenseJurisdiction: '',
    licenseExpiry: '',
    issuingAuthority: '',
    highestDegree: '',
    university: '',
    graduationYear: '',
    resumeFileName: '',
    licenseFileName: '',
    certificationFileNames: [] as string[],
    specializations: [] as string[],
    demographicsServed: [] as string[],
    sessionModalities: ['chat', 'video', 'phone'],
    sessionDurations: [60] as number[],
    availabilityStatus: 'available' as CounselorAvailabilityStatus,
    acceptingNewPatients: true,
    waitlistEnabled: false,
    telehealthOffered: true,
    inPersonOffered: false,
    cpdStatus: '',
    cpdRenewalDueAt: '',
    motivationStatement: '',
    professionalReferencesNote: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    visibilitySettings: {
      publicLanding: true,
      patientDirectory: true,
      internal: true,
    } as VisibilitySettings,
    approvalStatus: (user?.approvalStatus as CounselorApprovalStatus) || 'pending' as CounselorApprovalStatus,
    approvalSubmittedAt: user?.approvalSubmittedAt || '',
    approvalReviewedAt: user?.approvalReviewedAt || '',
    avatar_url: user?.avatar || '',
  });
  const [documents, setDocuments] = useState<CounselorDocument[]>([]);

  const supabaseUrl = useMemo(() => {
    const fromEnv =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);
    return fromEnv ? fromEnv.replace(/\/+$/, '') : undefined;
  }, []);

  const toPublicUrl = useCallback(
    (value: string | undefined | null) => {
      if (!value) {
        return undefined;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }
      if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
      }
      if (!supabaseUrl) {
        return trimmed;
      }
      const normalizedPath = trimmed.replace(/^\/+/, '');
      if (normalizedPath.startsWith('storage/v1/object/public/')) {
        return `${supabaseUrl}/${normalizedPath}`;
      }
      return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
    },
    [supabaseUrl],
  );

  const formatDocumentType = useCallback((type: CounselorDocument['documentType']) => {
    switch (type) {
      case 'resume':
        return 'Resume / CV';
      case 'license':
        return 'Professional License';
      case 'certification':
        return 'Certification';
      case 'background_check':
        return 'Background Check';
      case 'insurance':
        return 'Insurance';
      default:
        return type.replace(/_/g, ' ');
    }
  }, []);

  const profileAvatarUrl = useMemo(
    () => normalizeAvatarUrl(profile.avatar_url || user?.avatar),
    [profile.avatar_url, user?.avatar],
  );

  const approvalBadge = useMemo(() => getApprovalBadgeStyles(profile.approvalStatus), [profile.approvalStatus]);

  const displayFullName = useMemo(() => {
    if (!profile.name && !profile.professionalTitle) {
      return 'Counselor';
    }
    if (profile.professionalTitle && profile.name) {
      return `${profile.professionalTitle} ${profile.name}`.trim();
    }
    return profile.professionalTitle || profile.name;
  }, [profile.name, profile.professionalTitle]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        return;
      }

      // Load profile in background without blocking UI
      try {
        const currentUser = await AuthApi.getCurrentUser();
        if (!currentUser) {
          // Session expired; rely on existing context data
          return;
        }
        const metadata = currentUser.metadata || {};
        const counselorProfile = currentUser.counselorProfile;
        const counselorMetadata = (counselorProfile?.metadata ?? {}) as Record<string, unknown>;
        const professionalTitle =
          (typeof counselorMetadata.professionalTitle === 'string' && counselorMetadata.professionalTitle.length > 0
            ? counselorMetadata.professionalTitle
            : typeof metadata.professionalTitle === 'string' && metadata.professionalTitle.length > 0
              ? metadata.professionalTitle
              : typeof metadata.title === 'string' && metadata.title.length > 0
                ? metadata.title
                : '');

        const metadataFullName =
          (typeof metadata.full_name === 'string' && metadata.full_name.length > 0
            ? metadata.full_name
            : typeof metadata.fullName === 'string' && metadata.fullName.length > 0
              ? metadata.fullName
              : typeof metadata.name === 'string' && metadata.name.length > 0
                ? metadata.name
                : undefined);

        const resolvedName =
          metadataFullName ??
          (professionalTitle &&
          typeof currentUser.name === 'string' &&
          currentUser.name.toLowerCase().startsWith(`${professionalTitle.toLowerCase()} `)
            ? currentUser.name.slice(professionalTitle.length).trim()
            : currentUser.name);

        const serviceRegions = Array.isArray(counselorProfile?.serviceRegions)
          ? counselorProfile?.serviceRegions
          : Array.isArray(metadata.serviceRegions)
            ? metadata.serviceRegions
            : [];

        const supportedTimezones = Array.isArray(counselorProfile?.supportedTimezones)
          ? counselorProfile.supportedTimezones
          : Array.isArray(metadata.supportedTimezones)
            ? metadata.supportedTimezones
            : ['Africa/Kigali'];

        const manualSupportedTimezones = supportedTimezones.filter((timezone) => !TIMEZONE_OPTIONS.includes(timezone));

        const languages = Array.isArray(counselorProfile?.languages)
          ? counselorProfile.languages
          : Array.isArray(metadata.languages)
            ? metadata.languages
            : [];

        const sessionModalities = Array.isArray(counselorProfile?.sessionModalities)
          ? counselorProfile.sessionModalities
          : Array.isArray(metadata.sessionModalities)
            ? metadata.sessionModalities
            : ['chat', 'video', 'phone'];

        const sessionDurations = Array.isArray(counselorProfile?.sessionDurations)
          ? counselorProfile.sessionDurations
          : Array.isArray(metadata.sessionDurations)
            ? metadata.sessionDurations.map((value: unknown) => Number.parseInt(String(value), 10)).filter((value) => Number.isFinite(value))
            : [60];

        const professionalHighlights = Array.isArray(counselorProfile?.professionalHighlights)
          ? counselorProfile.professionalHighlights
          : Array.isArray(metadata.professionalHighlights)
            ? metadata.professionalHighlights
            : [];

        const professionalReferences = Array.isArray(counselorProfile?.professionalReferences)
          ? counselorProfile.professionalReferences
          : [];

        const professionalReferencesNote = professionalReferences
          .map((reference) => {
            const name = typeof reference?.name === 'string' ? reference.name : '';
            const organization = typeof reference?.organization === 'string' ? reference.organization : '';
            const email = typeof reference?.email === 'string' ? reference.email : '';
            const phone = typeof reference?.phone === 'string' ? reference.phone : '';
            return [name, organization, email, phone].filter(Boolean).join(' | ');
          })
          .filter((line) => line.length > 0)
          .join('\n');

        const documentsFromUser = Array.isArray(currentUser.documents) ? currentUser.documents : [];
        const resumeDocumentRecord = documentsFromUser.find((document) => document.documentType === 'resume');
        const licenseDocumentRecord = documentsFromUser.find((document) => document.documentType === 'license');
        const certificationDocumentNames = documentsFromUser
          .filter((document) => document.documentType === 'certification')
          .map((document) => document.displayName ?? document.storagePath.split('/').pop() ?? 'Certification');

        setDocuments(documentsFromUser);

        setProfile((prev) => ({
          ...prev,
          name: resolvedName ?? '',
          professionalTitle,
          email: currentUser.email,
          phoneNumber:
            (typeof metadata.phoneNumber === 'string' && metadata.phoneNumber.length > 0
              ? metadata.phoneNumber
              : undefined) ??
            (typeof metadata.contactPhone === 'string' ? metadata.contactPhone : undefined) ??
            (typeof (currentUser as any).phoneNumber === 'string' ? (currentUser as any).phoneNumber : '') ??
            '',
          contactPhone:
            (typeof metadata.contactPhone === 'string' ? metadata.contactPhone : undefined) ??
            (typeof metadata.phoneNumber === 'string' ? metadata.phoneNumber : undefined) ??
            '',
          practiceName:
            (typeof counselorProfile?.practiceName === 'string' && counselorProfile.practiceName.length > 0
              ? counselorProfile.practiceName
              : typeof metadata.practiceName === 'string'
                ? metadata.practiceName
                : ''),
          practiceLocation:
            (typeof counselorProfile?.practiceLocation === 'string' && counselorProfile.practiceLocation.length > 0
              ? counselorProfile.practiceLocation
              : typeof metadata.practiceLocation === 'string'
                ? metadata.practiceLocation
                : ''),
          serviceRegions,
          serviceRegionsNote: serviceRegions.join('\n'),
          primaryTimezone:
            counselorProfile?.primaryTimezone ??
            (typeof metadata.primaryTimezone === 'string' ? metadata.primaryTimezone : 'Africa/Kigali'),
          supportedTimezones,
          supportedTimezonesNote: manualSupportedTimezones.join('\n'),
          languages,
          specialty:
            (typeof metadata.specialty === 'string' && metadata.specialty.length > 0
              ? metadata.specialty
              : counselorProfile?.specializations?.[0] ?? ''),
          bio:
            (typeof counselorProfile?.bio === 'string' && counselorProfile.bio.length > 0 ? counselorProfile.bio : undefined) ??
            (typeof metadata.bio === 'string' ? metadata.bio : ''),
          approachSummary:
            (typeof counselorProfile?.approachSummary === 'string' ? counselorProfile.approachSummary : undefined) ??
            (typeof metadata.approachSummary === 'string' ? metadata.approachSummary : ''),
          professionalHighlights,
          yearsExperience:
            counselorProfile?.yearsExperience !== undefined && counselorProfile.yearsExperience !== null
              ? String(counselorProfile.yearsExperience)
              : typeof metadata.yearsOfExperience === 'string'
                ? metadata.yearsOfExperience
                : typeof metadata.yearsOfExperience === 'number'
                  ? String(metadata.yearsOfExperience)
                  : '',
          credentials: typeof metadata.credentials === 'string' ? metadata.credentials : '',
          experience:
            counselorProfile?.yearsExperience ??
            (typeof metadata.experience === 'number'
              ? metadata.experience
              : typeof metadata.yearsOfExperience === 'string'
                ? Number.parseInt(metadata.yearsOfExperience, 10) || 0
                : 0),
          location: typeof metadata.location === 'string' ? metadata.location : '',
          language: typeof metadata.language === 'string' ? metadata.language : 'en',
          timezone: typeof metadata.timezone === 'string' ? metadata.timezone : 'Africa/Kigali',
          licenseNumber: counselorProfile?.licenseNumber ?? (metadata.licenseNumber as string) ?? '',
          licenseJurisdiction:
            counselorProfile?.licenseJurisdiction ?? (metadata.licenseJurisdiction as string) ?? '',
          licenseExpiry: counselorProfile?.licenseExpiry ?? (metadata.licenseExpiry as string) ?? '',
          issuingAuthority: (metadata.issuingAuthority as string) ?? '',
          highestDegree: (metadata.highestDegree as string) ?? '',
          university: (metadata.university as string) ?? '',
          graduationYear:
            metadata.graduationYear !== undefined
              ? String(metadata.graduationYear)
              : '',
          resumeFileName:
            resumeDocumentRecord?.displayName ??
            (metadata.resumeFileName as string) ??
            '',
          licenseFileName:
            licenseDocumentRecord?.displayName ??
            (metadata.licenseFileName as string) ??
            '',
          certificationFileNames:
            certificationDocumentNames.length > 0
              ? certificationDocumentNames
              : Array.isArray(metadata.certificationFileNames)
            ? metadata.certificationFileNames.map((value) => String(value))
            : Array.isArray(counselorProfile?.metadata?.certificationFileNames)
              ? (counselorProfile?.metadata?.certificationFileNames as unknown[]).map((value) => String(value))
              : [],
          specializations:
            counselorProfile?.specializations ?? (Array.isArray(metadata.specializations) ? metadata.specializations : []),
          demographicsServed:
            counselorProfile?.demographicsServed ??
            (Array.isArray(metadata.demographicsServed) ? metadata.demographicsServed : []),
          sessionModalities,
          sessionDurations,
          availabilityStatus:
            counselorProfile?.availabilityStatus ??
            ((metadata.availabilityStatus as CounselorAvailabilityStatus) || 'available'),
          acceptingNewPatients:
            counselorProfile?.acceptingNewPatients ??
            (typeof metadata.acceptingNewPatients === 'boolean' ? metadata.acceptingNewPatients : true),
          waitlistEnabled:
            counselorProfile?.waitlistEnabled ??
            (typeof metadata.waitlistEnabled === 'boolean' ? metadata.waitlistEnabled : false),
          telehealthOffered:
            counselorProfile?.telehealthOffered ??
            (typeof metadata.telehealthOffered === 'boolean' ? metadata.telehealthOffered : true),
          inPersonOffered:
            counselorProfile?.inPersonOffered ??
            (typeof metadata.inPersonOffered === 'boolean' ? metadata.inPersonOffered : false),
          cpdStatus:
            counselorProfile?.cpdStatus ?? (typeof metadata.cpdStatus === 'string' ? metadata.cpdStatus : ''),
          cpdRenewalDueAt:
            counselorProfile?.cpdRenewalDueAt ??
            (typeof metadata.cpdRenewalDueAt === 'string' ? metadata.cpdRenewalDueAt : ''),
          motivationStatement:
            counselorProfile?.motivationStatement ?? (typeof metadata.motivation === 'string' ? metadata.motivation : ''),
          professionalReferencesNote:
            professionalReferencesNote.length > 0
              ? professionalReferencesNote
              : typeof metadata.professionalReferencesRaw === 'string'
                ? metadata.professionalReferencesRaw
                : '',
          emergencyContactName:
            counselorProfile?.emergencyContactName ??
            (typeof metadata.emergencyContactName === 'string' ? metadata.emergencyContactName : ''),
          emergencyContactPhone:
            counselorProfile?.emergencyContactPhone ??
            (typeof metadata.emergencyContactPhone === 'string' ? metadata.emergencyContactPhone : ''),
          visibilitySettings:
            currentUser.visibilitySettings ??
            ((metadata.visibilitySettings as VisibilitySettings) ?? {
              publicLanding: true,
              patientDirectory: true,
              internal: true,
            }),
          approvalStatus: currentUser.approvalStatus ?? 'pending',
          approvalSubmittedAt: currentUser.approvalSubmittedAt ?? '',
          approvalReviewedAt: currentUser.approvalReviewedAt ?? '',
          avatar_url:
            (typeof currentUser.avatar === 'string'
              ? currentUser.avatar
              : typeof metadata.avatar_url === 'string'
                ? metadata.avatar_url
                : '') || '',
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
        // Use auth user data as fallback
        setProfile(prev => ({
          ...prev,
          name: user.name || '',
          professionalTitle: prev.professionalTitle || '',
          email: user.email || '',
          avatar_url: user.avatar || ''
        }));
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarButtonClick = () => {
    if (isUploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = /image\/(png|jpeg|jpg)/i.test(file.type);
    const isSmallEnough = file.size <= 2 * 1024 * 1024;

    if (!isImage || !isSmallEnough) {
      toast.error('Please upload a JPG or PNG image under 2MB.');
      event.target.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { url, user: updatedUser } = await AuthApi.uploadProfileImage(file);
      
      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        avatar_url: url,
      }));
      
      // Refresh user in auth context to update avatar across the app
      await checkAuth();
      
      toast.success('Profile image updated successfully.');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update profile image. Please try again.',
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const visibilitySettings: VisibilitySettings = {
        publicLanding: profile.visibilitySettings.publicLanding,
        patientDirectory: profile.visibilitySettings.patientDirectory,
        internal: profile.visibilitySettings.internal,
      };

      const counselorProfilePayload = {
        practiceName: profile.practiceName.trim() || undefined,
        practiceLocation: profile.practiceLocation.trim() || undefined,
        serviceRegions: profile.serviceRegions,
        primaryTimezone: profile.primaryTimezone,
        supportedTimezones: profile.supportedTimezones,
        acceptingNewPatients: profile.acceptingNewPatients,
        waitlistEnabled: profile.waitlistEnabled,
        availabilityStatus: profile.availabilityStatus,
        sessionModalities: profile.sessionModalities,
        sessionDurations: profile.sessionDurations,
        telehealthOffered: profile.telehealthOffered,
        inPersonOffered: profile.inPersonOffered,
        languages: profile.languages,
        specializations: profile.specializations,
        demographicsServed: profile.demographicsServed,
        approachSummary: profile.approachSummary.trim() || undefined,
        bio: profile.bio.trim() || undefined,
        yearsExperience: profile.yearsExperience ? Number.parseInt(profile.yearsExperience, 10) : profile.experience,
        professionalHighlights: profile.professionalHighlights,
        licenseNumber: profile.licenseNumber.trim() || undefined,
        licenseJurisdiction: profile.licenseJurisdiction.trim() || undefined,
        licenseExpiry: profile.licenseExpiry || undefined,
        certificationDocuments: profile.certificationFileNames.map((name) => ({ name })),
        cpdStatus: profile.cpdStatus.trim() || undefined,
        cpdRenewalDueAt: profile.cpdRenewalDueAt || undefined,
        professionalReferences: parseProfessionalReferences(profile.professionalReferencesNote),
        motivationStatement: profile.motivationStatement.trim() || undefined,
        emergencyContactName: profile.emergencyContactName.trim() || undefined,
        emergencyContactPhone: profile.emergencyContactPhone.trim() || undefined,
        metadata: {
          resumeFileName: profile.resumeFileName,
          licenseFileName: profile.licenseFileName,
          professionalTitle: profile.professionalTitle.trim() || undefined,
          title: profile.professionalTitle.trim() || undefined,
        },
      };

      const metadata: Record<string, unknown> = {
        professionalTitle: profile.professionalTitle.trim() || undefined,
        title: profile.professionalTitle.trim() || undefined,
        practiceName: profile.practiceName,
        practiceLocation: profile.practiceLocation,
        serviceRegions: profile.serviceRegions,
        primaryTimezone: profile.primaryTimezone,
        supportedTimezones: profile.supportedTimezones,
        contactPhone: profile.contactPhone,
        languages: profile.languages,
        bio: profile.bio,
        approachSummary: profile.approachSummary,
        professionalHighlights: profile.professionalHighlights,
        licenseNumber: profile.licenseNumber,
        licenseJurisdiction: profile.licenseJurisdiction,
        licenseExpiry: profile.licenseExpiry,
        issuingAuthority: profile.issuingAuthority,
        highestDegree: profile.highestDegree,
        university: profile.university,
        graduationYear: profile.graduationYear,
        specializations: profile.specializations,
        demographicsServed: profile.demographicsServed,
        sessionModalities: profile.sessionModalities,
        sessionDurations: profile.sessionDurations,
        availabilityStatus: profile.availabilityStatus,
        acceptingNewPatients: profile.acceptingNewPatients,
        waitlistEnabled: profile.waitlistEnabled,
        telehealthOffered: profile.telehealthOffered,
        inPersonOffered: profile.inPersonOffered,
        cpdStatus: profile.cpdStatus,
        cpdRenewalDueAt: profile.cpdRenewalDueAt,
        professionalReferencesRaw: profile.professionalReferencesNote,
        motivation: profile.motivationStatement,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        visibilitySettings,
        resumeFileName: profile.resumeFileName,
        licenseFileName: profile.licenseFileName,
        certificationFileNames: profile.certificationFileNames,
      };

      const updatedUser = await AuthApi.updateProfile({
        fullName: profile.name,
        professionalTitle: profile.professionalTitle.trim() || undefined,
        phoneNumber: profile.phoneNumber,
        contactPhone: profile.contactPhone,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        metadata,
        visibilitySettings,
        counselorProfile: counselorProfilePayload,
      });

      const updatedDocuments = Array.isArray(updatedUser.documents) ? updatedUser.documents : [];
      setDocuments(updatedDocuments);

      if (updatedDocuments.length > 0) {
        const updatedResumeDocument = updatedDocuments.find((document) => document.documentType === 'resume');
        const updatedLicenseDocument = updatedDocuments.find((document) => document.documentType === 'license');
        const updatedCertificationNames = updatedDocuments
          .filter((document) => document.documentType === 'certification')
          .map((document) => document.displayName ?? document.storagePath.split('/').pop() ?? 'Certification');

        setProfile((prev) => ({
          ...prev,
          resumeFileName:
            updatedResumeDocument?.displayName ?? prev.resumeFileName ?? '',
          licenseFileName:
            updatedLicenseDocument?.displayName ?? prev.licenseFileName ?? '',
          certificationFileNames:
            updatedCertificationNames.length > 0 ? updatedCertificationNames : prev.certificationFileNames,
        }));
      }
       
      setHasUnsavedChanges(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordChangeData.currentPassword || !passwordChangeData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordChangeData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await AuthApi.changePassword({
        currentPassword: passwordChangeData.currentPassword,
        newPassword: passwordChangeData.newPassword,
      });
      
      toast.success('Password changed successfully');
      setShowPasswordChangeModal(false);
      setPasswordChangeData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthApi.signOut();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleBooleanChange = (field: keyof typeof profile, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleArrayToggle = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => {
      const current = Array.isArray(prev[field]) ? (prev[field] as string[]) : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [field]: next,
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleServiceRegionToggle = (region: string) => {
    setProfile((prev) => {
      const manualRegions = parseMultilineList(prev.serviceRegionsNote);
      const currentSuggestions = prev.serviceRegions.filter((entry) => SERVICE_REGION_SUGGESTIONS.includes(entry));
      const nextSuggestions = currentSuggestions.includes(region)
        ? currentSuggestions.filter((entry) => entry !== region)
        : [...currentSuggestions, region];
      const combined = Array.from(new Set([...nextSuggestions, ...manualRegions]));
      return {
        ...prev,
        serviceRegions: combined,
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSupportedTimezoneToggle = (timezone: string) => {
    setProfile((prev) => {
      const manualZones = parseMultilineList(prev.supportedTimezonesNote);
      const currentSuggestions = prev.supportedTimezones.filter((entry) => TIMEZONE_OPTIONS.includes(entry));
      const nextSuggestions = currentSuggestions.includes(timezone)
        ? currentSuggestions.filter((entry) => entry !== timezone)
        : [...currentSuggestions, timezone];
      const combined = Array.from(new Set([...nextSuggestions, ...manualZones]));
      return {
        ...prev,
        supportedTimezones: combined,
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleLanguageToggle = (language: string) => handleArrayToggle('languages', language);
  const handleSpecializationToggle = (specialization: string) => {
    setProfile((prev) => {
      const exists = prev.specializations.includes(specialization);
      const nextSpecializations = exists
        ? prev.specializations.filter((item) => item !== specialization)
        : [...prev.specializations, specialization];
      return {
        ...prev,
        specializations: nextSpecializations,
        specialty: nextSpecializations[0] ?? '',
      };
    });
    setHasUnsavedChanges(true);
  };
  const handleDemographicToggle = (demographic: string) => handleArrayToggle('demographicsServed', demographic);
  const handleModalityToggle = (modality: string) => handleArrayToggle('sessionModalities', modality);
  const handleSessionDurationToggle = (duration: number) => {
    setProfile((prev) => {
      const durations = prev.sessionDurations.includes(duration)
        ? prev.sessionDurations.filter((value) => value !== duration)
        : [...prev.sessionDurations, duration].sort((a, b) => a - b);
      return {
        ...prev,
        sessionDurations: durations,
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleVisibilityToggle = (surface: VisibilitySurface, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      visibilitySettings: {
        ...prev.visibilitySettings,
        [surface]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddLanguage = (language: string) => {
    if (language && !profile.languages.includes(language)) {
      setProfile(prev => ({ 
        ...prev, 
        languages: [...prev.languages, language] 
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setProfile(prev => ({ 
      ...prev, 
      languages: prev.languages.filter(lang => lang !== languageToRemove) 
    }));
    setHasUnsavedChanges(true);
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Account deleted successfully');
      // Redirect to login or home page
      // window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingTicket(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating ticket:', ticketForm);
      
      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: ''
      });
      
      alert('Support ticket created successfully! Ticket ID: #' + Date.now().toString().slice(-6));
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'support', label: 'Support', icon: MessageCircle }
  ];

  // Loading state - only show spinner for auth loading, not profile loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Not authenticated</h3>
        <p className="text-muted-foreground">Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Settings"
        description="Manage your account and preferences"
      >
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Unsaved changes</span>
          </div>
        )}
      </AnimatedPageHeader>
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <AnimatedCard delay={0.1} className="sticky top-8">
              <div className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-xl ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:shadow-md'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </AnimatedCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <AnimatedCard delay={0.2}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg">
                          <AvatarImage src={profileAvatarUrl} alt={user?.name || 'Counselor'} />
                          <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg border-primary/20 hover:bg-primary/10"
                          onClick={handleAvatarButtonClick}
                          disabled={isUploadingAvatar}
                          title="Upload profile picture"
                        >
                          {isUploadingAvatar ? (
                            <Spinner variant="bars" size={16} className="text-primary" />
                          ) : (
                            <Camera className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={handleAvatarFileChange}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{displayFullName}</h2>
                        <p className="text-primary font-medium">
                          {profile.practiceName || profile.specialty || 'Counselor'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          {profile.contactPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {profile.contactPhone}
                            </span>
                          )}
                          {profile.practiceLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {profile.practiceLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {profile.primaryTimezone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <Badge className={`px-3 py-1 font-medium capitalize ${approvalBadge.className}`}>
                        {approvalBadge.label}
                      </Badge>
                      {profile.approvalSubmittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(profile.approvalSubmittedAt).toLocaleDateString()}
                        </p>
                      )}
                      {profile.approvalReviewedAt && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed {new Date(profile.approvalReviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Practice Overview</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full Name</Label>
                        <Input
                          id="profile-name"
                          value={profile.name}
                          onChange={(event) => handleProfileChange('name', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="professional-title">Professional Title</Label>
                        <Input
                          id="professional-title"
                          value={profile.professionalTitle}
                          onChange={(event) => handleProfileChange('professionalTitle', event.target.value)}
                          placeholder="e.g., Dr., Counselor, Pastor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Email Address</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profile.email}
                          onChange={(event) => handleProfileChange('email', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="practice-name">Practice or Organization</Label>
                        <Input
                          id="practice-name"
                          value={profile.practiceName}
                          onChange={(event) => handleProfileChange('practiceName', event.target.value)}
                          placeholder="Rwanda Cancer Relief Counseling Center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Primary Contact Phone</Label>
                        <Input
                          id="contact-phone"
                          value={profile.contactPhone}
                          onChange={(event) => handleProfileChange('contactPhone', event.target.value)}
                          placeholder="e.g., +250 700 000 000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="practice-location">Primary Practice Location</Label>
                        <Input
                          id="practice-location"
                          value={profile.practiceLocation}
                          onChange={(event) => handleProfileChange('practiceLocation', event.target.value)}
                          placeholder="City, facility, or telehealth"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary-timezone">Primary Timezone</Label>
                        <select
                          id="primary-timezone"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                          value={profile.primaryTimezone}
                          onChange={(event) => handleProfileChange('primaryTimezone', event.target.value)}
                        >
                          {TIMEZONE_OPTIONS.map((timezone) => (
                            <option key={timezone} value={timezone}>
                              {timezone}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">Languages</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {LANGUAGE_OPTIONS.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => handleLanguageToggle(language)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              profile.languages.includes(language)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Regions You Serve</Label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_REGION_SUGGESTIONS.map((region) => (
                          <Badge
                            key={region}
                            variant={profile.serviceRegions.includes(region) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleServiceRegionToggle(region)}
                          >
                            {region}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        value={profile.serviceRegionsNote}
                        onChange={(event) => {
                          const note = event.target.value;
                          const manualRegions = parseMultilineList(note);
                          setProfile((prev) => {
                            const selectedSuggestions = prev.serviceRegions.filter((region) => SERVICE_REGION_SUGGESTIONS.includes(region));
                            return {
                              ...prev,
                              serviceRegionsNote: note,
                              serviceRegions: Array.from(new Set([...selectedSuggestions, ...manualRegions])),
                            };
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Add any additional regions (one per line)"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Timezones</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {TIMEZONE_OPTIONS.filter((timezone) => timezone !== profile.primaryTimezone).map((timezone) => (
                          <Badge
                            key={timezone}
                            variant={profile.supportedTimezones.includes(timezone) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleSupportedTimezoneToggle(timezone)}
                          >
                            {timezone}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        value={profile.supportedTimezonesNote}
                        onChange={(event) => {
                          const note = event.target.value;
                          const manualZones = parseMultilineList(note);
                          setProfile((prev) => {
                            const selectedSuggestions = prev.supportedTimezones.filter((timezone) => TIMEZONE_OPTIONS.includes(timezone));
                            return {
                              ...prev,
                              supportedTimezonesNote: note,
                              supportedTimezones: Array.from(new Set([...selectedSuggestions, ...manualZones])),
                            };
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Add additional timezones (one per line)"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.35}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Professional Background</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-bio">Professional Bio</Label>
                      <Textarea
                        id="profile-bio"
                        value={profile.bio}
                        onChange={(event) => handleProfileChange('bio', event.target.value)}
                        placeholder="Share your background, approach, and areas of focus."
                        className="min-h-[140px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approach-summary">Therapeutic Approach</Label>
                      <Textarea
                        id="approach-summary"
                        value={profile.approachSummary}
                        onChange={(event) => handleProfileChange('approachSummary', event.target.value)}
                        placeholder="Describe how you support patients during sessions."
                        className="min-h-[140px]"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="years-experience">Years of Experience</Label>
                        <Input
                          id="years-experience"
                          type="number"
                          value={profile.yearsExperience}
                          onChange={(event) => handleProfileChange('yearsExperience', event.target.value)}
                          placeholder="e.g., 5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credentials">Credentials</Label>
                        <Input
                          id="credentials"
                          value={profile.credentials}
                          onChange={(event) => handleProfileChange('credentials', event.target.value)}
                          placeholder="e.g., Licensed Clinical Psychologist"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="highlights">Professional Highlights</Label>
                      <Textarea
                        id="highlights"
                        value={profile.professionalHighlights.join('\n')}
                        onChange={(event) => {
                          handleProfileChange('professionalHighlights', parseMultilineList(event.target.value));
                        }}
                        placeholder="Add awards or recognitions (one per line)"
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.4}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Credentials & Education</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="license-number">License Number</Label>
                        <Input
                          id="license-number"
                          value={profile.licenseNumber}
                          onChange={(event) => handleProfileChange('licenseNumber', event.target.value)}
                          placeholder="e.g., RCR-2025-1234"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-jurisdiction">License Jurisdiction</Label>
                        <Input
                          id="license-jurisdiction"
                          value={profile.licenseJurisdiction}
                          onChange={(event) => handleProfileChange('licenseJurisdiction', event.target.value)}
                          placeholder="Province, country, or board"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-expiry">License Expiry</Label>
                        <Input
                          id="license-expiry"
                          type="date"
                          value={profile.licenseExpiry}
                          onChange={(event) => handleProfileChange('licenseExpiry', event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="highest-degree">Highest Degree</Label>
                        <Input
                          id="highest-degree"
                          value={profile.highestDegree}
                          onChange={(event) => handleProfileChange('highestDegree', event.target.value)}
                          placeholder="e.g., Master of Counseling"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="university">Institution</Label>
                        <Input
                          id="university"
                          value={profile.university}
                          onChange={(event) => handleProfileChange('university', event.target.value)}
                          placeholder="University or training center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduation-year">Graduation Year</Label>
                        <Input
                          id="graduation-year"
                          type="number"
                          value={profile.graduationYear}
                          onChange={(event) => handleProfileChange('graduationYear', event.target.value)}
                          placeholder="e.g., 2018"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="resume-file">Resume (stored)</Label>
                        <Input
                          id="resume-file"
                          value={profile.resumeFileName}
                          onChange={(event) => handleProfileChange('resumeFileName', event.target.value)}
                          placeholder="resume.pdf"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-file">License Document</Label>
                        <Input
                          id="license-file"
                          value={profile.licenseFileName}
                          onChange={(event) => handleProfileChange('licenseFileName', event.target.value)}
                          placeholder="license.pdf"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certifications-file">Certification Files</Label>
                        <Textarea
                          id="certifications-file"
                          value={profile.certificationFileNames.join('\n')}
                          onChange={(event) => handleProfileChange('certificationFileNames', parseMultilineList(event.target.value))}
                          placeholder="List stored certification filenames (one per line)"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.45}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Practice Details & Delivery</h3>
                    </div>

                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SPECIALIZATION_OPTIONS.map((specialization) => (
                          <button
                            key={specialization}
                            type="button"
                            onClick={() => handleSpecializationToggle(specialization)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              profile.specializations.includes(specialization)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            {specialization}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Populations Served</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DEMOGRAPHIC_OPTIONS.map((demographic) => (
                          <button
                            key={demographic}
                            type="button"
                            onClick={() => handleDemographicToggle(demographic)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              profile.demographicsServed.includes(demographic)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            {demographic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Session Modalities</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SESSION_MODALITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleModalityToggle(value)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                profile.sessionModalities.includes(value)
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Typical Session Durations</Label>
                        <div className="flex flex-wrap gap-3">
                          {SESSION_DURATION_OPTIONS.map((duration) => (
                            <button
                              key={duration}
                              type="button"
                              onClick={() => handleSessionDurationToggle(duration)}
                              className={`px-4 py-2 rounded-full border transition-all ${
                                profile.sessionDurations.includes(duration)
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Accepting New Patients</p>
                            <p className="text-xs text-muted-foreground">Toggle off if you are currently full.</p>
                          </div>
                          <Switch
                            checked={profile.acceptingNewPatients}
                            onCheckedChange={(value) => handleBooleanChange('acceptingNewPatients', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Enable Waitlist</p>
                            <p className="text-xs text-muted-foreground">Capture interest when you are fully booked.</p>
                          </div>
                          <Switch
                            checked={profile.waitlistEnabled}
                            onCheckedChange={(value) => handleBooleanChange('waitlistEnabled', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Offer Telehealth</p>
                            <p className="text-xs text-muted-foreground">Allow video or phone sessions.</p>
                          </div>
                          <Switch
                            checked={profile.telehealthOffered}
                            onCheckedChange={(value) => handleBooleanChange('telehealthOffered', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Offer In-person Sessions</p>
                            <p className="text-xs text-muted-foreground">Meet patients on site.</p>
                          </div>
                          <Switch
                            checked={profile.inPersonOffered}
                            onCheckedChange={(value) => handleBooleanChange('inPersonOffered', value)}
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border border-border p-4 space-y-2">
                        <p className="font-medium text-foreground">Availability Status</p>
                        <div className="space-y-2">
                          {AVAILABILITY_OPTIONS.map(({ value, label, description }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleProfileChange('availabilityStatus', value)}
                              className={`w-full text-left rounded-lg border p-3 transition-all ${
                                profile.availabilityStatus === value
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
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.5}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Compliance & Visibility</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cpd-status">CPD Status</Label>
                        <Input
                          id="cpd-status"
                          value={profile.cpdStatus}
                          onChange={(event) => handleProfileChange('cpdStatus', event.target.value)}
                          placeholder="e.g., Current, Renewal in progress"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpd-renewal">Next Renewal Date</Label>
                        <Input
                          id="cpd-renewal"
                          type="date"
                          value={profile.cpdRenewalDueAt}
                          onChange={(event) => handleProfileChange('cpdRenewalDueAt', event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="references-note">Professional References</Label>
                      <Textarea
                        id="references-note"
                        value={profile.professionalReferencesNote}
                        onChange={(event) => handleProfileChange('professionalReferencesNote', event.target.value)}
                        placeholder="Format: Name | Organization | Email | Phone (one per line)"
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="emergency-name">Emergency Contact Name</Label>
                        <Input
                          id="emergency-name"
                          value={profile.emergencyContactName}
                          onChange={(event) => handleProfileChange('emergencyContactName', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                        <Input
                          id="emergency-phone"
                          value={profile.emergencyContactPhone}
                          onChange={(event) => handleProfileChange('emergencyContactPhone', event.target.value)}
                          placeholder="e.g., +250 700 000 000"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Profile Visibility</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {VISIBILITY_SURFACES.map(({ key, title, description }) => (
                          <div key={key} className="flex items-start justify-between rounded-lg border border-border p-4">
                            <div className="pr-4">
                              <p className="font-medium text-foreground">{title}</p>
                              <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                            <Switch
                              checked={profile.visibilitySettings[key]}
                              onCheckedChange={(value) => handleVisibilityToggle(key, value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-primary/20 p-4 bg-primary/5">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Keep your compliance details up to date so administrators can approve changes quickly. If your approval status changes, you will receive an email and see it reflected in the badge above.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    disabled={isSaving || !hasUnsavedChanges}
                    onClick={handleSaveProfile}
                    className="min-w-[140px]"
                  >
                    {isSaving ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <AnimatedCard delay={0.2}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser notifications for important updates</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Text message alerts for urgent matters</p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-primary/10 pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Session & Patient Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Session Reminders</Label>
                          <p className="text-sm text-muted-foreground">Remind me before scheduled sessions</p>
                        </div>
                        <Switch
                          checked={notifications.sessionReminders}
                          onCheckedChange={(checked) => handleNotificationChange('sessionReminders', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Patient Messages</Label>
                          <p className="text-sm text-muted-foreground">Messages from patients and families</p>
                        </div>
                        <Switch
                          checked={notifications.patientMessages}
                          onCheckedChange={(checked) => handleNotificationChange('patientMessages', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Resource Updates</Label>
                          <p className="text-sm text-muted-foreground">New resources and materials available</p>
                        </div>
                        <Switch
                          checked={notifications.resourceUpdates}
                          onCheckedChange={(checked) => handleNotificationChange('resourceUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">System Alerts</Label>
                          <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                        </div>
                        <Switch
                          checked={notifications.systemAlerts}
                          onCheckedChange={(checked) => handleNotificationChange('systemAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <AnimatedCard delay={0.2}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Change Password</Label>
                          <p className="text-sm text-muted-foreground">Update your account password</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-primary/20 hover:bg-primary/10"
                          onClick={() => setShowPasswordChangeModal(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Shield className="h-4 w-4 mr-2" />
                          Enable
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Login Activity</Label>
                          <p className="text-sm text-muted-foreground">View recent login attempts</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Data & Privacy</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Export Data</Label>
                          <p className="text-sm text-muted-foreground">Download your account data</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Mail className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Privacy Settings</Label>
                          <p className="text-sm text-muted-foreground">Manage your privacy preferences</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Shield className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Delete Account Section */}
                <AnimatedCard delay={0.4}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-destructive/20">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Danger Zone</h3>
                    </div>
                    
                    <div className="p-6 border border-destructive/20 rounded-xl bg-gradient-to-r from-destructive/5 to-transparent">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-semibold text-foreground mb-2">Delete Account</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• All your profile information will be deleted</p>
                            <p>• Your patient assignments will be reassigned</p>
                            <p>• All session history will be permanently removed</p>
                            <p>• You will lose access to all platform features</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4">
                          <Button 
                            variant="destructive" 
                            className="bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                            onClick={handleDeleteAccount}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {activeTab === 'preferences' && (
              <AnimatedCard delay={0.2}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">Default Session Duration</Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">Working Hours</Label>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <Label className="text-sm text-muted-foreground">Start Time</Label>
                          <Input type="time" defaultValue="09:00" className="border-primary/20 focus:ring-primary/20" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">End Time</Label>
                          <Input type="time" defaultValue="17:00" className="border-primary/20 focus:ring-primary/20" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">Time Zone</Label>
                      <Select defaultValue="Africa/Kigali">
                        <SelectTrigger className="w-64 border-primary/20 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Kigali">Africa/Kigali (GMT+2)</SelectItem>
                          <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6">
                {/* Create New Ticket */}
                <AnimatedCard delay={0.2}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Create Support Ticket</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-subject">Subject *</Label>
                        <Input
                          id="ticket-subject"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue"
                          className="border-input focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ticket-category">Category *</Label>
                          <Select 
                            value={ticketForm.category} 
                            onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger className="border-input focus:ring-primary/20">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="scheduling">Scheduling</SelectItem>
                              <SelectItem value="billing">Billing & Payment</SelectItem>
                              <SelectItem value="account">Account Issue</SelectItem>
                              <SelectItem value="patient">Patient-related Issue</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticket-priority">Priority</Label>
                          <Select 
                            value={ticketForm.priority} 
                            onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger className="border-input focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticket-description">Description *</Label>
                        <Textarea
                          id="ticket-description"
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Please provide detailed information about your issue. Include any error messages, steps to reproduce, and what you were trying to do when the issue occurred."
                          className="min-h-[150px] border-input focus:ring-primary/20 resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          The more details you provide, the faster we can help you.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>We typically respond within 24 hours</span>
                        </div>
                        <Button
                          onClick={handleCreateTicket}
                          disabled={isCreatingTicket || !ticketForm.subject || !ticketForm.category || !ticketForm.description}
                          className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          {isCreatingTicket ? (
                            <>
                              <Spinner variant="bars" size={16} className="text-white mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* My Tickets */}
                <AnimatedCard delay={0.3}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Ticket className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">My Support Tickets</h3>
                    </div>

                    {myTickets.length > 0 ? (
                      <div className="space-y-3">
                        {myTickets.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            className="p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold text-foreground">#{ticket.id}</h4>
                                  <p className="font-medium text-foreground">{ticket.subject}</p>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {ticket.description}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge className={getStatusColor(ticket.status)}>
                                    {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                  </Badge>
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                                  </Badge>
                                  <Badge variant="outline" className="border-primary/20">
                                    {ticket.category}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>Created {ticket.createdAt.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No support tickets yet</p>
                        <p className="text-sm text-muted-foreground">Create a ticket above if you need assistance</p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </div>
            )}
          </div>
        </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordChangeModal} onOpenChange={setShowPasswordChangeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordChangeData.currentPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordChangeData.newPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordChangeData.confirmPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordChangeModal(false);
                setPasswordChangeData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordChangeData.currentPassword || !passwordChangeData.newPassword || !passwordChangeData.confirmPassword}
            >
              {isChangingPassword ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Changing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete your account and remove all data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h4 className="font-semibold text-foreground mb-2">What will be deleted:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your profile and personal information</li>
                <li>• All session history and notes</li>
                <li>• Patient assignments (will be reassigned)</li>
                <li>• All messages and communications</li>
                <li>• Your account credentials</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-destructive/20 focus:ring-destructive/20"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
