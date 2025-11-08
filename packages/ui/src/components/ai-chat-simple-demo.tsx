"use client"

import React from "react"
import { X } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./button"

interface AIChatSimpleDemoProps {
  onClose?: () => void
}

/**
 * Placeholder component for AI chat interface
 * This is a temporary component that will be replaced with a full implementation
 */
export function AIChatSimpleDemo({ onClose }: AIChatSimpleDemoProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background border border-border hover:bg-primary/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Placeholder content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              AI Chat Coming Soon
            </h2>
            <p className="text-muted-foreground mb-6">
              The AI chat interface is under development. This is a placeholder
              component.
            </p>
            {onClose && (
              <Button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90"
              >
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
