'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';
import { MessageCircle, Video, Phone, CircleDot, Circle, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingStyleCounselorCardProps {
  id: string;
  name: string;
  avatar?: string;
  specialty?: string;
  availability?: 'available' | 'busy' | 'offline';
  experience?: number;
  onBookSession?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  delay?: number;
  className?: string;
}

export function LandingStyleCounselorCard({
  id,
  name,
  avatar,
  specialty,
  availability,
  experience,
  onBookSession,
  onViewProfile,
  delay = 0,
  className
}: LandingStyleCounselorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (onBookSession) {
      onBookSession(id);
    }
  };

  // Create a description that includes specialty and experience
  const description = `${specialty || 'Counselor'} • ${experience || 0} years experience`;

  // Default consultation types - you can make this configurable later
  const consultationTypes: ('chat' | 'video' | 'phone')[] = ['chat', 'video', 'phone'];

  // Use working placeholder images
  const placeholderImages: string[] = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format&q=80'
  ];

  // Get a consistent image based on counselor ID
  const getImageUrl = (): string => {
    if (avatar && !avatar.startsWith('/avatars/')) {
      return avatar;
    }
    // Use ID to get consistent placeholder
    const index = parseInt(id) % placeholderImages.length;
    const image = placeholderImages[index];
    return image || placeholderImages[0] || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format&q=80';
  };

  const getAvailabilityBadge = () => {
    if (!availability) return null;
    
    const config = {
      available: {
        className: 'bg-green-500 text-white',
        icon: CircleDot,
        text: 'Available'
      },
      busy: {
        className: 'bg-yellow-500 text-white',
        icon: Circle,
        text: 'Busy'
      },
      offline: {
        className: 'bg-gray-500 text-white',
        icon: Minus,
        text: 'Offline'
      }
    };

    const badgeConfig = config[availability];
    const Icon = badgeConfig.icon;

    return (
      <Badge className={`absolute top-4 right-4 ${badgeConfig.className} backdrop-blur-sm border-0 shadow-lg`}>
        <Icon className="w-3 h-3 mr-1" />
        {badgeConfig.text}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('relative w-full h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm dark:shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:scale-105', className)}
    >
      {/* Full Cover Image */}
      <img
        src={getImageUrl()}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          // Fallback to first placeholder if image fails to load
          e.currentTarget.src = placeholderImages[0] || '';
        }}
      />

      {/* Smooth Blur Overlay - Multiple layers for seamless fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-sidebar/95 via-sidebar/40 via-sidebar/20 via-sidebar/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-sidebar/90 via-sidebar/60 via-sidebar/30 via-sidebar/15 via-sidebar/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sidebar/85 via-sidebar/40 to-transparent backdrop-blur-sm"       />

      {/* Availability Badge */}
      {getAvailabilityBadge()}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
        {/* Name */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Consultation Types */}
        <div className="flex gap-2 flex-wrap">
          {consultationTypes.includes('chat') && (
            <Badge variant="outline" className="bg-sidebar/80 backdrop-blur-sm text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Badge>
          )}
          {consultationTypes.includes('video') && (
            <Badge variant="outline" className="bg-sidebar/80 backdrop-blur-sm text-xs">
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
          {consultationTypes.includes('phone') && (
            <Badge variant="outline" className="bg-sidebar/80 backdrop-blur-sm text-xs">
              <Phone className="w-3 h-3 mr-1" />
              Phone
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleFollow}
            className={`flex-1 cursor-pointer py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border border-border/20 shadow-sm transform-gpu ${
              isFollowing 
                ? "bg-muted text-muted-foreground hover:bg-muted/80" 
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isFollowing ? "Booked" : "Book Session"}
          </button>
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(id)}
              className="flex-1 cursor-pointer py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 border-border/60 shadow-sm transform-gpu bg-sidebar/80 backdrop-blur-sm text-foreground hover:bg-sidebar/90 hover:border-border/80"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
