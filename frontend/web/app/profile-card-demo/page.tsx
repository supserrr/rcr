'use client';

import { ProfileCard } from "@workspace/ui/components/ui/profile-card";
import { useState } from "react";

/**
 * Demo page showcasing the Profile Card component.
 *
 * This page demonstrates the interactive profile card with:
 * - Animated hover effects
 * - Follow/unfollow functionality
 * - Verification badges
 * - Follower statistics
 * - Custom color variants
 *
 * @returns Profile Card demo page
 */
export default function ProfileCardDemoPage() {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handleFollow = (id: string) => {
    setFollowingStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const profiles = [
    {
      id: "doctor-sarah",
      name: "Dr. Sarah Mukamana",
      description: "Oncologist specializing in breast cancer treatment. Leading cancer care initiatives across Rwanda.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=800&fit=crop&auto=format&q=80",
      isVerified: true,
      followers: 1250,
      following: 180,
    },
    {
      id: "nurse-jean",
      name: "Jean Baptiste K.",
      description: "Registered Nurse providing compassionate care and support for cancer patients in rural communities.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=800&fit=crop&auto=format&q=80",
      isVerified: true,
      followers: 840,
      following: 95,
    },
    {
      id: "coordinator-marie",
      name: "Marie Uwase",
      description: "Program Coordinator managing mobile screening units and community outreach programs.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&auto=format&q=80",
      isVerified: true,
      followers: 620,
      following: 142,
    },
    {
      id: "counselor-emmanuel",
      name: "Emmanuel Nzabonimpa",
      description: "Patient advocate and support counselor helping families navigate cancer treatment journeys.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=80",
      isVerified: true,
      followers: 510,
      following: 78,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Profile Card Demo</h1>
          <p className="text-muted-foreground">
            Interactive profile cards with animated hover effects and follow functionality
          </p>
        </div>

        {/* Default Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Default Profile Card</h2>
          <div className="flex justify-center">
            <ProfileCard />
          </div>
        </section>

        {/* Healthcare Team */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Rwanda Cancer Relief Team</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                name={profile.name}
                description={profile.description}
                image={profile.image}
                isVerified={profile.isVerified}
                followers={profile.followers}
                following={profile.following}
                onFollow={() => handleFollow(profile.id)}
                isFollowing={followingStates[profile.id] || false}
              />
            ))}
          </div>
        </section>

        {/* With Animations Disabled */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">With Reduced Motion</h2>
          <p className="text-sm text-muted-foreground">
            Respects user preferences for reduced motion
          </p>
          <div className="flex justify-center">
            <ProfileCard
              name="Dr. Alice Nyiramana"
              description="Chief Medical Officer overseeing treatment protocols and quality assurance for cancer care."
              image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=800&fit=crop&auto=format&q=80"
              isVerified={true}
              followers={2100}
              following={215}
              enableAnimations={false}
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Healthcare Team Directory</h3>
              <p className="text-sm text-muted-foreground">
                Showcase doctors, nurses, and support staff working across Rwanda's
                cancer care network with professional profiles
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Patient Ambassador Program</h3>
              <p className="text-sm text-muted-foreground">
                Feature cancer survivors and patient advocates sharing their stories
                and offering peer support to current patients
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Community Health Workers</h3>
              <p className="text-sm text-muted-foreground">
                Highlight local health workers providing screening services and
                education in rural communities
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Component Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Smooth Animations</h4>
              <p className="text-sm text-muted-foreground">
                Spring-based hover effects with motion blur
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Verification Badge</h4>
              <p className="text-sm text-muted-foreground">
                Checkmark indicator for verified profiles
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Social Stats</h4>
              <p className="text-sm text-muted-foreground">
                Followers and following counts with icons
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Follow Button</h4>
              <p className="text-sm text-muted-foreground">
                Interactive button with state management
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About Profile Card Component</h3>
          <p className="text-sm text-muted-foreground">
            The Profile Card component uses Framer Motion for smooth, spring-based
            animations. It features a beautiful gradient overlay, blur effects, and
            responsive interactions. Perfect for showcasing team members, patient
            ambassadors, or community health workers with professional, engaging profiles.
          </p>
        </div>
      </div>
    </div>
  );
}

