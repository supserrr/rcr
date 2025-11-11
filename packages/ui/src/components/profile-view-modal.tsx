'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
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
  ExternalLink
} from 'lucide-react';
import { Counselor, Patient } from '@workspace/ui/lib/types';
import { normalizeAvatarUrl } from '../lib/avatar';

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Counselor | Patient | null;
  userType: 'counselor' | 'patient';
  currentUserRole: 'patient' | 'counselor' | 'admin';
}

export function ProfileViewModal({ 
  isOpen, 
  onClose, 
  user, 
  userType, 
  currentUserRole 
}: ProfileViewModalProps) {
  if (!user) return null;

  const isCounselor = userType === 'counselor';
  const counselor = isCounselor ? user as Counselor : null;
  const patient = !isCounselor ? user as Patient : null;

  const userMetadata = (user as any).metadata ?? {};
  const avatarSource =
    (user as any).avatar ??
    (user as any).avatarUrl ??
    (user as any).picture ??
    userMetadata.avatar ??
    userMetadata.avatar_url ??
    userMetadata.picture ??
    userMetadata.photo ??
    userMetadata.photo_url ??
    undefined;

  const avatarUrl = useMemo(
    () => normalizeAvatarUrl(avatarSource),
    [avatarSource],
  );
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-hidden px-4 sm:px-6 py-6 flex flex-col">
        <DialogTitle className="sr-only">
          {isCounselor ? 'Counselor Profile' : 'Patient Profile'} - {user.name}
        </DialogTitle>
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b flex-shrink-0 -mx-4 sm:-mx-6 -mt-6 sm:-mt-6 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                    <AvatarImage src={avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${availabilityIndicatorClass} rounded-full border-2 border-background flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">{user.name}</h1>
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
              {currentUserRole === 'counselor' && !isCounselor && (
                <Button onClick={handleScheduleSession} className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Schedule Session
                </Button>
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
