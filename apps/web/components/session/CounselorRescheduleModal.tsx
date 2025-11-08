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
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
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
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{patientName || 'Unknown Patient'}</p>
                <p className="text-sm text-muted-foreground">Session ID: {session.id}</p>
              </div>
            </div>
          </div>

          {/* Current Session Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
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
              <Label htmlFor="time">Select Time</Label>
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
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-foreground">
                <p className="font-medium">Counselor Notice</p>
                <p className="text-muted-foreground">Rescheduling will automatically notify the patient via email and in-app notification. Please ensure the new time works for both parties.</p>
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
