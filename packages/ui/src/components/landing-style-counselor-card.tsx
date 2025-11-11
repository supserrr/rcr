'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';
import { MessageCircle, Video, Phone, CircleDot, Circle, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import { normalizeAvatarUrl } from '../lib/avatar';

interface LandingStyleCounselorCardProps {
  id: string;
  name: string;
  avatar?: string;
  specialty?: string;
  availability?: 'available' | 'busy' | 'offline';
  experience?: number;
  availabilityStatus?: string;
  availabilityDisplay?: string;
  services?: string[];
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
  availabilityStatus,
  availabilityDisplay,
  services,
  onBookSession,
  onViewProfile,
  delay = 0,
  className
}: LandingStyleCounselorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (onBookSession) {
      onBookSession(id);
    }
  };

  // Create a description that includes specialty and experience
  const experienceLabel =
    typeof experience === 'number' && experience > 0
      ? `${experience} ${experience === 1 ? 'year' : 'years'} experience`
      : 'Experience info coming soon';

  const description = specialty
    ? `${specialty} • ${experienceLabel}`
    : experienceLabel;

  const resolvedServices = useMemo(() => {
    if (Array.isArray(services) && services.length > 0) {
      const unique = Array.from(
        new Set(
          services
            .map((service) => (typeof service === 'string' ? service.trim() : ''))
            .filter((service) => service.length > 0),
        ),
      );
      if (unique.length > 0) {
        return unique;
      }
    }
    return ['chat', 'video', 'phone'];
  }, [services]);

  const serviceConfig: Record<
    string,
    { label: string; icon?: React.ComponentType<{ className?: string }> }
  > = {
    chat: { label: 'Chat', icon: MessageCircle },
    messaging: { label: 'Messaging', icon: MessageCircle },
    message: { label: 'Messaging', icon: MessageCircle },
    text: { label: 'Messaging', icon: MessageCircle },
    video: { label: 'Video', icon: Video },
    telehealth: { label: 'Telehealth', icon: Video },
    virtual: { label: 'Virtual', icon: Video },
    phone: { label: 'Phone', icon: Phone },
    call: { label: 'Phone', icon: Phone },
    voice: { label: 'Phone', icon: Phone },
    inperson: { label: 'In-Person', icon: CircleDot },
    'in-person': { label: 'In-Person', icon: CircleDot },
  };
  const placeholderGradient = useMemo(() => {
    const palette = [
      'from-primary/25 via-background to-primary/5',
      'from-indigo-400/30 via-background to-indigo-900/20',
      'from-emerald-400/25 via-background to-emerald-900/20',
      'from-amber-400/25 via-background to-amber-900/20',
    ];
    const hash = Math.abs(Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return palette[hash % palette.length];
  }, [id]);

  const initials = useMemo(() => {
    const letters = name
      .split(/\s+/)
      .map((segment) => segment[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return letters || 'C';
  }, [name]);

  const getAvailabilityBadge = () => {
    const rawStatus = availabilityStatus ?? availability;
    if (!rawStatus) {
      return null;
    }
    
    const config: Record<
      string,
      { className: string; icon: React.ComponentType<{ className?: string }>; text: string }
    > = {
      available: {
        className: 'bg-green-500 text-white',
        icon: CircleDot,
        text: 'Available',
      },
      busy: {
        className: 'bg-yellow-500 text-white',
        icon: Circle,
        text: 'Busy',
      },
      offline: {
        className: 'bg-gray-500 text-white',
        icon: Minus,
        text: 'Offline',
      },
      limited: {
        className: 'bg-amber-500 text-white',
        icon: Circle,
        text: 'Limited Spots',
      },
      waitlist: {
        className: 'bg-orange-500 text-white',
        icon: Circle,
        text: 'Waitlist',
      },
      unavailable: {
        className: 'bg-gray-500 text-white',
        icon: Minus,
        text: 'Unavailable',
      },
    };

    const normalized = rawStatus.toLowerCase().trim();
    const compact = normalized.replace(/[\s_-]+/g, '');
    let lookupKey = compact;

    if (compact === 'limitedspots' || compact === 'limitedavailability') {
      lookupKey = 'limited';
    } else if (compact === 'booked' || compact === 'partial') {
      lookupKey = 'busy';
    } else if (compact === 'notavailable' || compact === 'outofoffice') {
      lookupKey = 'unavailable';
    }

    if (!config[lookupKey]) {
      lookupKey = availability ? availability.toLowerCase() : 'available';
    }

    const badgeConfig = config[lookupKey] ?? config.available;

    if (!badgeConfig) {
      return null;
    }

    const Icon = badgeConfig.icon;
    const label = availabilityDisplay ?? badgeConfig.text;

    return (
      <Badge className={`absolute top-4 right-4 ${badgeConfig.className} backdrop-blur-sm border-0 shadow-lg`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const imageUrl = useMemo(() => {
    const normalized = normalizeAvatarUrl(avatar);
    return normalized;
  }, [avatar]);
  const hasImage = Boolean(imageUrl) && !imageFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('relative w-full h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm dark:shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:scale-105', className)}
    >
      {/* Full Cover Image */}
      {hasImage ? (
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${placeholderGradient}`}
        >
          <span className="text-5xl font-semibold text-primary/70 drop-shadow-sm">{initials}</span>
        </div>
      )}

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
          {resolvedServices.map((service) => {
            const key = service.toLowerCase().replace(/\s+/g, '');
            const configEntry = serviceConfig[key];
            const Icon = configEntry?.icon;
            const label = configEntry?.label ?? service;
            return (
              <Badge
                key={`${service}-${id}`}
                variant="outline"
                className="bg-sidebar/80 backdrop-blur-sm text-xs"
              >
                {Icon ? <Icon className="w-3 h-3 mr-1" /> : null}
                {label}
            </Badge>
            );
          })}
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
