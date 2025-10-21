'use client';

import { ShimmeringText } from "@workspace/ui/components/ui/shimmering-text";

/**
 * Demo page showcasing the ElevenLabs Shimmering Text component.
 *
 * This page demonstrates animated text with gradient shimmer effects including:
 * - Different durations and delays
 * - Custom colors and gradients
 * - Viewport-triggered animations
 * - Repeating animations
 *
 * @returns Shimmering Text demo page
 */
export default function ShimmeringTextDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Shimmering Text Demo</h1>
          <p className="text-muted-foreground">
            Animated text with gradient shimmer effects and viewport-triggered animations
          </p>
        </div>

        {/* Default Shimmer */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Default Shimmer</h2>
          <div className="rounded-lg border bg-card p-8 text-center">
            <ShimmeringText
              text="Rwanda Cancer Relief"
              className="text-5xl font-bold"
            />
          </div>
        </section>

        {/* Custom Duration */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Different Speeds</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Fast (1 second)</p>
              <ShimmeringText
                text="Early Detection Saves Lives"
                duration={1}
                className="text-2xl font-semibold"
              />
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Slow (5 seconds)</p>
              <ShimmeringText
                text="Hope Through Healthcare"
                duration={5}
                className="text-2xl font-semibold"
              />
            </div>
          </div>
        </section>

        {/* Custom Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Custom Colors</h2>
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card p-8 text-center">
              <ShimmeringText
                text="Together We Fight Cancer"
                className="text-4xl font-bold"
                color="#3B82F6"
                shimmerColor="#60A5FA"
              />
            </div>
            <div className="rounded-lg border bg-card p-8 text-center bg-black">
              <ShimmeringText
                text="Empowering Communities"
                className="text-4xl font-bold text-white"
                color="#FFFFFF"
                shimmerColor="#10B981"
              />
            </div>
          </div>
        </section>

        {/* Viewport Triggered */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Scroll-Triggered Animation</h2>
          <p className="text-sm text-muted-foreground">Scroll down to see these animate</p>
          <div className="space-y-8 pt-32">
            <div className="rounded-lg border bg-card p-8 text-center">
              <ShimmeringText
                text="Free Cancer Screenings"
                className="text-3xl font-bold"
                startOnView={true}
                once={true}
              />
            </div>
            <div className="rounded-lg border bg-card p-8 text-center">
              <ShimmeringText
                text="Mobile Health Units"
                className="text-3xl font-bold"
                startOnView={true}
                once={true}
                delay={0.5}
              />
            </div>
            <div className="rounded-lg border bg-card p-8 text-center">
              <ShimmeringText
                text="Compassionate Care"
                className="text-3xl font-bold"
                startOnView={true}
                once={true}
                delay={1}
              />
            </div>
          </div>
        </section>

        {/* Headlines */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Headline Examples</h2>
          <div className="space-y-8">
            <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-background p-12 text-center">
              <ShimmeringText
                text="Serving 500+ Communities Across Rwanda"
                className="text-5xl font-bold mb-4"
                duration={3}
              />
              <p className="text-xl text-muted-foreground">Making cancer care accessible to everyone</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Landing Page Headers</h3>
              <p className="text-sm text-muted-foreground">
                Create attention-grabbing headers that draw visitors' eyes to key
                messages about services and impact
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Success Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Highlight important statistics and achievements with animated emphasis
                to celebrate program impact
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Call-to-Action Text</h3>
              <p className="text-sm text-muted-foreground">
                Make donation appeals and volunteer recruitment messages more
                compelling with subtle animation
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Testimonial Highlights</h3>
              <p className="text-sm text-muted-foreground">
                Draw attention to powerful quotes from patients and caregivers
                sharing their experiences
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About Shimmering Text</h3>
          <p className="text-sm text-muted-foreground">
            The Shimmering Text component uses Motion for smooth, performant animations.
            It features viewport detection, customizable colors, and flexible timing
            controls to create eye-catching text effects that enhance user engagement
            without being distracting.
          </p>
        </div>
      </div>
    </div>
  );
}

