'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnimatedStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
  animateValue?: boolean;
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  delay = 0,
  className,
  animateValue = true,
}: AnimatedStatCardProps) {
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
        
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">
              {title}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.2 }}
              className="p-2 rounded-full bg-primary/10"
            >
              <Icon className="h-4 w-4 text-primary" />
            </motion.div>
          </div>
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.3 }}
              className="text-2xl font-bold"
            >
              {typeof value === 'number' && animateValue ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: delay + 0.5 }}
                >
                  {value.toLocaleString()}
                </motion.span>
              ) : (
                value
              )}
            </motion.div>
            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.6 }}
                className="text-xs text-muted-foreground mt-1"
              >
                {description}
              </motion.p>
            )}
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.7 }}
                className={cn(
                  'flex items-center text-xs mt-2',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <motion.span
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="mr-1"
                >
                  {trend.isPositive ? '↗' : '↘'}
                </motion.span>
                {Math.abs(trend.value)}% from last month
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}