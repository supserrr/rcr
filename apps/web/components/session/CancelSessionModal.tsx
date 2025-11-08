'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { Calendar, Clock, Video, Mic, AlertTriangle, User, MessageSquare, XCircle } from 'lucide-react';
import { Session } from '../../lib/types';

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  patientName?: string;
  patientAvatar?: string;
  userRole?: 'patient' | 'counselor';
  onCancel: (sessionId: string, reason: string, notes?: string) => void;
}

export function CancelSessionModal({ 
  isOpen, 
  onClose, 
  session, 
  patientName,
  patientAvatar,
  userRole = 'patient',
  onCancel 
}: CancelSessionModalProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationNotes, setCancellationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cancellationReasons = [
    { value: 'emergency', label: 'Emergency/Urgent matter' },
    { value: 'illness', label: 'Illness/Health issue' },
    { value: 'schedule_conflict', label: 'Schedule conflict' },
    { value: 'technical_issue', label: 'Technical difficulties' },
    { value: 'personal_reason', label: 'Personal reason' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!session || !cancellationReason) {
      return;
    }

    setIsLoading(true);
    try {
      await onCancel(session.id, cancellationReason, cancellationNotes);
      onClose();
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCancellationReason('');
    setCancellationNotes('');
    onClose();
  };

  if (!session) return null;

  const isCounselor = userRole === 'counselor';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Cancel Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information (for counselors) */}
          {isCounselor && (
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
          )}

          {/* Session Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Session Details</h4>
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

          {/* Cancellation Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Cancellation Details</h4>
            
            {/* Reason Selection */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Cancellation *</Label>
              <Select value={cancellationReason} onValueChange={setCancellationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder={isCounselor 
                  ? "Add any additional details about the cancellation that the patient should know..."
                  : "Add any additional details about why you need to cancel..."
                }
                value={cancellationNotes}
                onChange={(e) => setCancellationNotes(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                {isCounselor 
                  ? "This note will be visible to the patient and included in session records."
                  : "This note will be shared with your counselor."
                }
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-foreground">
                <p className="font-medium">Important Notice</p>
                <p className="text-muted-foreground">
                  {isCounselor 
                    ? "Cancelling this session will notify the patient immediately. Please ensure this is necessary and consider rescheduling instead."
                    : "Cancelling this session will notify your counselor immediately. You may be charged a cancellation fee depending on your agreement."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Keep Session
          </Button>
          <Button 
            variant="destructive"
            onClick={handleSubmit} 
            disabled={!cancellationReason || isLoading}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
