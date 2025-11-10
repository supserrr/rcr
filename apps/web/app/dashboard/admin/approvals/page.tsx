'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Award,
  Phone,
  Mail,
  FileText,
  Star,
  GraduationCap,
  MessageCircle,
  Video,
  Briefcase,
  Shield,
  Download,
  Heart
} from 'lucide-react';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import type { CounselorApprovalStatus } from '../../../../lib/types';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

const getApprovalBadgeStyles = (status: CounselorApprovalStatus) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' };
    case 'needs_more_info':
      return { label: 'Needs More Info', className: 'bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300' };
    case 'suspended':
      return { label: 'Suspended', className: 'bg-slate-200 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300' };
    default:
      return { label: 'Pending Approval', className: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' };
  }
};

export default function AdminApprovalsPage() {
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<'all' | string>('all');
  const [selectedExperience, setSelectedExperience] = useState<'all' | string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<AdminUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequestInfoDialogOpen, setIsRequestInfoDialogOpen] = useState(false);
  const [requestInfoNotes, setRequestInfoNotes] = useState('');
  const supabaseUrlRef = useRef<string | undefined>(undefined);

  if (supabaseUrlRef.current === undefined) {
    const fromEnv =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);
    supabaseUrlRef.current = fromEnv ? fromEnv.replace(/\/+$/, '') : undefined;
  }

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
      const supabaseUrl = supabaseUrlRef.current;
      if (!supabaseUrl) {
        return trimmed;
      }
      const normalizedPath = trimmed.replace(/^\/+/, '');
      if (normalizedPath.startsWith('storage/v1/object/public/')) {
        return `${supabaseUrl}/${normalizedPath}`;
      }
      return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
    },
    [],
  );
  const pendingCount = useMemo(
    () => counselors.filter((counselor) => (counselor.approvalStatus ?? 'pending') !== 'approved').length,
    [counselors],
  );
  const newThisWeekCount = useMemo(
    () =>
      counselors.filter(
        (counselor) =>
          new Date(counselor.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length,
    [counselors],
  );
  const highExperienceCount = useMemo(
    () =>
      counselors.filter(
        (counselor) => (counselor.experienceYears ?? counselor.experience ?? 0) >= 5,
      ).length,
    [counselors],
  );
  const multilingualCount = useMemo(
    () =>
      counselors.filter(
        (counselor) => Array.isArray(counselor.languages) && counselor.languages.length >= 3,
      ).length,
    [counselors],
  );


  // Load counselors (Note: Backend would need to add a 'pending' status filter)
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        setCounselors(response.users);
      } catch (error) {
        console.error('Error loading counselors:', error);
        toast.error('Failed to load pending counselors');
      } finally {
        setLoading(false);
      }
    };

    loadCounselors();
  }, []);

  // Get unique specialties from counselors
  const specialties = useMemo(() => {
    const values = new Set<string>();
    counselors.forEach((c) => {
      if (c.specialty) {
        values.add(c.specialty);
      } else if (c.specializations && c.specializations.length > 0) {
        c.specializations.forEach((spec) => values.add(spec));
      }
    });
    return ['all', ...values];
  }, [counselors]);

  const filteredCounselors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = counselors.filter((counselor) => {
      const primarySpecialty =
        counselor.specialty ||
        (counselor.specializations && counselor.specializations[0]) ||
        '';
      const languages = counselor.languages ?? [];
      const practiceName = counselor.practiceName ?? '';

      const matchesSearch =
        normalizedSearch.length === 0 ||
        (counselor.fullName || counselor.email || '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        counselor.email.toLowerCase().includes(normalizedSearch) ||
        primarySpecialty.toLowerCase().includes(normalizedSearch) ||
        practiceName.toLowerCase().includes(normalizedSearch) ||
        languages.some((language) => language.toLowerCase().includes(normalizedSearch));

      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        counselor.specialty === selectedSpecialty ||
        (counselor.specializations ?? []).includes(selectedSpecialty);

      const experienceValue = counselor.experienceYears ?? counselor.experience ?? 0;
      const matchesExperience =
        selectedExperience === 'all' ||
        (selectedExperience === '0-2' && experienceValue <= 2) ||
        (selectedExperience === '3-5' && experienceValue >= 3 && experienceValue <= 5) ||
        (selectedExperience === '6-10' && experienceValue >= 6 && experienceValue <= 10) ||
        (selectedExperience === '10+' && experienceValue > 10);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

    const statusOrder: Record<string, number> = {
      pending: 0,
      needs_more_info: 1,
      suspended: 2,
      rejected: 3,
      approved: 4,
    };

    return filtered.sort((a, b) => {
      const statusA = a.approvalStatus ?? 'pending';
      const statusB = b.approvalStatus ?? 'pending';
      const orderA = statusOrder[statusA] ?? 99;
      const orderB = statusOrder[statusB] ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const dateA = new Date(a.approvalSubmittedAt ?? a.createdAt).getTime();
      const dateB = new Date(b.approvalSubmittedAt ?? b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [counselors, searchTerm, selectedSpecialty, selectedExperience]);

  const handleViewDetails = (counselor: AdminUser) => {
    setSelectedCounselor(counselor);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCounselor(null);
    setIsRequestInfoDialogOpen(false);
    setRequestInfoNotes('');
  };

  const handleApprove = async (counselorId: string) => {
    setIsProcessing(true);
    try {
      await AdminApi.updateCounselorApproval(counselorId, {
        approvalStatus: 'approved',
      });
      toast.success('Counselor approved successfully!');
      setCounselors((prev) =>
        prev.map((c) =>
          c.id === counselorId
            ? {
                ...c,
                approvalStatus: 'approved',
                approvalReviewedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error approving counselor:', error);
      toast.error('Failed to approve counselor. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (counselorId: string) => {
    setIsProcessing(true);
    try {
      const notes = window.prompt('Share a short note to send with the rejection (optional):', selectedCounselor?.approvalNotes ?? '') || undefined;
      await AdminApi.updateCounselorApproval(counselorId, {
        approvalStatus: 'rejected',
        approvalNotes: notes,
      });
      toast.success('Counselor application rejected.');
      setCounselors((prev) =>
        prev.map((c) =>
          c.id === counselorId
            ? {
                ...c,
                approvalStatus: 'rejected',
                approvalNotes: notes,
                approvalReviewedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting counselor:', error);
      toast.error('Failed to reject counselor. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = () => {
    if (!selectedCounselor) {
      return;
    }
    setRequestInfoNotes(selectedCounselor.approvalNotes ?? '');
    setIsRequestInfoDialogOpen(true);
  };

  const submitRequestInfo = async () => {
    if (!selectedCounselor) {
      return;
    }
    const counselorId = selectedCounselor.id;

    setIsProcessing(true);
    try {
      await AdminApi.updateCounselorApproval(counselorId, {
        approvalStatus: 'needs_more_info',
        approvalNotes: requestInfoNotes.trim() || undefined,
      });
      toast.success('Requested additional information from the counselor.');
      setCounselors((prev) =>
        prev.map((c) =>
          c.id === counselorId
            ? {
                ...c,
                approvalStatus: 'needs_more_info',
                approvalNotes: requestInfoNotes.trim() || undefined,
                approvalReviewedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      setIsRequestInfoDialogOpen(false);
      handleCloseModal();
    } catch (error) {
      console.error('Error requesting more information:', error);
      toast.error('Failed to request more information. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getExperienceColor = (experience: number) => {
    if (experience <= 2) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (experience <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (experience <= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Counselor Approvals"
        description="Review and approve pending counselor applications"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : newThisWeekCount}
            </div>
            <p className="text-xs text-muted-foreground">
              New applications
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Experience</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : highExperienceCount}
            </div>
            <p className="text-xs text-muted-foreground">
              5+ years experience
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-lingual</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : multilingualCount}
            </div>
            <p className="text-xs text-muted-foreground">
              3+ languages
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value)}>
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

        <Select value={selectedExperience} onValueChange={(value) => setSelectedExperience(value)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experience</SelectItem>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner variant="bars" size={36} className="text-primary" />
        </div>
      ) : (
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Applications List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counselor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCounselors.length > 0 ? filteredCounselors.map((counselor) => (
              <TableRow key={counselor.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={toPublicUrl(counselor.avatarUrl)}
                        alt={counselor.fullName || counselor.email}
                      />
                      <AvatarFallback>
                        {(counselor.fullName || counselor.email || 'C').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{counselor.fullName || counselor.email}</p>
                      <p className="text-sm text-muted-foreground">{counselor.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-primary/20">
                    {counselor.specialty ||
                      counselor.specializations?.[0] ||
                      'General Counseling'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getExperienceColor(counselor.experienceYears ?? counselor.experience ?? 0)}
                  >
                    {counselor.experienceYears ?? counselor.experience ?? 0} years
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{counselor.practiceLocation || counselor.location || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(counselor.approvalSubmittedAt ?? counselor.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const { label, className } = getApprovalBadgeStyles(counselor.approvalStatus ?? 'pending');
                    return (
                      <Badge className={`${className} text-xs`}>
                        {label}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(counselor)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No counselor applications found</p>
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCounselors.length} of {counselors.length} applications
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Counselor Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-muted-foreground">Counselor Application</span>
                <h3 className="text-lg font-semibold">{selectedCounselor?.fullName || selectedCounselor?.email}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCounselor && (
                <span>
                  {(selectedCounselor.specialty || selectedCounselor.specializations?.[0] || 'General Counseling')} • {(selectedCounselor.experienceYears ?? selectedCounselor.experience ?? 0)} years experience • {(selectedCounselor.languages?.length ?? selectedCounselor.counselorProfile?.languages?.length ?? 0)} languages
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCounselor &&
            (() => {
              const profile = selectedCounselor.counselorProfile;
              const languages = selectedCounselor.languages ?? profile?.languages ?? [];
              const specializations =
                selectedCounselor.specializations ?? profile?.specializations ?? [];
              const consultationTypes =
                selectedCounselor.consultationTypes ?? profile?.sessionModalities ?? [];
              const demographics =
                selectedCounselor.demographicsServed ?? profile?.demographicsServed ?? [];
              const professionalHighlights =
                selectedCounselor.professionalHighlights ?? profile?.professionalHighlights ?? [];
              const educationHistory =
                selectedCounselor.educationHistory ?? profile?.educationHistory ?? [];
              const documents = selectedCounselor.documents ?? [];
              const references = Array.isArray(selectedCounselor.professionalReferences)
                ? selectedCounselor.professionalReferences
                : profile?.professionalReferences ?? [];
              const applicationDate =
                selectedCounselor.approvalSubmittedAt ?? selectedCounselor.createdAt;

              return (
            <div className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage
                            src={toPublicUrl(selectedCounselor.avatarUrl)}
                            alt={selectedCounselor.fullName || selectedCounselor.email}
                          />
                      <AvatarFallback className="text-lg">
                            {(selectedCounselor.fullName || selectedCounselor.email || 'C')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-2">
                          <h4 className="text-lg font-semibold">
                            {selectedCounselor.fullName || selectedCounselor.email}
                          </h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">{selectedCounselor.email}</span>
                        </div>
                            {selectedCounselor.phoneNumber && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{selectedCounselor.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                        {(selectedCounselor.practiceLocation || selectedCounselor.location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">
                              {selectedCounselor.practiceLocation || selectedCounselor.location}
                            </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {selectedCounselor.specialty || specializations[0] || 'General Counseling'}
                          </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {selectedCounselor.experienceYears ?? selectedCounselor.experience ?? 0} years experience
                          </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-3 text-sm">Languages</h5>
                    <div className="flex flex-wrap gap-2">
                          {languages.length > 0 ? (
                            languages.map((language, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not provided</span>
                          )}
                    </div>
                  </div>

                      {selectedCounselor.availabilityStatus && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Availability</h5>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {selectedCounselor.availabilityStatus}
                      </Badge>
                    </div>
                  )}

                      <div className="space-y-2">
                        <h5 className="font-medium mb-1 text-sm">Application Date</h5>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{new Date(applicationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Practice & Availability */}
                  {(selectedCounselor.practiceName ||
                    selectedCounselor.serviceRegions ||
                    selectedCounselor.acceptingNewPatients !== undefined ||
                    selectedCounselor.telehealthOffered !== undefined) && (
                    <div className="space-y-4 border-t pt-6">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Practice & Availability
                  </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCounselor.practiceName && (
                    <div>
                            <p className="text-xs text-muted-foreground mb-1">Practice Name</p>
                            <p className="text-sm font-medium">{selectedCounselor.practiceName}</p>
                    </div>
                        )}
                        {selectedCounselor.practiceLocation && (
                    <div>
                            <p className="text-xs text-muted-foreground mb-1">Practice Location</p>
                            <p className="text-sm font-medium">{selectedCounselor.practiceLocation}</p>
                    </div>
                        )}
                        {selectedCounselor.acceptingNewPatients !== undefined && (
                    <div>
                            <p className="text-xs text-muted-foreground mb-1">Accepting New Patients</p>
                            <Badge variant="outline" className="text-xs">
                              {selectedCounselor.acceptingNewPatients ? 'Yes' : 'No'}
                            </Badge>
                </div>
              )}
                        {selectedCounselor.waitlistEnabled !== undefined && (
                      <div>
                            <p className="text-xs text-muted-foreground mb-1">Waitlist Enabled</p>
                            <Badge variant="outline" className="text-xs">
                              {selectedCounselor.waitlistEnabled ? 'Yes' : 'No'}
                            </Badge>
                      </div>
                    )}
                        {selectedCounselor.telehealthOffered !== undefined && (
                      <div>
                            <p className="text-xs text-muted-foreground mb-1">Telehealth Offered</p>
                            <Badge variant="outline" className="text-xs">
                              {selectedCounselor.telehealthOffered ? 'Yes' : 'No'}
                            </Badge>
                      </div>
                    )}
                        {selectedCounselor.inPersonOffered !== undefined && (
                      <div>
                            <p className="text-xs text-muted-foreground mb-1">In-person Sessions</p>
                            <Badge variant="outline" className="text-xs">
                              {selectedCounselor.inPersonOffered ? 'Yes' : 'No'}
                            </Badge>
                      </div>
                    )}
                  </div>
                      {(selectedCounselor.serviceRegions && selectedCounselor.serviceRegions.length > 0) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Service Regions</p>
                      <div className="flex flex-wrap gap-2">
                            {selectedCounselor.serviceRegions.map((region, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(selectedCounselor.sessionModalities && selectedCounselor.sessionModalities.length > 0) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Session Modalities</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCounselor.sessionModalities.map((modality, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {modality}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specializations & Consultation Types */}
                  {(specializations.length > 0 ||
                    consultationTypes.length > 0 ||
                    demographics.length > 0 ||
                    selectedCounselor.approachSummary) && (
                <div className="space-y-4 border-t pt-6">
                      {specializations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Specializations</h5>
                      <div className="flex flex-wrap gap-2">
                            {specializations.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                      {consultationTypes.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Consultation Types</h5>
                      <div className="flex flex-wrap gap-2">
                            {consultationTypes.map((type, index) => {
                              const icons: Record<string, React.ElementType> = {
                            chat: MessageCircle,
                            video: Video,
                                phone: Phone,
                          };
                          const labels: Record<string, string> = {
                            chat: 'Text Chat',
                            video: 'Video Call',
                                phone: 'Phone Call',
                          };
                          const Icon = icons[type] || MessageCircle;
                          return (
                            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              {labels[type] || type}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                      {demographics.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-3 text-sm">Demographics Served</h5>
                          <div className="flex flex-wrap gap-2">
                            {demographics.map((demographic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {demographic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedCounselor.approachSummary && (
                        <div>
                          <h5 className="font-medium mb-2 text-sm">Approach Summary</h5>
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedCounselor.approachSummary}
                            </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

                  {/* Professional License Information */}
                  {(selectedCounselor.licenseNumber ||
                    selectedCounselor.licenseJurisdiction ||
                    selectedCounselor.licenseExpiry) && (
                    <div className="space-y-6 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4" />
                        Professional License
                  </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedCounselor.licenseNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">License Number</p>
                            <p className="text-sm font-medium">{selectedCounselor.licenseNumber}</p>
                  </div>
                        )}
                        {selectedCounselor.licenseJurisdiction && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">License Jurisdiction</p>
                            <p className="text-sm font-medium">{selectedCounselor.licenseJurisdiction}</p>
                          </div>
                        )}
                        {selectedCounselor.licenseExpiry && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">License Expiry</p>
                            <p className="text-sm font-medium">{selectedCounselor.licenseExpiry}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education Information */}
                  {(selectedCounselor.highestDegree ||
                    selectedCounselor.university ||
                    selectedCounselor.graduationYear ||
                    educationHistory.length > 0 ||
                    (selectedCounselor.additionalCertifications &&
                      selectedCounselor.additionalCertifications.length > 0)) && (
                    <div className="space-y-6 border-t pt-6">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4" />
                        Education & Certifications
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCounselor.highestDegree && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Highest Degree</p>
                            <p className="text-sm font-medium">{selectedCounselor.highestDegree}</p>
                          </div>
                        )}
                        {selectedCounselor.university && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">University/Institution</p>
                            <p className="text-sm font-medium">{selectedCounselor.university}</p>
                          </div>
                        )}
                        {selectedCounselor.graduationYear && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Graduation Year</p>
                            <p className="text-sm font-medium">{selectedCounselor.graduationYear}</p>
                          </div>
                        )}
                      </div>

                      {educationHistory.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground mb-1">Education History</p>
                          <div className="space-y-2">
                            {educationHistory.map((item, index) => (
                              <div key={index} className="p-3 border rounded-lg bg-muted/40">
                                <p className="text-sm font-medium">
                                  {item.degree || 'Degree not specified'}
                                </p>
                                {(item.institution || item.graduationYear) && (
                                  <p className="text-xs text-muted-foreground">
                                    {[item.institution, item.graduationYear].filter(Boolean).join(' • ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCounselor.additionalCertifications &&
                        selectedCounselor.additionalCertifications.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Additional Certifications</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedCounselor.additionalCertifications.map((cert, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                </div>
              )}

              {/* Professional Information */}
              <div className="space-y-6 border-t pt-6">
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    Credentials
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed">
                          {Array.isArray(selectedCounselor.credentials)
                            ? selectedCounselor.credentials.join(', ')
                            : selectedCounselor.credentials || 'Not provided'}
                        </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Professional Bio
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed">
                          {selectedCounselor.bio || profile?.bio || 'Not provided'}
                        </p>
                  </div>
                </div>

                    {professionalHighlights.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4" />
                          Professional Highlights
                        </h5>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {professionalHighlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCounselor.previousEmployers && (
                      <div className="space-y-3">
                        <h5 className="font-medium flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4" />
                          Previous Employers / Experience
                        </h5>
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedCounselor.previousEmployers}
                          </p>
                        </div>
                      </div>
                    )}
              </div>

              {/* Motivation */}
                  {selectedCounselor.motivationStatement && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4" />
                    Motivation to Join RCR
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedCounselor.motivationStatement}
                        </p>
                  </div>
                </div>
              )}

              {/* References */}
                  {references && references.length > 0 && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Professional References
                  </h5>
                      <div className="space-y-3">
                        {references.map((reference, index) => {
                          const refRecord =
                            reference && typeof reference === 'object'
                              ? (reference as Record<string, unknown>)
                              : typeof reference === 'string'
                                ? ({ name: reference } as Record<string, unknown>)
                                : undefined;

                          const referenceName = (() => {
                            const recordName = refRecord?.name;
                            if (typeof recordName === 'string') {
                              const trimmed = recordName.trim();
                              if (trimmed.length > 0) {
                                return trimmed;
                              }
                            }
                            return 'Reference';
                          })();

                          const detailKeys: Array<'organization' | 'email' | 'phone'> = [
                            'organization',
                            'email',
                            'phone',
                          ];
                          const refDetails = detailKeys
                            .map((key) => {
                              const value = refRecord?.[key];
                              return typeof value === 'string' && value.trim().length > 0
                                ? value.trim()
                                : undefined;
                            })
                            .filter((value): value is string => Boolean(value));

                          return (
                            <div key={index} className="p-4 border rounded-lg bg-muted/40">
                              <p className="text-sm font-medium">{referenceName}</p>
                              {refDetails.length > 0 ? (
                                <p className="text-xs text-muted-foreground">{refDetails.join(' • ')}</p>
                              ) : null}
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
                  {(selectedCounselor.emergencyContactName || selectedCounselor.emergencyContactPhone) && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    Emergency Contact
                  </h5>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-1">
                        {selectedCounselor.emergencyContactName && (
                          <p className="text-sm font-medium">{selectedCounselor.emergencyContactName}</p>
                        )}
                        {selectedCounselor.emergencyContactPhone && (
                          <p className="text-sm text-muted-foreground">
                            {selectedCounselor.emergencyContactPhone}
                          </p>
                        )}
                  </div>
                </div>
              )}

              {/* Document Uploads */}
              <div className="space-y-4 border-t pt-6">
                <h5 className="font-medium flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  Uploaded Documents
                </h5>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/30 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          {doc.label}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={toPublicUrl(doc.url) ?? doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            View Document
                          </a>
                        </Button>
                      </div>
                    ))}
                        </div>
                    ) : (
                  <div className="text-sm text-muted-foreground">No documents uploaded</div>
                )}
                        </div>
                      </div>
          );
        })()}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <p>Verify credentials and supporting documents before approval.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                disabled={isProcessing || !selectedCounselor}
                onClick={handleRequestInfo}
              >
                Request More Info
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={isProcessing || !selectedCounselor}
                onClick={() => selectedCounselor && handleReject(selectedCounselor.id)}
              >
                {isProcessing ? (
                  <>
                    <Spinner variant="bars" size={16} className="text-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={() => selectedCounselor && handleApprove(selectedCounselor.id)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Spinner variant="bars" size={16} className="text-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog
        open={isRequestInfoDialogOpen}
        onOpenChange={(open) => {
          setIsRequestInfoDialogOpen(open);
          if (!open) {
            setRequestInfoNotes('');
          } else if (selectedCounselor) {
            setRequestInfoNotes(selectedCounselor.approvalNotes ?? '');
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-muted-foreground">Request More Information</span>
                <h3 className="text-lg font-semibold">
                  {selectedCounselor?.fullName || selectedCounselor?.email}
                </h3>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <span className="text-sm text-muted-foreground">
                Please provide a detailed reason for requesting more information from this counselor.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your message..."
              value={requestInfoNotes}
              onChange={(e) => setRequestInfoNotes(e.target.value)}
              className="min-h-[150px] bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRequestInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitRequestInfo}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
