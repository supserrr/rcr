'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { Calendar, Clock, Video, Mic, AlertCircle, User, MessageSquare } from 'lucide-react';
import { Session } from '../../lib/types';

interface CounselorRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  patientName?: string;
  patientAvatar?: string;
  onReschedule: (sessionId: string, newDate: Date, newTime: string, newDuration: number, notes?: string) => void;
}

export function CounselorRescheduleModal({ 
  isOpen, 
  onClose, 
  session, 
  patientName,
  patientAvatar,
  onReschedule 
}: CounselorRescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
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

  // Generate date options (next 30 days)
  const dateOptions: { value: string; label: string }[] = [];
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0] || '';
    const displayDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateOptions.push({ value: dateString, label: displayDate });
  }

  const handleSubmit = async () => {
    if (!session || !selectedDate || !selectedTime) {
      return;
    }

    setIsLoading(true);
    try {
      const newDate = new Date(`${selectedDate}T${selectedTime}`);
      await onReschedule(session.id, newDate, selectedTime, parseInt(selectedDuration), rescheduleNotes);
      onClose();
    } catch (error) {
      console.error('Error rescheduling session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration('60');
    setRescheduleNotes('');
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reschedule Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Patient Information
            </h4>
            <div className="flex items-center gap-3">
              {patientAvatar ? (
                <img 
                  src={patientAvatar} 
                  alt={patientName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-medium">{patientName || 'Unknown Patient'}</p>
                <p className="text-sm text-muted-foreground">Session ID: {session.id}</p>
              </div>
            </div>
          </div>

          {/* Current Session Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Session Details</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{session.date.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{session.time}</span>
              </div>
              <div className="flex items-center gap-2">
                {session.type === 'audio' ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                <span className="capitalize">{session.type} Session</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{session.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* New Session Details */}
          <div className="space-y-4">
            <h4 className="font-medium">New Session Details</h4>
            
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
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
                <SelectTrigger>
                  <SelectValue placeholder="Choose duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reschedule Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Reschedule Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add a note about why you're rescheduling this session..."
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                This note will be visible to the patient and included in session records.
              </p>
            </div>
          </div>

          {/* Counselor Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800">
                <p className="font-medium">Counselor Notice</p>
                <p>Rescheduling will automatically notify the patient via email and in-app notification. Please ensure the new time works for both parties.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedDate || !selectedTime || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Rescheduling...' : 'Reschedule Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
