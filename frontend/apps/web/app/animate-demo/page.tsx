'use client';

import React, { useState, useEffect } from 'react';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function AnimateDemoPage() {
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Simulate some data changes
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 10));
      setScore(prev => prev + Math.floor(Math.random() * 100));
      setRevenue(prev => prev + Math.floor(Math.random() * 1000));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Animate UI Demo</h1>
          <p className="text-muted-foreground">
            Showcasing animated components from @animate-ui
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Counter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-4">
                  <SlidingNumber 
                    number={count}
                    fromNumber={0}
                    transition={{ stiffness: 200, damping: 20, mass: 0.4 }}
                  />
                </div>
                <Button 
                  onClick={() => setCount(prev => prev + 1)}
                  variant="outline"
                >
                  Increment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-4">
                  <SlidingNumber 
                    number={score}
                    fromNumber={0}
                    transition={{ stiffness: 150, damping: 25, mass: 0.5 }}
                  />
                </div>
                <Button 
                  onClick={() => setScore(prev => prev + 50)}
                  variant="outline"
                >
                  Add 50 Points
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  $<SlidingNumber 
                    number={revenue}
                    fromNumber={0}
                    thousandSeparator=","
                    transition={{ stiffness: 100, damping: 30, mass: 0.6 }}
                  />
                </div>
                <Button 
                  onClick={() => setRevenue(prev => prev + 500)}
                  variant="outline"
                >
                  Add $500
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Watch the numbers animate smoothly when they change. The sliding animation
                creates a satisfying visual effect for data updates.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    setCount(0);
                    setScore(0);
                    setRevenue(0);
                  }}
                  variant="destructive"
                >
                  Reset All
                </Button>
                <Button 
                  onClick={() => {
                    setCount(prev => prev + 100);
                    setScore(prev => prev + 1000);
                    setRevenue(prev => prev + 10000);
                  }}
                >
                  Big Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
