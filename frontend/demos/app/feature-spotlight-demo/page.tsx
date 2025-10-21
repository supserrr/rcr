'use client';

import { Eye } from 'lucide-react';
import { AnimatedFeatureSpotlight } from '@workspace/ui/components/ui/feature-spotlight';

/**
 * Demo page showcasing the AnimatedFeatureSpotlight component.
 * 
 * This page demonstrates the component with animations that fire on load,
 * displaying a market screener feature with staggered text animations and
 * a floating image.
 * 
 * @returns A demo page with the AnimatedFeatureSpotlight component
 */
export default function AnimatedFeatureSpotlightDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-muted p-4">
      <AnimatedFeatureSpotlight
        preheaderIcon={<Eye className="h-4 w-4" />}
        preheaderText="See the Market From Every Angle"
        heading={
          <>
            <span className="text-primary">Uncover</span> Untapped{' '}
            <span className="text-primary">Potential</span>
          </>
        }
        description="Filter the global market instantly with powerful screeners tailored to your trading style. Quickly identify the most promising assets based on specific criteria and market conditions, so you never miss the next big thing."
        buttonText="Try Now for Free"
        buttonProps={{ onClick: () => alert('Button Clicked!') }}
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        imageAlt="A screenshot of the market screener feature"
      />
    </div>
  );
}

