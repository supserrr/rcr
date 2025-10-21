'use client';

import { Heart, Stethoscope, Users } from 'lucide-react';
import { AnimatedFeatureSpotlight } from '@workspace/ui/components/ui/feature-spotlight';

/**
 * Demo page showcasing the AnimatedFeatureSpotlight component
 * with Rwanda Cancer Relief services.
 * 
 * This page demonstrates multiple feature spotlights that could be used
 * on a landing page or services page to highlight key offerings.
 * 
 * @returns A page with multiple feature spotlights
 */
export default function ServicesDemoPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background p-4 gap-12 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive cancer care and support services for communities in Rwanda
          </p>
        </div>

        <AnimatedFeatureSpotlight
          preheaderIcon={<Heart className="h-4 w-4" />}
          preheaderText="Patient Care & Support"
          heading={
            <>
              <span className="text-primary">Compassionate</span> Cancer Care
            </>
          }
          description="We provide comprehensive support services for cancer patients and their families, including counseling, nutritional guidance, and palliative care to improve quality of life throughout treatment."
          buttonText="Learn More"
          buttonProps={{ 
            variant: 'default',
            onClick: () => console.log('Patient Care clicked') 
          }}
          imageUrl="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
          imageAlt="Healthcare professionals providing compassionate care"
        />

        <AnimatedFeatureSpotlight
          preheaderIcon={<Stethoscope className="h-4 w-4" />}
          preheaderText="Early Detection Programs"
          heading={
            <>
              <span className="text-primary">Early Detection</span> Saves Lives
            </>
          }
          description="Our mobile screening units bring cancer detection services directly to rural communities, making it easier for people to access life-saving early diagnosis and treatment referrals."
          buttonText="Schedule Screening"
          buttonProps={{ 
            variant: 'default',
            onClick: () => console.log('Screening clicked') 
          }}
          imageUrl="https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80"
          imageAlt="Medical screening equipment and healthcare worker"
          className="bg-muted/30"
        />

        <AnimatedFeatureSpotlight
          preheaderIcon={<Users className="h-4 w-4" />}
          preheaderText="Community Education"
          heading={
            <>
              <span className="text-primary">Empowering</span> Communities
            </>
          }
          description="We conduct awareness campaigns and educational workshops to help communities understand cancer prevention, recognize early warning signs, and reduce stigma around cancer diagnosis."
          buttonText="Get Involved"
          buttonProps={{ 
            variant: 'default',
            onClick: () => console.log('Community clicked') 
          }}
          imageUrl="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80"
          imageAlt="Community members learning together"
        />
      </div>
    </div>
  );
}

