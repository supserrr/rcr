'use client';

import React, { useState } from 'react';
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
import { dummyPendingCounselors } from '../../../../lib/dummy-data';
import { Counselor } from '../../../../lib/types';

export default function AdminApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<&apos;all&apos; | string>('all');
  const [selectedExperience, setSelectedExperience] = useState<&apos;all&apos; | string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const specialties = ['all', 'Trauma Therapy', 'Family Counseling', 'Child and Adolescent Psychology', 'Oncology Psychology', 'Grief Counseling'];

  const filteredCounselors = dummyPendingCounselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || counselor.specialty === selectedSpecialty;
    const matchesExperience = selectedExperience === &apos;all&apos; || 
      (selectedExperience === &apos;0-2&apos; && counselor.experience <= 2) ||
      (selectedExperience === &apos;3-5&apos; && counselor.experience >= 3 && counselor.experience <= 5) ||
      (selectedExperience === &apos;6-10&apos; && counselor.experience >= 6 && counselor.experience <= 10) ||
      (selectedExperience === &apos;10+&apos; && counselor.experience > 10);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const handleViewDetails = (counselor: Counselor) => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Approving counselor:', counselorId);
      alert('Counselor approved successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error approving counselor:', error);
      alert('Failed to approve counselor. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (counselorId: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Rejecting counselor:', counselorId);
      alert('Counselor application rejected.');
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting counselor:', error);
      alert('Failed to reject counselor. Please try again.');
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
    <div className=&quot;space-y-6&quot;>
      <AnimatedPageHeader
        title=&quot;Counselor Approvals&quot;
        description=&quot;Review and approve pending counselor applications&quot;
      />

      {/* Stats Cards */}
      <div className=&quot;grid gap-4 md:grid-cols-4&quot;>
        <AnimatedCard delay={0.1}>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Pending Applications</CardTitle>
            <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {dummyPendingCounselors.length}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Awaiting review
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>This Week</CardTitle>
            <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {dummyPendingCounselors.filter(c => 
                new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              New applications
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>High Experience</CardTitle>
            <Award className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {dummyPendingCounselors.filter(c => c.experience >= 5).length}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              5+ years experience
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Multi-lingual</CardTitle>
            <User className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {dummyPendingCounselors.filter(c => c.languages && c.languages.length >= 3).length}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              3+ languages
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4&quot; />
          <Input
            placeholder=&quot;Search by name, email, or specialty...&quot;
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=&quot;pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10&quot;
          />
        </div>
        
        <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value)}>
          <SelectTrigger className=&quot;w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10&quot;>
            <SelectValue placeholder=&quot;Specialty&quot; />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty === &apos;all&apos; ? &apos;All Specialties&apos; : specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExperience} onValueChange={(value) => setSelectedExperience(value)}>
          <SelectTrigger className=&quot;w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10&quot;>
            <SelectValue placeholder=&quot;Experience&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Experience</SelectItem>
            <SelectItem value=&quot;0-2&quot;>0-2 years</SelectItem>
            <SelectItem value=&quot;3-5&quot;>3-5 years</SelectItem>
            <SelectItem value=&quot;6-10&quot;>6-10 years</SelectItem>
            <SelectItem value=&quot;10+&quot;>10+ years</SelectItem>
          </SelectContent>
        </Select>

        <Button variant=&quot;outline&quot;>
          <Filter className=&quot;h-4 w-4 mr-2&quot; />
          Filter
        </Button>
      </div>

      {/* Applications Table */}
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
                <TableHead className=&quot;text-right&quot;>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCounselors.map((counselor) => (
              <TableRow key={counselor.id}>
                <TableCell>
                  <div className=&quot;flex items-center space-x-3&quot;>
                    <Avatar className=&quot;h-10 w-10&quot;>
                      <AvatarImage src={counselor.avatar} alt={counselor.name} />
                      <AvatarFallback>
                        {counselor.name.split(&apos; &apos;).map((n: string) => n[0]).join(&apos;')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className=&quot;font-medium&quot;>{counselor.name}</p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>{counselor.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant=&quot;outline&quot; className=&quot;border-primary/20&quot;>
                    {counselor.specialty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getExperienceColor(counselor.experience)}>
                    {counselor.experience} years
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className=&quot;flex flex-wrap gap-1&quot;>
                    {counselor.languages?.slice(0, 2).map((lang: string, index: number) => (
                      <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
                        {lang}
                      </Badge>
                    )) ?? null}
                    {counselor.languages && counselor.languages.length > 2 && (
                      <Badge variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
                        +{counselor.languages.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className=&quot;flex items-center gap-1 text-sm text-muted-foreground&quot;>
                    <MapPin className=&quot;h-3 w-3&quot; />
                    <span>{counselor.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className=&quot;text-sm&quot;>
                    {counselor.createdAt.toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className=&quot;text-right&quot;>
                  <div className=&quot;flex items-center justify-end space-x-2&quot;>
                    <Button
                      size=&quot;sm&quot;
                      variant=&quot;outline&quot;
                      onClick={() => handleViewDetails(counselor)}
                    >
                      <Eye className=&quot;h-4 w-4 mr-2&quot; />
                      Review
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>

      {/* Results Summary */}
      <div className=&quot;flex items-center justify-between&quot;>
        <p className=&quot;text-sm text-muted-foreground&quot;>
          Showing {filteredCounselors.length} of {dummyPendingCounselors.length} applications
        </p>
        <div className=&quot;flex items-center space-x-2&quot;>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
            Export CSV
          </Button>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Counselor Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className=&quot;max-w-4xl max-h-[90vh] overflow-y-auto&quot;>
          <DialogHeader>
            <DialogTitle className=&quot;flex items-center gap-3&quot;>
              <div className=&quot;p-2 rounded-lg bg-primary/10&quot;>
                <User className=&quot;h-5 w-5 text-primary&quot; />
              </div>
              <div>
                <span className=&quot;text-muted-foreground&quot;>Counselor Application</span>
                <h3 className=&quot;text-lg font-semibold&quot;>{selectedCounselor?.name}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCounselor && (
                <span>
                  {selectedCounselor.specialty} • {selectedCounselor.experience} years experience • {selectedCounselor.languages?.length ?? 0} languages
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCounselor && (
            <div className=&quot;space-y-6 mt-6&quot;>
              {/* Basic Information */}
              <div className=&quot;grid gap-6 md:grid-cols-2&quot;>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;flex items-start gap-4&quot;>
                    <Avatar className=&quot;h-16 w-16 flex-shrink-0&quot;>
                      <AvatarImage src={selectedCounselor.avatar} alt={selectedCounselor.name} />
                      <AvatarFallback className=&quot;text-lg&quot;>
                        {selectedCounselor.name.split(&apos; &apos;).map(n => n[0]).join(&apos;')}
                      </AvatarFallback>
                    </Avatar>
                    <div className=&quot;min-w-0 flex-1 space-y-2&quot;>
                      <h4 className=&quot;text-lg font-semibold&quot;>{selectedCounselor.name}</h4>
                      <div className=&quot;space-y-1&quot;>
                        <div className=&quot;flex items-center gap-1 text-sm text-muted-foreground&quot;>
                          <Mail className=&quot;h-3 w-3 flex-shrink-0&quot; />
                          <span className=&quot;break-all&quot;>{selectedCounselor.email}</span>
                        </div>
                        <div className=&quot;flex items-center gap-1 text-sm text-muted-foreground&quot;>
                          <Phone className=&quot;h-3 w-3 flex-shrink-0&quot; />
                          <span>{selectedCounselor.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className=&quot;space-y-3&quot;>
                    <div className=&quot;flex items-center gap-2&quot;>
                      <MapPin className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                      <span className=&quot;text-sm&quot;>{selectedCounselor.location}</span>
                    </div>
                    <div className=&quot;flex items-center gap-2&quot;>
                      <Award className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                      <span className=&quot;text-sm&quot;>{selectedCounselor.specialty}</span>
                    </div>
                    <div className=&quot;flex items-center gap-2&quot;>
                      <Clock className=&quot;h-4 w-4 text-muted-foreground flex-shrink-0&quot; />
                      <span className=&quot;text-sm&quot;>{selectedCounselor.experience} years experience</span>
                    </div>
                  </div>
                </div>

                <div className=&quot;space-y-4&quot;>
                  <div>
                    <h5 className=&quot;font-medium mb-3 text-sm&quot;>Languages</h5>
                    <div className=&quot;flex flex-wrap gap-2&quot;>
                      {selectedCounselor.languages?.map((language, index) => (
                        <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
                          {language}
                        </Badge>
                      )) ?? null}
                    </div>
                  </div>

                  <div>
                    <h5 className=&quot;font-medium mb-3 text-sm&quot;>Availability</h5>
                    <Badge className=&quot;bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400&quot;>
                      {selectedCounselor.availability}
                    </Badge>
                  </div>

                  <div>
                    <h5 className=&quot;font-medium mb-3 text-sm&quot;>Application Date</h5>
                    <div className=&quot;flex items-center gap-1 text-sm text-muted-foreground&quot;>
                      <Calendar className=&quot;h-3 w-3 flex-shrink-0&quot; />
                      <span>{selectedCounselor.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional License Information */}
              {(selectedCounselor as any).licenseNumber && (
                <div className=&quot;space-y-6 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <Shield className=&quot;h-4 w-4&quot; />
                    Professional License
                  </h5>
                  <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                    <div>
                      <p className=&quot;text-xs text-muted-foreground mb-1&quot;>License Number</p>
                      <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).licenseNumber || &apos;Not provided&apos;}</p>
                    </div>
                    <div>
                      <p className=&quot;text-xs text-muted-foreground mb-1&quot;>License Expiry</p>
                      <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).licenseExpiry || &apos;Not provided&apos;}</p>
                    </div>
                    <div>
                      <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Issuing Authority</p>
                      <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).issuingAuthority || &apos;Not provided&apos;}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Information */}
              {((selectedCounselor as any).highestDegree || (selectedCounselor as any).university) && (
                <div className=&quot;space-y-6 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <GraduationCap className=&quot;h-4 w-4&quot; />
                    Education & Certifications
                  </h5>
                  <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                    {(selectedCounselor as any).highestDegree && (
                      <div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Highest Degree</p>
                        <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).highestDegree}</p>
                      </div>
                    )}
                    {(selectedCounselor as any).university && (
                      <div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>University/Institution</p>
                        <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).university}</p>
                      </div>
                    )}
                    {(selectedCounselor as any).graduationYear && (
                      <div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Graduation Year</p>
                        <p className=&quot;text-sm font-medium&quot;>{(selectedCounselor as any).graduationYear}</p>
                      </div>
                    )}
                  </div>
                  {(selectedCounselor as any).additionalCertifications && (selectedCounselor as any).additionalCertifications.length > 0 && (
                    <div className=&quot;mt-4&quot;>
                      <p className=&quot;text-xs text-muted-foreground mb-2&quot;>Additional Certifications</p>
                      <div className=&quot;flex flex-wrap gap-2&quot;>
                        {(selectedCounselor as any).additionalCertifications.map((cert: string, index: number) => (
                          <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
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
                <div className=&quot;space-y-4 border-t pt-6&quot;>
                  {(selectedCounselor as any).specializations && (selectedCounselor as any).specializations.length > 0 && (
                    <div>
                      <h5 className=&quot;font-medium mb-3 text-sm&quot;>Specializations</h5>
                      <div className=&quot;flex flex-wrap gap-2&quot;>
                        {(selectedCounselor as any).specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedCounselor as any).consultationTypes && (selectedCounselor as any).consultationTypes.length > 0 && (
                    <div>
                      <h5 className=&quot;font-medium mb-3 text-sm&quot;>Consultation Types</h5>
                      <div className=&quot;flex flex-wrap gap-2&quot;>
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
                            <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs flex items-center gap-1&quot;>
                              <Icon className=&quot;h-3 w-3&quot; />
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
                <div className=&quot;space-y-3 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <Briefcase className=&quot;h-4 w-4&quot; />
                    Previous Employers/Experience
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm leading-relaxed whitespace-pre-wrap&quot;>{(selectedCounselor as any).previousEmployers}</p>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              <div className=&quot;space-y-6 border-t pt-6&quot;>
                <div className=&quot;space-y-3&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <GraduationCap className=&quot;h-4 w-4&quot; />
                    Credentials
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm leading-relaxed&quot;>{selectedCounselor.credentials || &apos;Not provided&apos;}</p>
                  </div>
                </div>

                <div className=&quot;space-y-3&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <FileText className=&quot;h-4 w-4&quot; />
                    Professional Bio
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm leading-relaxed&quot;>{selectedCounselor.bio || &apos;Not provided&apos;}</p>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              {(selectedCounselor as any).motivation && (
                <div className=&quot;space-y-3 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <Heart className=&quot;h-4 w-4&quot; />
                    Motivation to Join RCR
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm leading-relaxed whitespace-pre-wrap&quot;>{(selectedCounselor as any).motivation}</p>
                  </div>
                </div>
              )}

              {/* References */}
              {(selectedCounselor as any).references && (
                <div className=&quot;space-y-3 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <User className=&quot;h-4 w-4&quot; />
                    Professional References
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm leading-relaxed whitespace-pre-wrap&quot;>{(selectedCounselor as any).references}</p>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(selectedCounselor as any).emergencyContact && (
                <div className=&quot;space-y-3 border-t pt-6&quot;>
                  <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                    <Phone className=&quot;h-4 w-4&quot; />
                    Emergency Contact
                  </h5>
                  <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
                    <p className=&quot;text-sm&quot;>{(selectedCounselor as any).emergencyContact}</p>
                  </div>
                </div>
              )}

              {/* Document Uploads */}
              <div className=&quot;space-y-4 border-t pt-6&quot;>
                <h5 className=&quot;font-medium flex items-center gap-2 text-sm&quot;>
                  <Download className=&quot;h-4 w-4&quot; />
                  Uploaded Documents
                </h5>
                {(selectedCounselor as any).resumeFile || (selectedCounselor as any).licenseFile || (selectedCounselor as any).certificationsFile ? (
                  <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                    {(selectedCounselor as any).resumeFile ? (
                      <a 
                        href={(selectedCounselor as any).resumeFile}
                        target=&quot;_blank&quot;
                        rel=&quot;noopener noreferrer&quot;
                        className=&quot;block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group&quot;
                      >
                        <div className=&quot;flex items-center justify-between mb-2&quot;>
                          <FileText className=&quot;h-5 w-5 text-primary group-hover:text-primary/80&quot; />
                          <Download className=&quot;h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity&quot; />
                        </div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Resume/CV</p>
                        <p className=&quot;text-sm font-medium truncate group-hover:text-primary transition-colors&quot;>View PDF</p>
                      </a>
                    ) : (
                      <div className=&quot;p-3 border border-dashed rounded-lg bg-muted/20&quot;>
                        <FileText className=&quot;h-5 w-5 mb-2 text-muted-foreground&quot; />
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Resume/CV</p>
                        <p className=&quot;text-xs text-muted-foreground&quot;>Not uploaded</p>
                      </div>
                    )}
                    {(selectedCounselor as any).licenseFile ? (
                      <a 
                        href={(selectedCounselor as any).licenseFile}
                        target=&quot;_blank&quot;
                        rel=&quot;noopener noreferrer&quot;
                        className=&quot;block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group&quot;
                      >
                        <div className=&quot;flex items-center justify-between mb-2&quot;>
                          <Shield className=&quot;h-5 w-5 text-primary group-hover:text-primary/80&quot; />
                          <Download className=&quot;h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity&quot; />
                        </div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>License</p>
                        <p className=&quot;text-sm font-medium truncate group-hover:text-primary transition-colors&quot;>View PDF</p>
                      </a>
                    ) : (
                      <div className=&quot;p-3 border border-dashed rounded-lg bg-muted/20&quot;>
                        <Shield className=&quot;h-5 w-5 mb-2 text-muted-foreground&quot; />
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>License</p>
                        <p className=&quot;text-xs text-muted-foreground&quot;>Not uploaded</p>
                      </div>
                    )}
                    {(selectedCounselor as any).certificationsFile ? (
                      <a 
                        href={(selectedCounselor as any).certificationsFile}
                        target=&quot;_blank&quot;
                        rel=&quot;noopener noreferrer&quot;
                        className=&quot;block p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group&quot;
                      >
                        <div className=&quot;flex items-center justify-between mb-2&quot;>
                          <Award className=&quot;h-5 w-5 text-primary group-hover:text-primary/80&quot; />
                          <Download className=&quot;h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity&quot; />
                        </div>
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Certifications</p>
                        <p className=&quot;text-sm font-medium truncate group-hover:text-primary transition-colors&quot;>View PDF</p>
                      </a>
                    ) : (
                      <div className=&quot;p-3 border border-dashed rounded-lg bg-muted/20&quot;>
                        <Award className=&quot;h-5 w-5 mb-2 text-muted-foreground&quot; />
                        <p className=&quot;text-xs text-muted-foreground mb-1&quot;>Certifications</p>
                        <p className=&quot;text-xs text-muted-foreground&quot;>Not uploaded</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className=&quot;p-6 border border-dashed rounded-lg bg-muted/20 text-center&quot;>
                    <Download className=&quot;h-8 w-8 text-muted-foreground mx-auto mb-2&quot; />
                    <p className=&quot;text-sm text-muted-foreground&quot;>No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className=&quot;gap-2&quot;>
            <Button variant=&quot;outline&quot; onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant=&quot;destructive&quot;
              onClick={() => selectedCounselor && handleReject(selectedCounselor.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className=&quot;animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2&quot; />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className=&quot;h-4 w-4 mr-2&quot; />
                  Reject
                </>
              )}
            </Button>
            <Button
              onClick={() => selectedCounselor && handleApprove(selectedCounselor.id)}
              disabled={isProcessing}
              className=&quot;bg-green-600 hover:bg-green-700&quot;
            >
              {isProcessing ? (
                <>
                  <div className=&quot;animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2&quot; />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className=&quot;h-4 w-4 mr-2&quot; />
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
