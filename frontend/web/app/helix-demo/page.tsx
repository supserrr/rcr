"use client";

import { Hero } from "@workspace/ui/components/ui/helix-hero";

/**
 * Demo page showcasing the helix-hero component.
 *
 * This page demonstrates a 3D animated hero section featuring:
 * - Three.js 3D rendering with react-three/fiber
 * - Animated helix ring structure with iridescent materials
 * - Post-processing effects (bloom, glow)
 * - Progressive blur overlays for depth
 * - Responsive text positioning
 */
export default function HelixDemoPage() {
  return (
    <Hero
      title="Resonance in Motion"
      description="A silent rhythm spirals endlessly through empty space —  
  light refracts, forms bend, and geometry hums in quiet harmony.  
  Beyond shape and color, there is only fluid movement."
    />
  );
}

