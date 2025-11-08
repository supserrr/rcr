'use client';

import React, { useState, useEffect } from 'react';
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

export default function PatientCounselorsPage() {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedCounselor, setSelectedCounselor] = useState<AdminUser | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfileCounselor, setSelectedProfileCounselor] = useState<AdminUser | null>(null);

  // Load counselors
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        setCounselors(response.users);
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
  const specialties = ['all', ...new Set(counselors.map(c => (c as any).specialty).filter(Boolean))];
  const availabilityOptions = ['all', 'available', 'busy', 'offline'];

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = (counselor.fullName || counselor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((counselor as any).specialty || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || (counselor as any).specialty === selectedSpecialty;
    // Note: Availability is not in AdminUser type, would need to be added to backend
    const matchesAvailability = selectedAvailability === 'all'; // Always true for now
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredCounselors.length > 0 ? (
        <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
          {filteredCounselors.map((counselor, index) => (
            <LandingStyleCounselorCard
              key={counselor.id}
              id={counselor.id}
              name={counselor.fullName || counselor.email || 'Counselor'}
              avatar={undefined}
              specialty={(counselor as any).specialty || 'General Counseling'}
              availability={(counselor as any).availability || 'available'}
              experience={(counselor as any).experience || 0}
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
      {counselors.filter(c => ((c as any).experience || 0) >= 5).length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-foreground" />
            <h2 className="text-xl font-semibold">Featured Counselors</h2>
          </div>
          
          <AnimatedGrid className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
            {counselors
              .filter(counselor => ((counselor as any).experience || 0) >= 5)
              .slice(0, 4)
              .map((counselor, index) => (
                <div key={counselor.id} className="relative">
                  <LandingStyleCounselorCard
                    id={counselor.id}
                    name={counselor.fullName || counselor.email || 'Counselor'}
                    avatar={undefined}
                    specialty={(counselor as any).specialty || 'General Counseling'}
                    availability={(counselor as any).availability || 'available'}
                    experience={(counselor as any).experience || 0}
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
          counselor={{
            id: selectedCounselor.id,
            name: selectedCounselor.fullName || selectedCounselor.email || 'Counselor',
            email: selectedCounselor.email,
            role: 'counselor' as const,
            avatar: undefined,
            createdAt: new Date(selectedCounselor.createdAt),
            specialty: (selectedCounselor as any).specialty || 'General Counseling',
            experience: (selectedCounselor as any).experience || 0,
            availability: (selectedCounselor as any).availability || 'available',
          }}
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
          user={{
            id: selectedProfileCounselor.id,
            name: selectedProfileCounselor.fullName || selectedProfileCounselor.email || 'Counselor',
            email: selectedProfileCounselor.email,
            role: 'counselor' as const,
            avatar: undefined,
            createdAt: new Date(selectedProfileCounselor.createdAt),
            specialty: (selectedProfileCounselor as any).specialty || 'General Counseling',
            experience: (selectedProfileCounselor as any).experience || 0,
            availability: (selectedProfileCounselor as any).availability || 'available',
          }}
          userType="counselor"
          currentUserRole="patient"
        />
      )}
    </div>
  );
}
