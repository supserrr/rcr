'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Separator } from '@workspace/ui/components/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Video, 
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  Shield,
  X,
  CheckCircle,
  Calendar as CalendarIcon,
  ExternalLink,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Counselor, Patient } from '@workspace/ui/lib/types';
import { normalizeAvatarUrl } from '../lib/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Counselor | Patient | null;
  userType: 'counselor' | 'patient';
  currentUserRole: 'patient' | 'counselor' | 'admin';
  onAssignPatient?: (patientId: string, counselorId: string) => Promise<void>;
  onUnassignPatient?: (patientId: string) => Promise<void>;
  currentCounselorId?: string;
  availableCounselors?: Array<{ id: string; name: string; email?: string }>;
}

export function ProfileViewModal({ 
  isOpen, 
  onClose, 
  user, 
  userType, 
  currentUserRole,
  onAssignPatient,
  onUnassignPatient,
  currentCounselorId,
  availableCounselors = []
}: ProfileViewModalProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>('');
  const [showPassToColleague, setShowPassToColleague] = useState(false);
  
  if (!user) return null;

  const isCounselor = userType === 'counselor';
  const counselor = isCounselor ? user as Counselor : null;
  const patient = !isCounselor ? user as Patient : null;

  const userMetadata = (user as any).metadata ?? {};
  
  // Extract name with comprehensive fallback
  const extractedName = 
    user.name || 
    (user as any).fullName || 
    userMetadata.name || 
    userMetadata.full_name || 
    userMetadata.fullName ||
    userMetadata.displayName ||
    userMetadata.display_name ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Patient';
  
  // Update user.name if it's missing
  if (!user.name && extractedName !== 'Patient') {
    (user as any).name = extractedName;
  }
  
  // Extract avatar with comprehensive fallback
  const avatarSource =
    (user as any).avatar ??
    (user as any).avatarUrl ??
    (user as any).avatar_url ??
    (user as any).picture ??
    userMetadata.avatar ??
    userMetadata.avatar_url ??
    userMetadata.avatarUrl ??
    userMetadata.picture ??
    userMetadata.photo ??
    userMetadata.photo_url ??
    undefined;

  const avatarUrl = useMemo(
    () => normalizeAvatarUrl(avatarSource),
    [avatarSource],
  );
  
  // Debug logging removed - too verbose
  const availabilityDisplayOverride =
    typeof (user as any).availabilityDisplay === 'string'
      ? ((user as any).availabilityDisplay as string)
      : undefined;

  const rawAvailabilityStatusValue =
    (typeof (user as any).rawAvailabilityStatus === 'string'
      ? ((user as any).rawAvailabilityStatus as string)
      : undefined) ??
    (typeof (user as any).availabilityStatus === 'string'
      ? ((user as any).availabilityStatus as string)
      : undefined) ??
    (counselor
      ? (counselor as unknown as { rawAvailabilityStatus?: string | undefined }).rawAvailabilityStatus
      : undefined);

  const availabilityRawFallback =
    (typeof (user as any).availability === 'string'
      ? ((user as any).availability as string)
      : undefined) ?? counselor?.availability;

  const formatAvailabilityStatus = (status?: string) => {
    if (!status) {
      return undefined;
    }
    const normalizedOriginal = status.trim();
    const token = normalizedOriginal.toLowerCase().replace(/[\s_-]+/g, '');
    switch (token) {
      case 'available':
        return 'Available';
      case 'busy':
      case 'booked':
      case 'partial':
        return 'Busy';
      case 'limited':
      case 'limitedspots':
      case 'limitedavailability':
        return 'Limited Spots';
      case 'waitlist':
        return 'Waitlist';
      case 'offline':
        return 'Offline';
      case 'unavailable':
      case 'notavailable':
      case 'away':
      case 'inactive':
      case 'outofoffice':
        return 'Unavailable';
      default:
        return normalizedOriginal.charAt(0).toUpperCase() + normalizedOriginal.slice(1);
    }
  };

  const availabilityResolution = useMemo(() => {
    const config: Record<string, { label: string; indicatorClass: string }> = {
      available: { label: 'Available', indicatorClass: 'bg-green-500' },
      busy: { label: 'Busy', indicatorClass: 'bg-yellow-500' },
      limited: { label: 'Limited Spots', indicatorClass: 'bg-amber-500' },
      waitlist: { label: 'Waitlist', indicatorClass: 'bg-orange-500' },
      offline: { label: 'Offline', indicatorClass: 'bg-gray-500' },
      unavailable: { label: 'Unavailable', indicatorClass: 'bg-gray-500' },
    };

    const rawCandidates = [
      rawAvailabilityStatusValue,
      availabilityRawFallback,
      (counselor as unknown as { availability?: string | undefined })?.availability,
    ];

    let lookupKey: keyof typeof config = 'available';
    let matchedRaw: string | undefined;

    for (const candidate of rawCandidates) {
      if (!candidate || typeof candidate !== 'string') {
        continue;
      }
      const trimmed = candidate.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const normalized = trimmed.toLowerCase();
      const compact = normalized.replace(/[\s_-]+/g, '');
      let mapped = compact;
      if (compact === 'limitedspots' || compact === 'limitedavailability') {
        mapped = 'limited';
      } else if (compact === 'booked' || compact === 'partial') {
        mapped = 'busy';
      } else if (compact === 'notavailable' || compact === 'outofoffice') {
        mapped = 'unavailable';
      }
      if (
        mapped === 'available' ||
        mapped === 'busy' ||
        mapped === 'limited' ||
        mapped === 'waitlist' ||
        mapped === 'offline' ||
        mapped === 'unavailable'
      ) {
        lookupKey = mapped as keyof typeof config;
        matchedRaw = trimmed;
        break;
      }
    }

    const fallback = config[lookupKey] ?? config.available;
    const label =
      availabilityDisplayOverride ??
      formatAvailabilityStatus(matchedRaw) ??
      fallback?.label ??
      'Available';

    return {
      label,
      indicatorClass: fallback?.indicatorClass ?? 'bg-gray-500',
    };
  }, [
    availabilityDisplayOverride,
    availabilityRawFallback,
    counselor,
    rawAvailabilityStatusValue,
  ]);

  const counselorAvailability = availabilityResolution.label;
  const availabilityIndicatorClass = availabilityResolution.indicatorClass;

  const mergeStringArrays = (...values: unknown[]): string[] | undefined => {
    const merged = new Set<string>();
    values.forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.length > 0) {
              merged.add(trimmed);
            }
          }
        });
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          merged.add(trimmed);
        }
      }
    });
    return merged.size > 0 ? Array.from(merged) : undefined;
  };

  const counselorSessionModalities = mergeStringArrays(
    (user as any).sessionModalities,
    (user as any).consultationTypes,
    (user as any).services,
    counselor
      ? (counselor as unknown as { sessionModalities?: string[] | undefined }).sessionModalities
      : undefined,
    (counselor as unknown as { consultationTypes?: string[] | undefined })?.consultationTypes,
  );

  const counselorExperience =
    typeof counselor?.experience === 'number' && counselor.experience > 0
      ? counselor.experience
      : typeof (user as any).experienceYears === 'number'
        ? (user as any).experienceYears
        : undefined;

  const formatServiceLabel = (service: string) => {
    const normalized = service.toLowerCase().replace(/\s+/g, '');
    switch (normalized) {
      case 'chat':
        return 'Chat';
      case 'messaging':
      case 'message':
      case 'text':
        return 'Messaging';
      case 'video':
        return 'Video';
      case 'telehealth':
        return 'Telehealth';
      case 'virtual':
        return 'Virtual';
      case 'phone':
      case 'call':
      case 'voice':
        return 'Phone';
      case 'inperson':
      case 'in-person':
        return 'In-Person';
      default:
        return service;
    }
  };

  const counselorLanguages =
    (('languages' in user ? (user as any).languages : undefined) as string[] | undefined) ||
    (counselor && Array.isArray((counselor as any).languages) ? (counselor as any).languages : undefined);

  const handleSendMessage = () => {
    console.log('Send message to', user.name);
    onClose();
  };

  const handleScheduleSession = () => {
    console.log('Schedule session with', user.name);
    onClose();
  };

  const handleViewProgress = () => {
    console.log('View progress for', user.name);
    onClose();
  };

  const handleMakeMyPatient = async () => {
    if (!onAssignPatient || !currentCounselorId || !user) return;
    
    try {
      setIsAssigning(true);
      await onAssignPatient(user.id, currentCounselorId);
      onClose();
    } catch (error) {
      console.error('Error assigning patient:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handlePassToColleague = async () => {
    if (!onAssignPatient || !selectedCounselorId || !user) return;
    
    try {
      setIsAssigning(true);
      await onAssignPatient(user.id, selectedCounselorId);
      setShowPassToColleague(false);
      onClose();
    } catch (error) {
      console.error('Error passing patient to colleague:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Extract all patient information from user and metadata
  const patientData = user as any;
  const patientMetadata = patientData.metadata || {};
  
  // Debug logging removed - too verbose
  
  // Calculate age from date_of_birth if available
  const calculateAge = (dateOfBirth: string | Date | undefined): string | undefined => {
    if (!dateOfBirth) return undefined;
    try {
      const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
      if (isNaN(dob.getTime())) return undefined;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : undefined;
    } catch {
      return undefined;
    }
  };
  
  // Extract date_of_birth from multiple sources
  const dateOfBirth = 
    patientData.date_of_birth || 
    patientData.dateOfBirth || 
    patientMetadata.date_of_birth || 
    patientMetadata.dateOfBirth;
  const calculatedAge = 
    patientData.age || 
    patientMetadata.age || 
    calculateAge(dateOfBirth);
  
  // Helper function to safely get nested values
  const getValue = (...paths: (string | undefined)[]): any => {
    for (const path of paths) {
      if (!path) continue;
      const keys = path.split('.');
      let value: any = patientData;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    // Try metadata as fallback
    for (const path of paths) {
      if (!path) continue;
      const keys = path.split('.');
      let value: any = patientMetadata;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return undefined;
  };
  
  // Extract all fields with comprehensive fallback logic
  const allPatientInfo = {
    // Basic info - these should always be available
    name: extractedName,
    email: user.email || getValue('email') || '',
    phoneNumber: 
      patientData.phoneNumber ||
      patientData.contactPhone ||
      patientData.phone ||
      patientData.phone_number ||
      patientData.contact_phone ||
      getValue('phoneNumber', 'contactPhone', 'phone', 'phone_number', 'contact_phone') || 
      undefined,
    location: 
      patientData.location ||
      patientData.address ||
      getValue('location', 'address') || 
      undefined,
    
    // Health info - check all possible field names
    // Check direct fields first, then use getValue as fallback
    diagnosis: 
      patientData.diagnosis ||
      patientData.cancer_type ||
      patientData.cancerType ||
      getValue('diagnosis', 'cancer_type', 'cancerType') || 
      undefined,
    treatmentStage: 
      patientData.treatmentStage ||
      patientData.treatment_stage ||
      patientData.stage ||
      getValue('treatmentStage', 'treatment_stage', 'stage') || 
      undefined,
    currentTreatment: 
      patientData.currentTreatment ||
      patientData.current_treatment ||
      getValue('currentTreatment', 'current_treatment') || 
      undefined,
    diagnosisDate: 
      patientData.diagnosisDate ||
      patientData.diagnosis_date ||
      getValue('diagnosisDate', 'diagnosis_date') || 
      undefined,
    cancerType: 
      patientData.cancerType ||
      patientData.cancer_type ||
      getValue('cancerType', 'cancer_type') || 
      undefined,
    dateOfBirth: dateOfBirth,
    
    // Personal info
    age: calculatedAge,
    gender: 
      patientData.gender ||
      getValue('gender') || 
      undefined,
    preferredLanguage: 
      patientData.preferredLanguage ||
      patientData.preferred_language ||
      patientData.language ||
      getValue('preferredLanguage', 'preferred_language', 'language') || 
      undefined,
    
    // Support info
    supportNeeds: 
      getValue('supportNeeds', 'support_needs') || 
      undefined,
    familySupport: 
      getValue('familySupport', 'family_support') || 
      undefined,
    consultationType: 
      getValue('consultationType', 'consultation_type') || 
      undefined,
    specialRequests: 
      getValue('specialRequests', 'special_requests') || 
      undefined,
    
    // Emergency contact
    emergencyContact: 
      patientData.emergencyContact ||
      patientData.emergency_contact ||
      getValue('emergencyContact', 'emergency_contact') || 
      undefined,
    emergencyContactPhone: 
      patientData.emergencyContactPhone ||
      patientData.emergency_contact_phone ||
      getValue('emergencyContactPhone', 'emergency_contact_phone') || 
      undefined,
    emergencyContactName: 
      patientData.emergencyContactName ||
      patientData.emergency_contact_name ||
      getValue('emergencyContactName', 'emergency_contact_name') || 
      undefined,
    
    // Progress
    moduleProgress: 
      getValue('moduleProgress', 'module_progress') || 
      undefined,
    
    // Assignment
    assignedCounselor: 
      getValue('assignedCounselor', 'assigned_counselor_id') || 
      undefined,
    
    // Dates
    createdAt: 
      patientData.createdAt || 
      patientData.created_at || 
      patientMetadata.created_at,
  };
  
  // Debug logging removed - too verbose

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-hidden px-4 sm:px-6 py-6 flex flex-col">
        <DialogTitle className="sr-only">
          {isCounselor ? 'Counselor Profile' : 'Patient Profile'} - {extractedName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          View {isCounselor ? 'counselor' : 'patient'} profile information and details
        </DialogDescription>
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b flex-shrink-0 -mx-4 sm:-mx-6 -mt-6 sm:-mt-6 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                    <AvatarImage src={avatarUrl} alt={extractedName} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {extractedName.split(' ').map(n => n[0]).join('') || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${availabilityIndicatorClass} rounded-full border-2 border-background flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">{extractedName}</h1>
                  {isCounselor && counselor?.specialty && (
                    <p className="text-primary font-medium mb-2">{counselor.specialty}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {currentUserRole === 'patient' && isCounselor && (
                <Button onClick={handleScheduleSession} className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Schedule Session
                </Button>
              )}
              {(currentUserRole === 'counselor' || currentUserRole === 'admin') && !isCounselor && (
                <>
                  <Button 
                    onClick={handleScheduleSession} 
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                  <CalendarIcon className="h-4 w-4" />
                  Schedule Session
                </Button>
                  {onAssignPatient && currentCounselorId && (
                    <>
                      <Button 
                        onClick={handleMakeMyPatient} 
                        className="flex items-center gap-2"
                        disabled={isAssigning}
                      >
                        <Users className="h-4 w-4" />
                        {isAssigning ? 'Assigning...' : 'Make My Patient'}
                      </Button>
                      {availableCounselors.length > 0 && (
                        <>
                          {!showPassToColleague ? (
                            <Button 
                              onClick={() => setShowPassToColleague(true)} 
                              className="flex items-center gap-2"
                              variant="outline"
                            >
                              <Users className="h-4 w-4" />
                              Pass to Colleague
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select counselor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableCounselors
                                    .filter(c => c.id !== currentCounselorId)
                                    .map((counselor) => (
                                      <SelectItem key={counselor.id} value={counselor.id}>
                                        {counselor.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                onClick={handlePassToColleague} 
                                disabled={!selectedCounselorId || isAssigning}
                                size="sm"
                              >
                                {isAssigning ? 'Passing...' : 'Pass'}
                              </Button>
                              <Button 
                                onClick={() => {
                                  setShowPassToColleague(false);
                                  setSelectedCounselorId('');
                                }} 
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-6">
          <div className="space-y-6">
            {/* Consolidated Information Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  {isCounselor ? 'Professional Information' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email?.trim() || 'Not provided'}
                    </p>
                    </div>
                  </div>
                  
                  {('phoneNumber' in user && user.phoneNumber) ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{'phoneNumber' in user ? (user as any).phoneNumber : ''}</p>
                      </div>
                    </div>
                  ) : null}
                  
                  {('location' in user && user.location) ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{'location' in user ? (user as any).location : ''}</p>
                      </div>
                    </div>
                  ) : null}
                  
                </div>

                {/* Professional/Health Information */}
                {isCounselor && counselor ? (
                  <>
                    {typeof counselorExperience === 'number' && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Experience</p>
                          <p className="text-sm text-muted-foreground">{counselorExperience} years</p>
                        </div>
                      </div>
                    )}
                    {counselorAvailability && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Availability</p>
                          <p className="text-sm text-muted-foreground capitalize">{counselorAvailability}</p>
                        </div>
                      </div>
                    )}
                    {('credentials' in counselor && counselor.credentials) ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Credentials</p>
                          <p className="text-sm text-muted-foreground">{'credentials' in counselor ? (counselor as any).credentials : ''}</p>
                        </div>
                      </div>
                    ) : null}
                    {('bio' in counselor && counselor.bio) ? (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium mb-2">About</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{'bio' in counselor ? (counselor as any).bio : ''}</p>
                      </div>
                    ) : null}
                    {counselorSessionModalities && counselorSessionModalities.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium mb-2">Counseling Formats</p>
                        <div className="flex flex-wrap gap-2">
                          {counselorSessionModalities.map((modality) => (
                            <Badge key={modality} variant="outline" className="bg-muted/60 capitalize">
                              {formatServiceLabel(modality)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {counselorLanguages && counselorLanguages.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm font-medium mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {counselorLanguages.map((language: string) => (
                            <Badge key={language} variant="outline" className="bg-muted/60">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : patient && (currentUserRole === 'counselor' || currentUserRole === 'admin') ? (
                  <>
                    {/* Health Information Section - Always Show */}
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        Health Information
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allPatientInfo.cancerType ? (
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Cancer Type</p>
                            <p className="text-sm font-medium text-foreground capitalize">{allPatientInfo.cancerType}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Cancer Type</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                      )}
                        
                        {allPatientInfo.diagnosis ? (
                          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wide">Diagnosis</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.diagnosis}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Diagnosis</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                      )}
                        
                        {allPatientInfo.treatmentStage ? (
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">Treatment Stage</p>
                            <p className="text-sm font-medium text-foreground capitalize">{String(allPatientInfo.treatmentStage).replace(/-/g, ' ')}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Treatment Stage</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          </div>
                        )}
                        
                        {allPatientInfo.currentTreatment ? (
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Current Treatment</p>
                            <p className="text-sm font-medium text-foreground capitalize">{String(allPatientInfo.currentTreatment).replace(/-/g, ' ')}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Current Treatment</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          </div>
                        )}
                        
                        {allPatientInfo.diagnosisDate ? (
                          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wide">Diagnosis Date</p>
                            <p className="text-sm font-medium text-foreground">
                              {typeof allPatientInfo.diagnosisDate === 'string' 
                                ? new Date(allPatientInfo.diagnosisDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : allPatientInfo.diagnosisDate}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Diagnosis Date</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                      )}
                        </div>
                    </div>
                    
                    {/* Personal Information Section - Always Show */}
                        <Separator className="my-4" />
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                            Personal Information
                          </h4>
                          
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allPatientInfo.age ? (
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Age</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.age}</p>
                                </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Age</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                              </div>
                            )}
                        
                        {allPatientInfo.gender ? (
                          <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                            <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1 uppercase tracking-wide">Gender</p>
                            <p className="text-sm font-medium text-foreground capitalize">{String(allPatientInfo.gender).replace(/-/g, ' ')}</p>
                                </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Gender</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                              </div>
                            )}
                        
                        {allPatientInfo.location ? (
                          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wide">Location</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.location}</p>
                                </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Location</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                              </div>
                            )}
                        
                        {allPatientInfo.phoneNumber ? (
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">Phone Number</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.phoneNumber}</p>
                                </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Phone Number</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                              </div>
                            )}
                        
                        {allPatientInfo.preferredLanguage ? (
                          <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1 uppercase tracking-wide">Preferred Language</p>
                            <p className="text-sm font-medium text-foreground capitalize">{allPatientInfo.preferredLanguage}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Preferred Language</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                            </div>
                          )}
                        </div>
                    </div>
                    
                    {/* Support Information Section - Always Show */}
                        <Separator className="my-4" />
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                            Support & Preferences
                          </h4>
                          
                      {allPatientInfo.supportNeeds ? (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Support Needs</p>
                              {Array.isArray(allPatientInfo.supportNeeds) && allPatientInfo.supportNeeds.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {allPatientInfo.supportNeeds.map((need: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-background">
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                            <p className="text-sm text-foreground">{String(allPatientInfo.supportNeeds)}</p>
                              )}
                            </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Support Needs</p>
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                      )}
                      
                      {allPatientInfo.familySupport ? (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">Family Support</p>
                          <p className="text-sm font-medium text-foreground capitalize">{String(allPatientInfo.familySupport).replace(/-/g, ' ')}</p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Family Support</p>
                          <p className="text-sm text-muted-foreground">Not provided</p>
                            </div>
                          )}
                      
                      {allPatientInfo.consultationType ? (
                        <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Preferred Consultation Types</p>
                              {Array.isArray(allPatientInfo.consultationType) && allPatientInfo.consultationType.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {allPatientInfo.consultationType.map((type: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-background capitalize">
                                      {type === 'chat' ? 'Text Chat' : type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : type}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                            <p className="text-sm text-foreground capitalize">{String(allPatientInfo.consultationType)}</p>
                              )}
                            </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Preferred Consultation Types</p>
                          <p className="text-sm text-muted-foreground">Not provided</p>
                            </div>
                          )}
                      
                      {allPatientInfo.specialRequests ? (
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Special Requests</p>
                          <p className="text-sm text-foreground leading-relaxed">{String(allPatientInfo.specialRequests)}</p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Special Requests</p>
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Emergency Contact Section - Always Show */}
                        <Separator className="my-4" />
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
                      <p className="text-sm font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="h-5 w-5" />
                            Emergency Contact
                          </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allPatientInfo.emergencyContactName ? (
                              <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Name</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.emergencyContactName}</p>
                              </div>
                        ) : (
                              <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Name</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                              </div>
                            )}
                        {(allPatientInfo.emergencyContact || allPatientInfo.emergencyContactPhone) ? (
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Phone</p>
                            <p className="text-sm font-medium text-foreground">{allPatientInfo.emergencyContactPhone || allPatientInfo.emergencyContact}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Phone</p>
                            <p className="text-sm text-muted-foreground">Not provided</p>
                        </div>
                    )}
                      </div>
                    </div>
                    
                    {/* Account Information Section */}
                    {allPatientInfo.createdAt && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Created</p>
                            <p className="text-sm text-muted-foreground">
                              {typeof allPatientInfo.createdAt === 'string' 
                                ? new Date(allPatientInfo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : allPatientInfo.createdAt instanceof Date
                                ? allPatientInfo.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : patient ? (
                  <>
                    {('emergencyContact' in patient && patient.emergencyContact) ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Emergency Contact</p>
                          <p className="text-sm text-muted-foreground">{'emergencyContact' in patient ? (patient as any).emergencyContact : ''}</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Progress Section (Patient) or Statistics (Counselor) */}
            {!isCounselor && patient?.moduleProgress && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(patient.moduleProgress).map(([module, progress]) => (
                      <div key={module} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">{module}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                            {progress === 100 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
