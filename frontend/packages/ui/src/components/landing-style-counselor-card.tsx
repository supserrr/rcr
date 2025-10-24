'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { MapPin, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingStyleCounselorCardProps {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  rating?: number;
  specialty?: string;
  location?: string;
  availability?: 'available' | 'busy' | 'offline';
  bio?: string;
  languages?: string[];
  experience?: number;
  onBookSession?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  delay?: number;
  className?: string;
}

export function LandingStyleCounselorCard({
  id,
  name,
  title,
  avatar,
  rating,
  specialty,
  location,
  availability,
  bio,
  languages,
  experience,
  onBookSession,
  onViewProfile,
  delay = 0,
  className
}: LandingStyleCounselorCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn('h-full', className)}
    >
      <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
        
        <CardContent className="relative z-10 p-6">
          {/* Header with Avatar */}
          <div className="flex items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="text-lg">
                    {name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${getAvailabilityColor(availability)}`} />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-foreground">{name}</h3>
                {title && <p className="text-sm text-muted-foreground">{title}</p>}
                {specialty && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {specialty}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {bio}
            </p>
          )}

          {/* Details */}
          <div className="space-y-2 mb-6">
            {location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
            
            {availability && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{getAvailabilityText(availability)}</span>
              </div>
            )}
            
            {experience && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{experience} years experience</span>
              </div>
            )}
          </div>

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Languages:</p>
              <div className="flex flex-wrap gap-1">
                {languages.slice(0, 3).map((language, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {language}
                  </Badge>
                ))}
                {languages.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{languages.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onBookSession && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onBookSession(id)}
                disabled={availability === 'offline'}
              >
                Book Session
              </Button>
            )}
            {onViewProfile && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => onViewProfile(id)}
              >
                View Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
