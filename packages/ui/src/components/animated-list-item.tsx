'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AnimatedListItemProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  index?: number;
}

export function AnimatedListItem({ 
  children, 
  delay = 0, 
  className,
  index = 0 
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay + (index * 0.1),
        ease: 'easeOut'
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
