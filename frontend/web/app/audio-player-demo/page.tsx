'use client';

import {
  AudioPlayerButton,
  AudioPlayerDuration,
  AudioPlayerProgress,
  AudioPlayerProvider,
  AudioPlayerSpeed,
  AudioPlayerTime,
} from "@workspace/ui/components/ui/audio-player";

/**
 * Demo page showcasing the ElevenLabs Audio Player component.
 *
 * This page demonstrates audio playback controls including:
 * - Play/pause controls
 * - Progress bar with seeking
 * - Current time and duration display
 * - Playback speed control
 * - Multiple track management
 *
 * @returns Audio Player demo page
 */
export default function AudioPlayerDemoPage() {
  const tracks = [
    {
      id: "1",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      data: { title: "Cancer Awareness Podcast Episode 1", artist: "Rwanda Cancer Relief" }
    },
    {
      id: "2",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      data: { title: "Patient Success Stories", artist: "Rwanda Cancer Relief" }
    },
    {
      id: "3",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      data: { title: "Treatment Options Explained", artist: "Dr. Sarah K." }
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Audio Player Demo</h1>
          <p className="text-muted-foreground">
            Customizable audio player for podcasts, educational content, and voice recordings
          </p>
        </div>

        <AudioPlayerProvider>
          {/* Simple Player */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Simple Player</h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <AudioPlayerButton />
                <AudioPlayerProgress className="flex-1" />
                <AudioPlayerTime />
                <span className="text-sm text-muted-foreground">/</span>
                <AudioPlayerDuration />
              </div>
            </div>
          </section>

          {/* Player with Speed Control */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Player with Speed Control</h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <AudioPlayerButton />
                <AudioPlayerTime />
                <AudioPlayerProgress className="flex-1" />
                <AudioPlayerDuration />
                <AudioPlayerSpeed />
              </div>
            </div>
          </section>

          {/* Multiple Tracks */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Multiple Tracks</h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                    <AudioPlayerButton item={track} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.data.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.data.artist}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <AudioPlayerProgress className="w-full mb-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <AudioPlayerTime />
                      <span>/</span>
                      <AudioPlayerDuration />
                    </div>
                    <AudioPlayerSpeed variant="ghost" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Use Cases for Rwanda Cancer Relief</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <h3 className="font-semibold text-primary">Educational Podcasts</h3>
                <p className="text-sm text-muted-foreground">
                  Host audio content about cancer prevention, early detection methods,
                  and treatment options in multiple languages
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <h3 className="font-semibold text-primary">Patient Testimonials</h3>
                <p className="text-sm text-muted-foreground">
                  Share inspiring stories from cancer survivors and patients currently
                  undergoing treatment
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <h3 className="font-semibold text-primary">Medical Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Provide audio instructions for medication, post-treatment care,
                  and symptom management
                </p>
              </div>
            </div>
          </section>
        </AudioPlayerProvider>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About the Audio Player</h3>
          <p className="text-sm text-muted-foreground">
            The ElevenLabs Audio Player provides a complete audio playback solution with
            progress tracking, speed control, and multi-track support. It handles buffering
            states, network errors, and provides smooth seeking functionality for an
            excellent user experience.
          </p>
        </div>
      </div>
    </div>
  );
}

