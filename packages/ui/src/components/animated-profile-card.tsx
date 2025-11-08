'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '../lib/utils';

interface AnimatedProfileCardProps {
  name: string;
  specialty?: string;
  avatar?: string;
  availability?: 'available' | 'busy' | 'offline';
  experience?: string;
  onBookSession?: () => void;
  delay?: number;
  className?: string;
}

export function AnimatedProfileCard({
  name,
  specialty,
  avatar,
  availability = 'available',
  experience,
  onBookSession,
  delay = 0,
  className,
}: AnimatedProfileCardProps) {
  const availabilityColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500',
  };

  const availabilityLabels = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn('h-full', className)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.1 }}
              className="relative"
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-lg">
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: delay + 0.3 }}
                className={cn(
                  'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white',
                  availabilityColors[availability]
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
              className="space-y-2"
            >
              <h3 className="font-semibold text-lg">{name}</h3>
              {specialty && (
                <p className="text-sm text-muted-foreground">{specialty}</p>
              )}
              {experience && (
                <p className="text-xs text-muted-foreground">{experience}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.3 }}
              className="flex items-center space-x-2"
            >
              <Badge variant="secondary" className="text-xs">
                {availabilityLabels[availability]}
              </Badge>
            </motion.div>

            {onBookSession && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.4 }}
              >
                <Button
                  onClick={onBookSession}
                  size="sm"
                  className="w-full"
                  disabled={availability === 'offline'}
                >
                  Book Session
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
