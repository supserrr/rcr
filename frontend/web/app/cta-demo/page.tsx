'use client';

import { CallToAction } from '@workspace/ui/components/ui/call-to-action-1';

/**
 * Demo page showcasing the CallToAction component with both variants.
 * 
 * This page demonstrates the CTA component in the context of Rwanda Cancer Relief,
 * showing both the gradient and light variants with contextual messaging.
 * 
 * @returns A demo page with multiple call-to-action examples
 */
export default function CTADemoPage() {
  const communityAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&q=80',
  ];

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 space-y-16">
      {/* Gradient Variant - Volunteer Recruitment */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">Gradient Variant</h2>
        <CallToAction
          variant="gradient"
          heading="Join the fight against cancer in Rwanda"
          description="Be part of a community dedicated to providing life-saving cancer care and support to underserved communities across Rwanda."
          primaryButtonText="Become a Volunteer"
          communityText="Join 5,000+ healthcare heroes"
          avatars={communityAvatars}
          onPrimaryClick={() => console.log('Volunteer clicked')}
        />
      </div>

      {/* Light Variant - Donation Campaign */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">Light Variant</h2>
        <CallToAction
          variant="light"
          heading="Support cancer patients in need"
          description="Your donation provides free cancer screenings, treatment support, and palliative care to families across Rwanda who need it most."
          primaryButtonText="Donate Now"
          secondaryButtonText="Learn More"
          onPrimaryClick={() => console.log('Donate clicked')}
          onSecondaryClick={() => console.log('Learn more clicked')}
        />
      </div>

      {/* Gradient Variant - Mobile Screening */}
      <div className="flex flex-col items-center">
        <CallToAction
          variant="gradient"
          heading="Schedule a free cancer screening today"
          description="Our mobile units bring comprehensive cancer screening services directly to your community."
          primaryButtonText="Book Screening"
          communityText="Serving 500+ communities"
          avatars={communityAvatars}
          onPrimaryClick={() => console.log('Book screening clicked')}
        />
      </div>

      {/* Light Variant - Newsletter Signup */}
      <div className="flex flex-col items-center">
        <CallToAction
          variant="light"
          heading="Stay informed about cancer prevention"
          description="Get monthly updates on cancer awareness, prevention tips, screening schedules, and success stories from our community."
          primaryButtonText="Subscribe"
          secondaryButtonText="View Archives"
          onPrimaryClick={() => console.log('Subscribe clicked')}
          onSecondaryClick={() => console.log('Archives clicked')}
        />
      </div>
    </main>
  );
}

