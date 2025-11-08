'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { Calendar, Clock, Video, Mic, User, MessageSquare, Plus } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  avatar?: string;
}

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  counselorId: string;
  counselorName: string;
  patients: Patient[];
  preselectedPatientId?: string;
  onSchedule: (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => void;
}

export function ScheduleSessionModal({ 
  isOpen, 
  onClose, 
  counselorId,
  counselorName,
  patients,
  preselectedPatientId,
  onSchedule 
}: ScheduleSessionModalProps) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedSessionType, setSelectedSessionType] = useState<'video' | 'audio'>('video');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate time slots (8 AM to 8 PM, every 30 minutes)
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeSlots.push({ value: timeString, label: displayTime });
    }
  }

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDate || !selectedTime) {
      return;
    }

    setIsLoading(true);
    try {
      const sessionData = {
        patientId: selectedPatient,
        date: new Date(`${selectedDate}T${selectedTime}`),
        time: selectedTime,
        duration: parseInt(selectedDuration),
        sessionType: selectedSessionType,
        notes: sessionNotes
      };
      
      await onSchedule(sessionData);
      onClose();
    } catch (error) {
      console.error('Error scheduling session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preselect patient when provided
  React.useEffect(() => {
    if (isOpen && preselectedPatientId) {
      setSelectedPatient(preselectedPatientId);
    }
  }, [isOpen, preselectedPatientId]);

  const handleClose = () => {
    setSelectedPatient('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration('60');
    setSelectedSessionType('video');
    setSessionNotes('');
    onClose();
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Schedule New Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Counselor Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Counselor Information
            </h4>
            <p className="text-sm text-foreground">{counselorName}</p>
          </div>

          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      {patient.avatar ? (
                        <img 
                          src={patient.avatar} 
                          alt={patient.name} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                      )}
                      <span>{patient.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Patient Info */}
          {selectedPatientData && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-3">
                {selectedPatientData.avatar ? (
                  <img 
                    src={selectedPatientData.avatar} 
                    alt={selectedPatientData.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{selectedPatientData.name}</p>
                  <p className="text-xs text-primary">Selected for session</p>
                </div>
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Session Details</h4>
            
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Select Date *</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Select Time *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:border-primary">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20">
                  {timeSlots.map((slot) => (
                    <SelectItem 
                      key={slot.value} 
                      value={slot.value}
                      className="focus:bg-primary focus:text-primary-foreground"
                    >
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:border-primary">
                  <SelectValue placeholder="Choose duration" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20">
                  <SelectItem value="30" className="focus:bg-primary focus:text-primary-foreground">30 minutes</SelectItem>
                  <SelectItem value="45" className="focus:bg-primary focus:text-primary-foreground">45 minutes</SelectItem>
                  <SelectItem value="60" className="focus:bg-primary focus:text-primary-foreground">60 minutes</SelectItem>
                  <SelectItem value="90" className="focus:bg-primary focus:text-primary-foreground">90 minutes</SelectItem>
                  <SelectItem value="120" className="focus:bg-primary focus:text-primary-foreground">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={selectedSessionType} onValueChange={(value: 'video' | 'audio') => setSelectedSessionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>Video Session</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span>Audio Only</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Session Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this session..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                These notes will be visible to both you and the patient.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPatient || !selectedDate || !selectedTime || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
