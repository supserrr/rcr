"use client"

import React, { useState } from "react"
import { AIChatInput } from "./ai-chat-input"
import { Orb } from "./ui/orb"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

export function AIChatDemo() {
  const [agentState, setAgentState] = useState<"thinking" | "listening" | "talking" | null>(null)
  const [orbColors, setOrbColors] = useState<[string, string]>(["#FF6B6B", "#4ECDC4"])

  const colorPresets = [
    ["#FF6B6B", "#4ECDC4"],
    ["#CADCFC", "#A0B9D1"],
    ["#FF9A9E", "#FECFEF"],
    ["#A8EDEA", "#FED6E3"],
    ["#D299C2", "#FED6E3"]
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Chat Components Demo
          </h1>
          <p className="text-xl text-gray-600">
            Interactive components for modern AI chat interfaces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orb Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                3D Animated Orb
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Orb Display */}
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Orb 
                  colors={orbColors}
                  agentState={agentState}
                  className="w-full h-full"
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Agent State</h4>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { state: null, label: "Idle" },
                      { state: "thinking", label: "Thinking" },
                      { state: "listening", label: "Listening" },
                      { state: "talking", label: "Talking" }
                    ].map(({ state, label }) => (
                      <Button
                        key={label}
                        variant={agentState === state ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAgentState(state as "thinking" | "listening" | "talking" | null)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Color Presets</h4>
                  <div className="flex gap-2 flex-wrap">
                    {colorPresets.map((colors, index) => (
                      <button
                        key={index}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                        style={{
                          background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`
                        }}
                        onClick={() => setOrbColors(colors as [string, string])}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Input Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full"></div>
                AI Chat Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Interactive chat input with animated placeholders and expandable controls.
                </p>
                
                {/* Chat Input */}
                <div className="bg-white rounded-lg p-4 border">
                  <AIChatInput />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Animated Placeholders",
                      "Expandable Controls", 
                      "Think Mode",
                      "Deep Search",
                      "Voice Input",
                      "File Attachments"
                    ].map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Full Interface Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
              Complete AI Chat Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src="/demo/ai-chat"
                className="w-full h-full border-0"
                title="AI Chat Interface Demo"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Full-screen demo available at <code className="bg-gray-100 px-2 py-1 rounded">/demo/ai-chat</code>
            </p>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Import Components</h4>
              <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`import { AIChatInput, Orb, AIChatInterface } from '@workspace/ui/components'`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Basic Usage</h4>
              <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`// Simple chat input
<AIChatInput />

// 3D orb with custom colors
<Orb colors={["#FF6B6B", "#4ECDC4"]} />

// Complete interface
<AIChatInterface userName="John" />`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Available Routes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-900">Patient AI Chat</h5>
                  <code className="text-blue-700 text-sm">/dashboard/patient/ai-chat</code>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-900">Counselor AI Chat</h5>
                  <code className="text-green-700 text-sm">/dashboard/counselor/ai-chat</code>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-purple-900">Demo Page</h5>
                  <code className="text-purple-700 text-sm">/demo/ai-chat</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
