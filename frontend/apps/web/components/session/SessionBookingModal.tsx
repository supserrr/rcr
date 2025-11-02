'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
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
  Calendar,
  Clock,
  Video,
  Mic,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Counselor } from '../../lib/types';

/**
 * Props for the SessionBookingModal component.
 */
interface SessionBookingModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The counselor to book a session with */
  counselor: Counselor;
  /** Callback when booking is confirmed */
  onBookingConfirmed?: (bookingDetails: any) => void;
}

/**
 * Modal for booking counseling sessions.
 * 
 * Allows patients to select date, time, duration, and session type (video/audio)
 * when booking a session with a counselor.
 */
export function SessionBookingModal({
  isOpen,
  onClose,
  counselor,
  onBookingConfirmed
}: SessionBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [sessionType, setSessionType] = useState<'video' | 'audio'>('video');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const handleConfirmBooking = () => {
    const bookingDetails = {
      counselorId: counselor.id,
      date: selectedDate,
      time: selectedTime,
      duration: parseInt(duration),
      sessionType,
      notes,
    };
    
    onBookingConfirmed?.(bookingDetails);
    
    // Reset and close
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setDuration('60');
    setSessionType('video');
    setNotes('');
    onClose();
  };

  const isStep1Valid = selectedDate && selectedTime && duration;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book a Session</DialogTitle>
          <DialogDescription>
            Schedule a counseling session with {counselor.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Date & Time</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Session Type</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Confirm</span>
          </div>
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Session Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Session Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Choose Session Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSessionType('video')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    sessionType === 'video'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      sessionType === 'video' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Video className={`h-6 w-6 ${sessionType === 'video' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-1">Video Session</p>
                      <p className="text-xs text-muted-foreground">
                        Face-to-face video call
                      </p>
                    </div>
                    {sessionType === 'video' && (
                      <Badge variant="default" className="mt-2">Selected</Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSessionType('audio')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    sessionType === 'audio'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      sessionType === 'audio' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Mic className={`h-6 w-6 ${sessionType === 'audio' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-1">Audio Only</p>
                      <p className="text-xs text-muted-foreground">
                        Voice call only
                      </p>
                    </div>
                    {sessionType === 'audio' && (
                      <Badge variant="default" className="mt-2">Selected</Badge>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  {sessionType === 'video' ? (
                    <p>Video sessions provide better connection but require stable internet. You can switch to audio during the call if needed.</p>
                  ) : (
                    <p>Audio-only sessions use less bandwidth and are great for areas with limited connectivity.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes (Optional)</label>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any specific topics or concerns you'd like to discuss?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Counselor</span>
                  <span className="font-medium">{counselor.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Session Type</span>
                  <Badge variant="outline" className="capitalize">
                    {sessionType === 'video' ? (
                      <><Video className="h-3 w-3 mr-1" /> Video</>
                    ) : (
                      <><Mic className="h-3 w-3 mr-1" /> Audio Only</>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {notes && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Your Notes</p>
                <p className="text-sm text-muted-foreground">{notes}</p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Session Confirmation
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    You'll receive a confirmation email with the meeting link. You can join the session
                    from your sessions page 5 minutes before the scheduled time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleConfirmBooking}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

