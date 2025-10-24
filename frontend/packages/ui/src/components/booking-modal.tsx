'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Calendar, Clock, Video, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookingModalProps {
  counselor: {
    id: string;
    name: string;
    avatar?: string;
    specialty?: string;
    availability?: 'available' | 'busy' | 'offline';
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: BookingData) => void;
}

interface BookingData {
  counselorId: string;
  sessionType: 'video' | 'audio' | 'chat';
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export function BookingModal({ 
  counselor, 
  isOpen, 
  onClose, 
  onConfirmBooking 
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    counselorId: counselor.id,
    sessionType: 'video',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sessionTypes = [
    { value: 'video', label: 'Video Call', icon: Video, description: 'Face-to-face video session' },
    { value: 'audio', label: 'Audio Call', icon: Phone, description: 'Voice-only session' },
    { value: 'chat', label: 'Chat Session', icon: MessageCircle, description: 'Text-based messaging' }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsBooking(false);
    setIsSuccess(true);
    
    // Call the parent callback
    onConfirmBooking(bookingData);
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      setStep(1);
      setIsSuccess(false);
      setBookingData({
        counselorId: counselor.id,
        sessionType: 'video',
        date: '',
        time: '',
        duration: 60,
        notes: ''
      });
    }, 3000);
  };

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-semibold">
              Book a Session
            </DialogTitle>
          </DialogHeader>

          {/* Counselor Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg mb-6">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={counselor.avatar} alt={counselor.name} />
                <AvatarFallback>
                  {counselor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getAvailabilityColor(counselor.availability)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{counselor.name}</h3>
              {counselor.specialty && (
                <Badge variant="secondary" className="text-xs">
                  {counselor.specialty}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground">
                {getAvailabilityText(counselor.availability)}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNumber 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step > stepNumber ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={cn(
                      "w-12 h-0.5 mx-2",
                      step > stepNumber ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Session Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Session Type</h3>
                  <div className="grid gap-4">
                    {sessionTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all",
                            bookingData.sessionType === type.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => setBookingData({ ...bookingData, sessionType: type.value as any })}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
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
                  <div className="mt-4">
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
                </div>
              </motion.div>
            )}

            {/* Step 3: Notes & Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Session Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Type:</strong> {sessionTypes.find(t => t.value === bookingData.sessionType)?.label}</p>
                        <p><strong>Date:</strong> {bookingData.date}</p>
                        <p><strong>Time:</strong> {bookingData.time}</p>
                        <p><strong>Duration:</strong> {durations.find(d => d.value === bookingData.duration)?.label}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific topics you'd like to discuss or questions you have..."
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Session Booked Successfully!</h3>
              <p className="text-muted-foreground">
                You'll receive a confirmation email shortly with session details.
              </p>
            </motion.div>
          )}

          {/* Footer Actions */}
          {!isSuccess && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : handleBack}
                disabled={isBooking}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={step === 3 ? handleConfirmBooking : handleNext}
                disabled={
                  isBooking ||
                  (step === 1 && !bookingData.sessionType) ||
                  (step === 2 && (!bookingData.date || !bookingData.time)) ||
                  (step === 3 && !bookingData.date)
                }
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Booking...
                  </>
                ) : step === 3 ? (
                  'Confirm Booking'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
