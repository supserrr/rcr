"use client"

import React from "react"

interface AIChatInputProps {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  disabled?: boolean
}

/**
 * Placeholder component for AI chat input
 */
export function AIChatInput({
  placeholder = "Type a message...",
  className = "",
  value = "",
  onChange,
  onSubmit,
  disabled = false,
}: AIChatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled) {
      onSubmit?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 focus:border-primary focus:outline-none text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  )
}
