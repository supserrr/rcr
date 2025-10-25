'use client';

import React from 'react';
import { AIChatInterface } from '@workspace/ui/components/ai-chat-interface';

export default function AIChatDemoPage() {
  return (
    <div className="h-screen overflow-hidden">
      <AIChatInterface 
        userName="Demo User"
        className="h-full"
      />
    </div>
  );
}
