'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'grid';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  type = 'card', 
  count = 1, 
  className 
}: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderListSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`space-y-3 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center space-x-4 p-4 border rounded-lg"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderGridSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  switch (type) {
    case 'list':
      return renderListSkeleton();
    case 'grid':
      return renderGridSkeleton();
    default:
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {renderCardSkeleton()}
            </motion.div>
          ))}
        </div>
      );
  }
}
