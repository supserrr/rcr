'use client';

import {
  Waveform,
  ScrollingWaveform,
  MicrophoneWaveform,
  StaticWaveform,
} from "@workspace/ui/components/ui/waveform";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

/**
 * Demo page showcasing the ElevenLabs Waveform component.
 *
 * This page demonstrates audio waveform visualizations including:
 * - Static waveform display
 * - Scrolling animated waveform
 * - Live microphone input visualization
 * - Interactive waveform controls
 *
 * @returns Waveform demo page
 */
export default function WaveformDemoPage() {
  const [isListening, setIsListening] = useState(false);
  
  const staticData = Array.from({ length: 60 }, () => 0.2 + Math.random() * 0.6);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Waveform Demo</h1>
          <p className="text-muted-foreground">
            Canvas-based audio visualizations with recording and playback support
          </p>
        </div>

        {/* Static Waveform */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Static Waveform</h2>
          <div className="rounded-lg border bg-card p-6">
            <Waveform
              data={staticData}
              height={100}
              barWidth={4}
              barGap={2}
              barColor="hsl(var(--primary))"
            />
          </div>
        </section>

        {/* Scrolling Waveform */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Scrolling Animation</h2>
          <div className="rounded-lg border bg-card p-6">
            <ScrollingWaveform
              height={80}
              speed={50}
              barCount={60}
              barColor="hsl(var(--primary))"
              fadeEdges={true}
            />
          </div>
        </section>

        {/* Generated Waveform */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Generated Patterns</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4 text-center">Pattern A</p>
              <StaticWaveform
                bars={40}
                seed={12345}
                height={80}
                barWidth={3}
                barGap={2}
              />
            </div>
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4 text-center">Pattern B</p>
              <StaticWaveform
                bars={40}
                seed={67890}
                height={80}
                barWidth={3}
                barGap={2}
              />
            </div>
          </div>
        </section>

        {/* Live Microphone */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Live Microphone Input</h2>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isListening ? "Listening to your microphone..." : "Click Start to begin"}
              </p>
              <Button
                onClick={() => setIsListening(!isListening)}
                variant={isListening ? "destructive" : "default"}
              >
                {isListening ? "Stop" : "Start"} Listening
              </Button>
            </div>
            <MicrophoneWaveform
              active={isListening}
              height={120}
              sensitivity={1.5}
              barWidth={4}
              barGap={2}
              onError={(error) => {
                console.error("Microphone error:", error);
                setIsListening(false);
              }}
            />
          </div>
        </section>

        {/* Color Variations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Color Variations</h2>
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">Primary Color</p>
              <ScrollingWaveform
                height={60}
                barColor="hsl(var(--primary))"
                speed={40}
              />
            </div>
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">Green</p>
              <ScrollingWaveform
                height={60}
                barColor="#10B981"
                speed={40}
              />
            </div>
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">Purple</p>
              <ScrollingWaveform
                height={60}
                barColor="#A855F7"
                speed={40}
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Voice Recordings</h3>
              <p className="text-sm text-muted-foreground">
                Visualize patient voice recordings for telemedicine consultations
                and symptom descriptions
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Audio Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Show real-time microphone levels during virtual support groups
                and counseling sessions
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Educational Content</h3>
              <p className="text-sm text-muted-foreground">
                Display audio levels for educational videos and training materials
                for healthcare workers
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About Waveform Components</h3>
          <p className="text-sm text-muted-foreground">
            The waveform components use HTML5 Canvas for high-performance rendering
            of audio visualizations. They support static data display, real-time
            microphone input, and smooth scrolling animations - perfect for voice
            interfaces, audio playback, and interactive media applications.
          </p>
        </div>
      </div>
    </div>
  );
}

