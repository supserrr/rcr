'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/dashboard/shared/PageHeader';
import { ProfileCard } from '../../../../components/dashboard/shared/ProfileCard';
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

export default function PatientCounselorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

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
    console.log('Book session with counselor:', counselorId);
    // Implement booking logic
  };

  const handleViewProfile = (counselorId: string) => {
    console.log('View profile for counselor:', counselorId);
    // Implement profile view logic
  };

  const handleSendMessage = (counselorId: string) => {
    console.log('Send message to counselor:', counselorId);
    // Implement messaging logic
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find a Counselor"
        description="Connect with experienced counselors who can support you on your journey"
        action={{
          label: "Book Session",
          onClick: () => console.log('Quick book session'),
          variant: "default"
        }}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search counselors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
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

        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
          <SelectTrigger className="w-full sm:w-48">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCounselors.map((counselor) => (
            <ProfileCard
              key={counselor.id}
              id={counselor.id}
              name={counselor.name}
              title={`${counselor.experience} years experience`}
              avatar={counselor.avatar}
              rating={counselor.rating}
              specialty={counselor.specialty}
              location="Kigali, Rwanda"
              availability={counselor.availability}
              bio={counselor.bio}
              languages={counselor.languages}
              experience={counselor.experience}
              onBookSession={handleBookSession}
              onViewProfile={handleViewProfile}
              onSendMessage={handleSendMessage}
            />
          ))}
        </div>
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
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Featured Counselors</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {dummyCounselors
            .filter(counselor => counselor.rating >= 4.8)
            .map((counselor) => (
              <div key={counselor.id} className="relative">
                <ProfileCard
                  id={counselor.id}
                  name={counselor.name}
                  title={`${counselor.experience} years experience`}
                  avatar={counselor.avatar}
                  rating={counselor.rating}
                  specialty={counselor.specialty}
                  location="Kigali, Rwanda"
                  availability={counselor.availability}
                  bio={counselor.bio}
                  languages={counselor.languages}
                  experience={counselor.experience}
                  onBookSession={handleBookSession}
                  onViewProfile={handleViewProfile}
                  onSendMessage={handleSendMessage}
                />
                <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                  Featured
                </Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
