'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  Search,
  Star,
  Clock,
  CheckCircle,
  Video,
  Mic
} from 'lucide-react';
import { Counselor } from '../../lib/types';

/**
 * Props for the CounselorSelectionModal component.
 */
interface CounselorSelectionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** List of available counselors */
  counselors: Counselor[];
  /** Callback when a counselor is selected */
  onSelectCounselor: (counselor: Counselor) => void;
}

/**
 * Modal for selecting a counselor before booking a session.
 * 
 * Displays a filterable list of available counselors with their
 * specialties, experience, and availability status.
 */
export function CounselorSelectionModal({
  isOpen,
  onClose,
  counselors,
  onSelectCounselor
}: CounselorSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = ['all', ...Array.from(new Set(counselors.map(c => c.specialty)))];

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || counselor.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const handleSelectCounselor = (counselor: Counselor) => {
    onSelectCounselor(counselor);
    onClose();
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select a Counselor</DialogTitle>
          <DialogDescription>
            Choose a counselor to book your session with
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
            />
          </div>

          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Counselors List */}
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
          {filteredCounselors.length > 0 ? (
            filteredCounselors.map((counselor) => (
              <div
                key={counselor.id}
                className="border rounded-lg p-4 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 cursor-pointer group"
                onClick={() => handleSelectCounselor(counselor)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={counselor.avatar} alt={counselor.name} />
                    <AvatarFallback>
                      {counselor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{counselor.name}</h4>
                        <p className="text-sm text-muted-foreground">{counselor.specialty}</p>
                      </div>
                      <Badge className={getAvailabilityColor(counselor.availability)}>
                        {counselor.availability}
                      </Badge>
                    </div>

                    {counselor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {counselor.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{counselor.experience} years exp.</span>
                      </div>
                      {counselor.languages && (
                        <div className="flex items-center gap-1">
                          <span>Languages: {counselor.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCounselor(counselor);
                        }}
                      >
                        Select Counselor
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No counselors found matching your criteria</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

