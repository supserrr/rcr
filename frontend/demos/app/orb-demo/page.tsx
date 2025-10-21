'use client';

import { Orb, AgentState } from "@workspace/ui/components/ui/orb";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

/**
 * Demo page showcasing the ElevenLabs Orb component.
 *
 * This page demonstrates the interactive 3D orb visualization with:
 * - Different agent states (idle, thinking, listening, talking)
 * - Custom color configurations
 * - Volume visualization modes
 * - Interactive state controls
 *
 * @returns ElevenLabs Orb demo page
 */
export default function OrbDemoPage() {
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [colors, setColors] = useState<[string, string]>(["#CADCFC", "#A0B9D1"]);

  const colorPresets = [
    { name: "Default Blue", colors: ["#CADCFC", "#A0B9D1"] as [string, string] },
    { name: "Purple", colors: ["#E0B0FF", "#B19CD9"] as [string, string] },
    { name: "Green", colors: ["#A8E6CF", "#7FB3D5"] as [string, string] },
    { name: "Red", colors: ["#FFB6B9", "#FEC5BB"] as [string, string] },
    { name: "Orange", colors: ["#FFD6A5", "#FFADAD"] as [string, string] },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">ElevenLabs Orb Demo</h1>
          <p className="text-muted-foreground">
            Interactive 3D visualization component for AI agents
          </p>
        </div>

        {/* Main Orb Display */}
        <div className="rounded-lg border bg-card p-8">
          <div className="h-[500px] w-full">
            <Orb
              colors={colors}
              agentState={agentState}
              volumeMode="manual"
              manualInput={0.5}
              manualOutput={0.7}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Agent State Controls */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Agent State</h2>
            <p className="text-sm text-muted-foreground">
              Control the visual state of the AI agent orb
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={agentState === null ? "default" : "outline"}
                onClick={() => setAgentState(null)}
                size="sm"
              >
                Idle
              </Button>
              <Button
                variant={agentState === "thinking" ? "default" : "outline"}
                onClick={() => setAgentState("thinking")}
                size="sm"
              >
                Thinking
              </Button>
              <Button
                variant={agentState === "listening" ? "default" : "outline"}
                onClick={() => setAgentState("listening")}
                size="sm"
              >
                Listening
              </Button>
              <Button
                variant={agentState === "talking" ? "default" : "outline"}
                onClick={() => setAgentState("talking")}
                size="sm"
              >
                Talking
              </Button>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">Current State:</p>
              <p className="text-lg font-bold text-primary">
                {agentState || "Idle"}
              </p>
            </div>
          </div>

          {/* Color Presets */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Color Themes</h2>
            <p className="text-sm text-muted-foreground">
              Choose a color scheme for the orb
            </p>
            <div className="space-y-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setColors(preset.colors)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex gap-1">
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: preset.colors[0] }}
                    />
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: preset.colors[1] }}
                    />
                  </div>
                  <span className="font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Use Cases for Rwanda Cancer Relief</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Voice Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Visual feedback for AI voice assistant helping patients with
                appointment scheduling and medical inquiries
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">AI Counselor</h3>
              <p className="text-sm text-muted-foreground">
                Engaging visualization for AI-powered emotional support and
                patient counseling sessions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Diagnostic Aid</h3>
              <p className="text-sm text-muted-foreground">
                Interactive interface for AI-assisted symptom analysis and
                preliminary health assessments
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold mb-2">About the Orb Component</h3>
          <p className="text-sm text-muted-foreground">
            The ElevenLabs Orb is a WebGL-based 3D visualization component built
            with React Three Fiber. It provides real-time visual feedback for AI
            agent states, making voice and chat interactions more engaging and
            intuitive. The orb responds dynamically to agent states (idle,
            thinking, listening, talking) and can visualize audio input/output
            levels for a more immersive conversational experience.
          </p>
        </div>
      </div>
    </div>
  );
}

