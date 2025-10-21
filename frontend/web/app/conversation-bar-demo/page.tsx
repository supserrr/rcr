'use client';

import { ConversationBar } from "@workspace/ui/components/ui/conversation-bar";
import { useState } from "react";

/**
 * Demo page showcasing the ElevenLabs Conversation Bar component.
 *
 * This page demonstrates a complete voice conversation interface with:
 * - WebRTC voice communication
 * - Real-time waveform visualization
 * - Text input with contextual updates
 * - Microphone controls
 * - Connection state management
 *
 * @returns Conversation Bar demo page
 */
export default function ConversationBarDemoPage() {
  const [agentId, setAgentId] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Conversation Bar Demo</h1>
          <p className="text-muted-foreground">
            Complete voice conversation interface with microphone controls and real-time waveform
          </p>
        </div>

        {/* Agent ID Setup */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Setup</h2>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div>
              <label htmlFor="agentId" className="block text-sm font-medium mb-2">
                ElevenLabs Agent ID
              </label>
              <input
                id="agentId"
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter your agent ID here"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Create an agent at{" "}
                <a
                  href="https://elevenlabs.io/agents"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  elevenlabs.io/agents
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowDemo(true)}
              disabled={!agentId}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Conversation Bar
            </button>
          </div>
        </section>

        {/* Demo */}
        {showDemo && agentId && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Live Demo</h2>
            <div className="rounded-lg border bg-card p-6">
              <ConversationBar
                agentId={agentId}
                onConnect={() => console.log("Connected to agent")}
                onDisconnect={() => console.log("Disconnected from agent")}
                onMessage={(message) => console.log("Message:", message)}
                onError={(error) => console.error("Error:", error)}
              />
            </div>
          </section>
        )}

        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Voice Input</h3>
              <p className="text-sm text-muted-foreground">
                Connect to ElevenLabs agents via WebRTC for real-time voice conversations
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Text Input</h3>
              <p className="text-sm text-muted-foreground">
                Expandable keyboard input with contextual updates sent to the agent
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Live Waveform</h3>
              <p className="text-sm text-muted-foreground">
                Real-time audio visualization during active conversations
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Microphone Controls</h3>
              <p className="text-sm text-muted-foreground">
                Mute/unmute toggle with clear visual feedback for users
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Patient Helpline</h3>
              <p className="text-sm text-muted-foreground">
                24/7 AI-powered voice support for patient questions about
                symptoms, appointments, and treatment
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Symptom Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Voice-based initial screening questionnaire to identify
                potential concerns requiring medical attention
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-primary">Multi-language Support</h3>
              <p className="text-sm text-muted-foreground">
                Voice interface in Kinyarwanda, French, and English for
                broader community accessibility
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About Conversation Bar</h3>
          <p className="text-sm text-muted-foreground">
            The Conversation Bar component provides a complete voice interface for
            ElevenLabs agents. It handles WebRTC connections, microphone permissions,
            real-time audio streaming, and waveform visualization - all in one
            beautiful, production-ready component. Perfect for creating voice-enabled
            support systems and interactive health assistants.
          </p>
        </div>
      </div>
    </div>
  );
}

