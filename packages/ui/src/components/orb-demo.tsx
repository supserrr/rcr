'use client';

import React from 'react';

interface OrbDemoProps {
  small?: boolean;
}

export function OrbDemo({ small = false }: OrbDemoProps) {
  return (
    <div className={`flex items-center justify-center ${small ? 'h-32' : 'h-64'}`}>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Orb Demo</h2>
        <p className="text-muted-foreground">Component coming soon</p>
      </div>
    </div>
  );
}
