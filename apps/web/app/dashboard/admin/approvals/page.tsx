'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Input } from '@workspace/ui/components/input';
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
import { toast } from 'sonner';

export default function AdminApprovalsPage() {
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<'all' | string>('all');
  const [selectedExperience, setSelectedExperience] = useState<'all' | string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<AdminUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load counselors (Note: Backend would need to add a 'pending' status filter)
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        // Note: Backend would need to add a filter for pending counselors
        // For now, we'll load all counselors and filter for pending ones
        const response = await AdminApi.listUsers({ role: 'counselor' });
        // Filter for pending counselors (would need to check status in backend)
        // For now, show all counselors as pending approvals would be a separate status
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
  const specialties = ['all', ...new Set(counselors.map(c => (c as any).specialty).filter(Boolean))];

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = (counselor.fullName || counselor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((counselor as any).specialty || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || (counselor as any).specialty === selectedSpecialty;
    const experience = (counselor as any).experience || 0;
    const matchesExperience = selectedExperience === 'all' || 
      (selectedExperience === '0-2' && experience <= 2) ||
      (selectedExperience === '3-5' && experience >= 3 && experience <= 5) ||
      (selectedExperience === '6-10' && experience >= 6 && experience <= 10) ||
      (selectedExperience === '10+' && experience > 10);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const handleViewDetails = (counselor: AdminUser) => {
    setSelectedCounselor(counselor);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCounselor(null);
  };

  const handleApprove = async (counselorId: string) => {
    setIsProcessing(true);
    try {
      // Note: Backend would need an endpoint to approve pending counselors
      // For now, we'll update the role or status
      await AdminApi.updateUserRole(counselorId, { role: 'counselor' });
      toast.success('Counselor approved successfully!');
      // Remove approved counselor from list
      setCounselors(prev => prev.filter(c => c.id !== counselorId));
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
      // Note: Backend would need an endpoint to reject pending counselors
      // For now, we'll just remove from the list
      setCounselors(prev => prev.filter(c => c.id !== counselorId));
      toast.success('Counselor application rejected.');
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting counselor:', error);
      toast.error('Failed to reject counselor. Please try again.');
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
              {loading ? '...' : counselors.length}
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
              {loading ? '...' : counselors.filter(c => 
                new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
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
              {loading ? '...' : counselors.filter(c => ((c as any).experience || 0) >= 5).length}
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
              {loading ? '...' : counselors.filter(c => ((c as any).languages && Array.isArray((c as any).languages) && (c as any).languages.length >= 3)).length}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                <TableHead>Languages</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCounselors.length > 0 ? filteredCounselors.map((counselor) => (
              <TableRow key={counselor.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={undefined} alt={counselor.fullName || counselor.email} />
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
                    {(counselor as any).specialty || 'General Counseling'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getExperienceColor((counselor as any).experience || 0)}>
                    {(counselor as any).experience || 0} years
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {((counselor as any).languages && Array.isArray((counselor as any).languages)) 
                      ? (counselor as any).languages.slice(0, 2).map((lang: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))
                      : null}
                    {((counselor as any).languages && Array.isArray((counselor as any).languages) && (counselor as any).languages.length > 2) && (
                      <Badge variant="secondary" className="text-xs">
                        +{(counselor as any).languages.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{(counselor as any).location || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(counselor.createdAt).toLocaleDateString()}
                  </div>
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
                  <p className="text-muted-foreground">No pending applications found</p>
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
                  {(selectedCounselor as any).specialty || 'General Counseling'} • {(selectedCounselor as any).experience || 0} years experience • {((selectedCounselor as any).languages && Array.isArray((selectedCounselor as any).languages)) ? (selectedCounselor as any).languages.length : 0} languages
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCounselor && (
            <div className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={undefined} alt={selectedCounselor.fullName || selectedCounselor.email} />
                      <AvatarFallback className="text-lg">
                        {(selectedCounselor.fullName || selectedCounselor.email || 'C').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h4 className="text-lg font-semibold">{selectedCounselor.fullName || selectedCounselor.email}</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">{selectedCounselor.email}</span>
                        </div>
                        {(selectedCounselor as any).phoneNumber && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{(selectedCounselor as any).phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(selectedCounselor as any).location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{(selectedCounselor as any).location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{(selectedCounselor as any).specialty || 'General Counseling'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{(selectedCounselor as any).experience || 0} years experience</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-3 text-sm">Languages</h5>
                    <div className="flex flex-wrap gap-2">
                      {((selectedCounselor as any).languages && Array.isArray((selectedCounselor as any).languages)) 
                        ? (selectedCounselor as any).languages.map((language: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))
                        : <span className="text-sm text-muted-foreground">Not provided</span>}
                    </div>
                  </div>

                  {(selectedCounselor as any).availability && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Availability</h5>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {(selectedCounselor as any).availability}
                      </Badge>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium mb-3 text-sm">Application Date</h5>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>{new Date(selectedCounselor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional License Information */}
              {(selectedCounselor as any).licenseNumber && (
                <div className="space-y-6 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4" />
                    Professional License
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">License Number</p>
                      <p className="text-sm font-medium">{(selectedCounselor as any).licenseNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">License Expiry</p>
                      <p className="text-sm font-medium">{(selectedCounselor as any).licenseExpiry || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Issuing Authority</p>
                      <p className="text-sm font-medium">{(selectedCounselor as any).issuingAuthority || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Information */}
              {((selectedCounselor as any).highestDegree || (selectedCounselor as any).university) && (
                <div className="space-y-6 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    Education & Certifications
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedCounselor as any).highestDegree && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Highest Degree</p>
                        <p className="text-sm font-medium">{(selectedCounselor as any).highestDegree}</p>
                      </div>
                    )}
                    {(selectedCounselor as any).university && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">University/Institution</p>
                        <p className="text-sm font-medium">{(selectedCounselor as any).university}</p>
                      </div>
                    )}
                    {(selectedCounselor as any).graduationYear && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Graduation Year</p>
                        <p className="text-sm font-medium">{(selectedCounselor as any).graduationYear}</p>
                      </div>
                    )}
                  </div>
                  {(selectedCounselor as any).additionalCertifications && (selectedCounselor as any).additionalCertifications.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Additional Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCounselor as any).additionalCertifications.map((cert: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specializations & Consultation Types */}
              {((selectedCounselor as any).specializations || (selectedCounselor as any).consultationTypes) && (
                <div className="space-y-4 border-t pt-6">
                  {(selectedCounselor as any).specializations && (selectedCounselor as any).specializations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Specializations</h5>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCounselor as any).specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedCounselor as any).consultationTypes && (selectedCounselor as any).consultationTypes.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Consultation Types</h5>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCounselor as any).consultationTypes.map((type: string, index: number) => {
                          const icons: Record<string, any> = {
                            chat: MessageCircle,
                            video: Video,
                            phone: Phone
                          };
                          const labels: Record<string, string> = {
                            chat: 'Text Chat',
                            video: 'Video Call',
                            phone: 'Phone Call'
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
                </div>
              )}

              {/* Previous Employers */}
              {(selectedCounselor as any).previousEmployers && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4" />
                    Previous Employers/Experience
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{(selectedCounselor as any).previousEmployers}</p>
                  </div>
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
                    <p className="text-sm leading-relaxed">{(selectedCounselor as any).credentials || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Professional Bio
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed">{(selectedCounselor as any).bio || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              {(selectedCounselor as any).motivation && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4" />
                    Motivation to Join RCR
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{(selectedCounselor as any).motivation}</p>
                  </div>
                </div>
              )}

              {/* References */}
              {(selectedCounselor as any).references && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Professional References
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{(selectedCounselor as any).references}</p>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(selectedCounselor as any).emergencyContact && (
                <div className="space-y-3 border-t pt-6">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    Emergency Contact
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm">{(selectedCounselor as any).emergencyContact}</p>
                  </div>
                </div>
              )}

              {/* Document Uploads */}
              <div className="space-y-4 border-t pt-6">
                <h5 className="font-medium flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  Uploaded Documents
                </h5>
                {(selectedCounselor as any).resumeFile || (selectedCounselor as any).licenseFile || (selectedCounselor as any).certificationsFile ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(selectedCounselor as any).resumeFile ? (
                      <a 
                        href={(selectedCounselor as any).resumeFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <FileText className="h-5 w-5 text-primary group-hover:text-primary/80" />
                          <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Resume/CV</p>
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">View PDF</p>
                      </a>
                    ) : (
                      <div className="p-3 border border-dashed rounded-lg bg-muted/20">
                        <FileText className="h-5 w-5 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">Resume/CV</p>
                        <p className="text-xs text-muted-foreground">Not uploaded</p>
                      </div>
                    )}
                    {(selectedCounselor as any).licenseFile ? (
                      <a 
                        href={(selectedCounselor as any).licenseFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Shield className="h-5 w-5 text-primary group-hover:text-primary/80" />
                          <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">License</p>
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">View PDF</p>
                      </a>
                    ) : (
                      <div className="p-3 border border-dashed rounded-lg bg-muted/20">
                        <Shield className="h-5 w-5 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">License</p>
                        <p className="text-xs text-muted-foreground">Not uploaded</p>
                      </div>
                    )}
                    {(selectedCounselor as any).certificationsFile ? (
                      <a 
                        href={(selectedCounselor as any).certificationsFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Award className="h-5 w-5 text-primary group-hover:text-primary/80" />
                          <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Certifications</p>
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">View PDF</p>
                      </a>
                    ) : (
                      <div className="p-3 border border-dashed rounded-lg bg-muted/20">
                        <Award className="h-5 w-5 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">Certifications</p>
                        <p className="text-xs text-muted-foreground">Not uploaded</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed rounded-lg bg-muted/20 text-center">
                    <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCounselor && handleReject(selectedCounselor.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
