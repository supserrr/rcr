'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Input } from './input';
import { Label } from './label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Calendar, Clock, Video, MessageCircle, Phone, CheckCircle, Users } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: dummyCounselors will be passed as props from the parent component

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: QuickBookingData) => void;
  counselors?: Array<{
    id: string;
    name: string;
    avatar?: string;
    specialty: string;
    availability: string;
  }>;
}

interface QuickBookingData {
  counselorId: string;
  sessionType: 'video' | 'audio' | 'chat';
  date: string;
  time: string;
  duration: number;
}

export function QuickBookingModal({ 
  isOpen, 
  onClose, 
  onConfirmBooking,
  counselors = []
}: QuickBookingModalProps) {
  const [bookingData, setBookingData] = useState<QuickBookingData>({
    counselorId: '',
    sessionType: 'video',
    date: '',
    time: '',
    duration: 60
  });
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sessionTypes = [
    { value: 'video', label: 'Video Call', icon: Video, description: 'Face-to-face session' },
    { value: 'audio', label: 'Audio Call', icon: Phone, description: 'Voice-only session' },
    { value: 'chat', label: 'Chat Session', icon: MessageCircle, description: 'Text messaging' }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' }
  ];

  const availableCounselors = counselors.filter(c => c.availability === 'available');

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsBooking(false);
    setIsSuccess(true);
    
    // Call the parent callback
    onConfirmBooking(bookingData);
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setBookingData({
        counselorId: '',
        sessionType: 'video',
        date: '',
        time: '',
        duration: 60
      });
    }, 2500);
  };

  const selectedCounselor = availableCounselors.find(c => c.id === bookingData.counselorId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Quick Book Session
            </DialogTitle>
          </DialogHeader>

          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Session Booked!</h3>
              <p className="text-muted-foreground">
                You'll receive a confirmation email with session details.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Counselor Selection */}
              <div className="space-y-2">
                <Label htmlFor="counselor">Choose Counselor</Label>
                <Select value={bookingData.counselorId} onValueChange={(value) => setBookingData({ ...bookingData, counselorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a counselor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCounselors.map((counselor) => (
                      <SelectItem key={counselor.id} value={counselor.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={counselor.avatar} alt={counselor.name} />
                            <AvatarFallback className="text-xs">
                              {counselor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{counselor.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {counselor.specialty}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Counselor Info */}
              {selectedCounselor && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedCounselor.avatar} alt={selectedCounselor.name} />
                      <AvatarFallback>
                        {selectedCounselor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{selectedCounselor.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedCounselor.specialty}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Session Type */}
              <div className="space-y-2">
                <Label>Session Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {sessionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all text-center",
                          bookingData.sessionType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setBookingData({ ...bookingData, sessionType: type.value as any })}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs font-medium">{type.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={bookingData.time} onValueChange={(value) => setBookingData({ ...bookingData, time: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={bookingData.duration.toString()} onValueChange={(value) => setBookingData({ ...bookingData, duration: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value.toString()}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Summary */}
              {bookingData.counselorId && bookingData.date && bookingData.time && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Session Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Counselor:</strong> {selectedCounselor?.name}</p>
                    <p><strong>Type:</strong> {sessionTypes.find(t => t.value === bookingData.sessionType)?.label}</p>
                    <p><strong>Date:</strong> {bookingData.date}</p>
                    <p><strong>Time:</strong> {bookingData.time}</p>
                    <p><strong>Duration:</strong> {durations.find(d => d.value === bookingData.duration)?.label}</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {!isSuccess && (
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isBooking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={
                  isBooking ||
                  !bookingData.counselorId ||
                  !bookingData.date ||
                  !bookingData.time
                }
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  'Book Session'
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
