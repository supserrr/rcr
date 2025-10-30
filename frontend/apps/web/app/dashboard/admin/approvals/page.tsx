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
  GraduationCap
} from 'lucide-react';
import { dummyPendingCounselors } from '../../../../lib/dummy-data';
import { Counselor } from '../../../../lib/types';

export default function AdminApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<'all' | string>('all');
  const [selectedExperience, setSelectedExperience] = useState<'all' | string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const specialties = ['all', 'Trauma Therapy', 'Family Counseling', 'Child and Adolescent Psychology', 'Oncology Psychology', 'Grief Counseling'];

  const filteredCounselors = dummyPendingCounselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || counselor.specialty === selectedSpecialty;
    const matchesExperience = selectedExperience === 'all' || 
      (selectedExperience === '0-2' && counselor.experience <= 2) ||
      (selectedExperience === '3-5' && counselor.experience >= 3 && counselor.experience <= 5) ||
      (selectedExperience === '6-10' && counselor.experience >= 6 && counselor.experience <= 10) ||
      (selectedExperience === '10+' && counselor.experience > 10);
    
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
              {dummyPendingCounselors.length}
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
              {dummyPendingCounselors.filter(c => 
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
              {dummyPendingCounselors.filter(c => c.experience >= 5).length}
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
              {dummyPendingCounselors.filter(c => c.languages.length >= 3).length}
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value)}>
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-48">
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
      <div className="bg-card border rounded-lg">
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
            {filteredCounselors.map((counselor) => (
              <TableRow key={counselor.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={counselor.avatar} alt={counselor.name} />
                      <AvatarFallback>
                        {counselor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{counselor.name}</p>
                      <p className="text-sm text-muted-foreground">{counselor.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-primary/20">
                    {counselor.specialty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getExperienceColor(counselor.experience)}>
                    {counselor.experience} years
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {counselor.languages.slice(0, 2).map((lang, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                    {counselor.languages.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{counselor.languages.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{counselor.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {counselor.createdAt.toLocaleDateString()}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCounselors.length} of {dummyPendingCounselors.length} applications
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
                <h3 className="text-lg font-semibold">{selectedCounselor?.name}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCounselor && (
                <span>
                  {selectedCounselor.specialty} • {selectedCounselor.experience} years experience • {selectedCounselor.languages.length} languages
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
                      <AvatarImage src={selectedCounselor.avatar} alt={selectedCounselor.name} />
                      <AvatarFallback className="text-lg">
                        {selectedCounselor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h4 className="text-lg font-semibold">{selectedCounselor.name}</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">{selectedCounselor.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{selectedCounselor.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{selectedCounselor.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{selectedCounselor.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{selectedCounselor.experience} years experience</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-3 text-sm">Languages</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCounselor.languages.map((language, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3 text-sm">Availability</h5>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {selectedCounselor.availability}
                    </Badge>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3 text-sm">Application Date</h5>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>{selectedCounselor.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    Credentials
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed">{selectedCounselor.credentials}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Professional Bio
                  </h5>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm leading-relaxed">{selectedCounselor.bio}</p>
                  </div>
                </div>
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
