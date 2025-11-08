'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@workspace/ui/components/button";
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { Footer } from '@workspace/ui/components/ui/footer';
import { ThemeTogglerButton } from '@workspace/ui/components/animate-ui/components/buttons/theme-toggler';
import { RCRLogo } from '@workspace/ui/components/rcr-logo';
import { Search, Filter, MessageCircle, Video, Phone } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Counselor profile data structure
 */
interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  languages: string[];
  experience: string;
  reviews: number;
  availability: string;
  photo: string;
  bio: string;
  education: string;
  certifications: string[];
  consultationTypes: ('chat' | 'video' | 'phone')[];
}

/**
 * Sample counselor data
 */
const counselors: Counselor[] = [
  {
    id: '1',
    name: 'Dr. Marie Uwimana',
    title: 'Licensed Clinical Psychologist',
    specialties: ['Cancer Support', 'Grief Counseling', 'Family Therapy'],
    languages: ['Kinyarwanda', 'English', 'French'],
    experience: '8 years',
    reviews: 127,
    availability: 'Available now',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format&q=80',
    bio: 'Dr. Uwimana specializes in supporting cancer patients and their families through their journey. With extensive experience in grief counseling and family therapy, she provides compassionate care tailored to Rwandan cultural values.',
    education: 'PhD in Clinical Psychology, University of Rwanda',
    certifications: ['Licensed Clinical Psychologist', 'Cancer Support Specialist', 'Grief Counseling Certification'],
    consultationTypes: ['chat', 'video', 'phone']
  },
  {
    id: '2',
    name: 'Jean-Baptiste Nkurunziza',
    title: 'Mental Health Counselor',
    specialties: ['Anxiety Management', 'Depression Support', 'Coping Strategies'],
    languages: ['Kinyarwanda', 'English'],
    experience: '6 years',
    reviews: 89,
    availability: 'Available in 2 hours',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format&q=80',
    bio: 'Jean-Baptiste focuses on helping patients develop effective coping strategies and manage anxiety and depression related to cancer diagnosis and treatment.',
    education: 'Master of Counseling, Kigali Institute of Education',
    certifications: ['Mental Health Counselor', 'Anxiety Management Specialist'],
    consultationTypes: ['chat', 'video']
  },
  {
    id: '3',
    name: 'Dr. Grace Mukamana',
    title: 'Oncology Social Worker',
    specialties: ['Family Support', 'Resource Navigation', 'End-of-Life Care'],
    languages: ['Kinyarwanda', 'English', 'Swahili'],
    experience: '10 years',
    reviews: 156,
    availability: 'Available tomorrow',
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&auto=format&q=80',
    bio: 'Dr. Mukamana provides comprehensive support to families navigating cancer treatment, helping them access resources and cope with the emotional challenges of the journey.',
    education: 'MSW in Oncology Social Work, University of Cape Town',
    certifications: ['Licensed Social Worker', 'Oncology Social Work Specialist'],
    consultationTypes: ['chat', 'video', 'phone']
  },
  {
    id: '4',
    name: 'Paul Nsengimana',
    title: 'Peer Support Specialist',
    specialties: ['Peer Support', 'Survivor Stories', 'Community Building'],
    languages: ['Kinyarwanda', 'English'],
    experience: '4 years',
    reviews: 73,
    availability: 'Available now',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format&q=80',
    bio: 'Paul is a cancer survivor who provides peer support and shares his journey to inspire hope and resilience in others facing similar challenges.',
    education: 'Certificate in Peer Support, Rwanda Cancer Relief',
    certifications: ['Certified Peer Support Specialist', 'Cancer Survivor Mentor'],
    consultationTypes: ['chat', 'video']
  }
];

/**
 * Counselor profile card component inspired by ProfileCard design
 */
function CounselorCard({ counselor }: { counselor: Counselor }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const router = useRouter();
  const { isAuthenticated, redirectToSignIn } = useAuth();

  const handleFollow = () => {
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      redirectToSignIn();
      return;
    }
    
    // If authenticated, redirect to patient dashboard sessions page with counselor ID
    // The counselor ID can be used to pre-select the counselor when booking
    router.push(`/dashboard/patient/sessions?counselorId=${counselor.id}`);
  };

  // Create a description that includes specialties and languages
  const description = `${counselor.title} • ${counselor.specialties.slice(0, 2).join(', ')} • ${counselor.languages.join(', ')}`;

  return (
    <div className="relative w-80 h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm dark:shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Full Cover Image */}
      <img
        src={counselor.photo}
        alt={counselor.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />



      {/* Smooth Blur Overlay - Multiple layers for seamless fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 via-background/20 via-background/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/90 via-background/60 via-background/30 via-background/15 via-background/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/85 via-background/40 to-transparent backdrop-blur-sm" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
        {/* Name */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {counselor.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Consultation Types */}
        <div className="flex gap-2 flex-wrap">
          {counselor.consultationTypes.includes('chat') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Badge>
          )}
          {counselor.consultationTypes.includes('video') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
          {counselor.consultationTypes.includes('phone') && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              <Phone className="w-3 h-3 mr-1" />
              Phone
            </Badge>
          )}
        </div>


        {/* Action Button */}
        <button
          onClick={handleFollow}
          className={`w-full cursor-pointer py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border border-border/20 shadow-sm transform-gpu ${
            isFollowing 
              ? "bg-muted text-muted-foreground hover:bg-muted/80" 
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {isFollowing ? "Booked" : "Book Session"}
        </button>
      </div>
    </div>
  );
}

/**
 * Counselors page component
 */
export default function CounselorsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter counselors based on search
  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-jakarta-sans text-4xl lg:text-6xl font-semibold text-foreground mb-6">
            Meet Our Counselors
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our counselors combine professional expertise with genuine empathy to support your emotional and mental well-being throughout your healing journey.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                placeholder="Search counselors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Counselors Grid */}
      <section className="pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="font-jakarta-sans text-muted-foreground">
              {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {filteredCounselors.map(counselor => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))}
          </div>

          {filteredCounselors.length === 0 && (
            <div className="text-center py-12">
              <p className="font-jakarta-sans text-muted-foreground text-lg">
                No counselors found matching your search.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<RCRLogo variant="simple" width={32} height={32} />}
        brandName="Rwanda Cancer Relief"
        mainLinks={[
          { href: "/get-help", label: "Get Help" },
          { href: "/counselors", label: "Find a Counselor" },
          { href: "/about", label: "About Us" },
          { href: "/resources", label: "Resources" },
          { href: "/contact", label: "Contact" },
          { href: "/signin", label: "Sign In" },
          { href: "/signup/patient", label: "Patient Sign Up" },
          { href: "/signup/counselor", label: "Counselor Sign Up" }
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" }
        ]}
        socialLinks={[
          { 
            label: "Facebook", 
            href: "https://facebook.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          },
          { 
            label: "Twitter", 
            href: "https://twitter.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          },
          { 
            label: "Instagram", 
            href: "https://instagram.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-5.543 1.297c.718 0 1.297.579 1.297 1.297s-.579 1.297-1.297 1.297-1.297-.579-1.297-1.297.579-1.297 1.297-1.297z"/></svg>
          }
        ]}
        copyright={{
          text: "© 2025 Rwanda Cancer Relief",
          license: "All rights reserved."
        }}
        themeToggle={
          <div className="flex items-center justify-center">
            <ThemeTogglerButton variant="outline" size="default" direction="ltr" modes={['light', 'dark']} className="h-10 w-10 rounded-full" />
          </div>
        }
      />
    </main>
  );
}
