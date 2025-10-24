'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { cn } from '../lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'large' | 'compact';
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  className,
  hover = true,
  variant = 'default'
}: AnimatedCardProps) {
  const sizeClasses = {
    default: 'p-6',
    large: 'p-8',
    compact: 'p-4'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      className={cn('h-full', className)}
    >
      <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
        
        <CardContent className={cn(
          "relative z-10",
          sizeClasses[variant]
        )}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
