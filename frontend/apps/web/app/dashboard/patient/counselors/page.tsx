'use client';

import React, { useState } from 'react';
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
import { dummyCounselors } from '../../../../lib/dummy-data';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';

export default function PatientCounselorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfileCounselor, setSelectedProfileCounselor] = useState<any>(null);

  const specialties = ['all', 'Oncology Psychology', 'Grief Counseling', 'Family Therapy'];
  const availabilityOptions = ['all', 'available', 'busy', 'offline'];

  const filteredCounselors = dummyCounselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || counselor.specialty === selectedSpecialty;
    const matchesAvailability = selectedAvailability === 'all' || counselor.availability === selectedAvailability;
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const handleBookSession = (counselorId: string) => {
    const counselor = dummyCounselors.find(c => c.id === counselorId);
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
    const counselor = dummyCounselors.find(c => c.id === counselorId);
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
      {filteredCounselors.length > 0 ? (
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
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-foreground" />
          <h2 className="text-xl font-semibold">Featured Counselors</h2>
        </div>
        
        <AnimatedGrid className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
          {dummyCounselors
            .filter(counselor => counselor.experience >= 8)
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
