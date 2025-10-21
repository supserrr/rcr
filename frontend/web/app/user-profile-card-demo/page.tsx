'use client';

import { UserProfileCard } from "@workspace/ui/components/ui/user-profile-card";
import { Heart, Users, Calendar, Award, Activity, TrendingUp } from "lucide-react";

/**
 * Demo page showcasing the User Profile Card component.
 *
 * This page demonstrates the compact, expandable profile card with:
 * - Hover-to-expand functionality
 * - Progress bars for statistics
 * - Avatar and role display
 * - Animated text transitions
 * - Customizable metrics
 *
 * @returns User Profile Card demo page
 */
export default function UserProfileCardDemoPage() {
  const healthcareProfiles = [
    {
      name: "Dr. Diane Gashumba",
      role: "Chief Oncologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format&q=80",
      stats: [
        { label: 'Patients Treated', value: '95%', Icon: Users },
        { label: 'Success Rate', value: '88%', Icon: Award },
        { label: 'Years Experience', value: '85%', Icon: Calendar },
      ],
      summaryText: "Medical Professional",
      actionText: "View Medical Profile",
    },
    {
      name: "Claudine Uwera",
      role: "Patient Navigator",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&auto=format&q=80",
      stats: [
        { label: 'Patients Guided', value: '92%', Icon: Users },
        { label: 'Response Time', value: '98%', Icon: Activity },
        { label: 'Satisfaction Rate', value: '96%', Icon: Heart },
      ],
      summaryText: "Patient Support",
      actionText: "Contact Navigator",
    },
    {
      name: "Eric Habimana",
      role: "Community Health Worker",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format&q=80",
      stats: [
        { label: 'Screenings Done', value: '87%', Icon: Activity },
        { label: 'Communities Reached', value: '78%', Icon: Users },
        { label: 'Education Sessions', value: '92%', Icon: TrendingUp },
      ],
      summaryText: "Field Worker",
      actionText: "View Impact Report",
    },
    {
      name: "Dr. Patrick Nkusi",
      role: "Radiation Oncologist",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&auto=format&q=80",
      stats: [
        { label: 'Treatment Plans', value: '94%', Icon: Calendar },
        { label: 'Patient Recovery', value: '86%', Icon: Heart },
        { label: 'Clinical Research', value: '79%', Icon: Award },
      ],
      summaryText: "Specialist",
      actionText: "View Expertise",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">User Profile Card Demo</h1>
          <p className="text-muted-foreground">
            Compact, expandable profile cards with animated statistics on hover
          </p>
        </div>

        {/* Default Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Default Card</h2>
          <div className="flex justify-center">
            <UserProfileCard />
          </div>
        </section>

        {/* Healthcare Team Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Rwanda Cancer Relief Team</h2>
          <p className="text-muted-foreground">Hover over each card to see detailed statistics</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {healthcareProfiles.map((profile) => (
              <UserProfileCard
                key={profile.name}
                name={profile.name}
                role={profile.role}
                avatar={profile.avatar}
                stats={profile.stats}
                summaryText={profile.summaryText}
                actionText={profile.actionText}
              />
            ))}
          </div>
        </section>

        {/* Patient Ambassadors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Patient Ambassador Network</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <UserProfileCard
              name="Grace Mukamana"
              role="Cancer Survivor, 5 years"
              avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format&q=80"
              stats={[
                { label: 'Support Groups Led', value: '85%', Icon: Users },
                { label: 'Patients Mentored', value: '90%', Icon: Heart },
                { label: 'Community Events', value: '78%', Icon: Calendar },
              ]}
              summaryText="Ambassador Profile"
              actionText="Read Story"
            />
            <UserProfileCard
              name="Joseph Mugisha"
              role="Advocate & Counselor"
              avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format&q=80"
              stats={[
                { label: 'Counseling Sessions', value: '92%', Icon: Activity },
                { label: 'Family Support', value: '88%', Icon: Heart },
                { label: 'Advocacy Initiatives', value: '81%', Icon: TrendingUp },
              ]}
              summaryText="Advocate Profile"
              actionText="Learn More"
            />
            <UserProfileCard
              name="Liliane Uwimana"
              role="Community Leader"
              avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format&q=80"
              stats={[
                { label: 'Awareness Campaigns', value: '95%', Icon: TrendingUp },
                { label: 'Volunteers Trained', value: '87%', Icon: Users },
                { label: 'Lives Impacted', value: '93%', Icon: Heart },
              ]}
              summaryText="Community Leader"
              actionText="View Impact"
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Use Cases</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Staff Directory</h3>
              <p className="text-sm text-muted-foreground">
                Compact cards for browsing healthcare team members with expandable
                details showing expertise and performance metrics
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Patient Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect patients with ambassadors and peer supporters, showing
                their experience and support availability
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-primary">Performance Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Display team member performance metrics in an engaging,
                space-efficient format for admin dashboards
              </p>
            </div>
          </div>
        </section>

        {/* Component Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Component Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Hover to Expand</h4>
              <p className="text-sm text-muted-foreground">
                Reveals detailed statistics with smooth animations
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Progress Bars</h4>
              <p className="text-sm text-muted-foreground">
                Visual metrics with animated fill on expand
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Text Transition</h4>
              <p className="text-sm text-muted-foreground">
                Smooth text swap from summary to action
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-2">Compact Design</h4>
              <p className="text-sm text-muted-foreground">
                Space-efficient for displaying multiple profiles
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About User Profile Card</h3>
          <p className="text-sm text-muted-foreground">
            The User Profile Card component features a hover-to-expand design that
            reveals detailed statistics. Built with Framer Motion for smooth spring
            animations, it includes progress bars, text transitions, and a compact
            layout perfect for team directories and profile grids.
          </p>
        </div>
      </div>
    </div>
  );
}

