'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedGrid({ 
  children, 
  className,
  staggerDelay = 0.1 
}: AnimatedGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * staggerDelay,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
