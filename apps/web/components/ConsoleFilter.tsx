'use client';

import { useEffect } from 'react';
import { initConsoleFilter } from '@/lib/utils/console-filter';

/**
 * Client component that initializes console error filtering
 * 
 * This component suppresses known non-critical errors and warnings
 * to provide a cleaner console experience.
 */
export function ConsoleFilter() {
  useEffect(() => {
    initConsoleFilter();
  }, []);

  return null;
}

