'use client';

import { ParallaxScrollFeatureSection } from '@workspace/ui/components/ui/parallax-scroll-feature-section';

/**
 * Cancer services page showcasing Rwanda Cancer Relief programs
 * using the ParallaxScrollFeatureSection component.
 * 
 * This page demonstrates the parallax scroll effect with
 * contextualized content for cancer care services in Rwanda.
 * 
 * @returns A full-page services showcase with parallax scroll animations
 */
export default function CancerServicesPage() {
  const cancerServices = [
    {
      id: 1,
      title: 'Early Detection Programs',
      description:
        'Our mobile screening units bring life-saving cancer detection services directly to rural communities across Rwanda. We provide comprehensive breast, cervical, and prostate cancer screenings, ensuring early diagnosis and better treatment outcomes for underserved populations.',
      imageUrl: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80',
      reverse: false,
    },
    {
      id: 2,
      title: 'Patient Support Services',
      description:
        'We provide holistic care for cancer patients and their families, including counseling, nutritional support, and palliative care. Our dedicated team ensures that every patient receives compassionate, culturally-sensitive care throughout their treatment journey.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      reverse: true,
    },
    {
      id: 3,
      title: 'Community Education',
      description:
        'Through workshops, awareness campaigns, and community outreach programs, we educate Rwandans about cancer prevention, early warning signs, and available treatments. Our mission is to reduce stigma and empower communities with knowledge that saves lives.',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
      reverse: false,
    },
    {
      id: 4,
      title: 'Treatment Access',
      description:
        'We work to bridge the gap between diagnosis and treatment by facilitating access to chemotherapy, radiation, and surgical interventions. Our partnerships with medical facilities ensure that financial constraints do not prevent patients from receiving necessary care.',
      imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80',
      reverse: true,
    },
  ];

  return (
    <ParallaxScrollFeatureSection
      heading="Our Cancer Care Services"
      scrollText="EXPLORE OUR PROGRAMS"
      endingText="Together, We Fight Cancer"
      sections={cancerServices}
    />
  );
}

