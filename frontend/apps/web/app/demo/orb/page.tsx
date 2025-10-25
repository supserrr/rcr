'use client';

import React from 'react';
import { OrbDemo } from '@workspace/ui/components/orb-demo';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function OrbDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Orb Component Demo
          </h1>
          <p className="text-xl text-gray-600">
            Interactive 3D orb visualization with agent states
          </p>
        </div>

        {/* Full Size Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Full Size Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <OrbDemo />
          </CardContent>
        </Card>

        {/* Small Size Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Small Size Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <OrbDemo small={true} />
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Import</h4>
              <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`import { OrbDemo } from '@workspace/ui/components/orb-demo'`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Basic Usage</h4>
              <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`// Full size demo with all orbs
<OrbDemo />

// Small demo with single orb
<OrbDemo small={true} />`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Multiple orb color schemes</li>
                <li>Interactive agent state controls</li>
                <li>Responsive design (hides orbs on small screens)</li>
                <li>Beautiful inset shadows and styling</li>
                <li>Real-time 3D animations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
