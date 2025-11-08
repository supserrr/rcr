"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface ShimmeringTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
}

const ShimmeringText = React.forwardRef<HTMLDivElement, ShimmeringTextProps>(
  ({ className, text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        <span className="opacity-0">{text}</span>
        <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    )
  }
)
ShimmeringText.displayName = "ShimmeringText"

export { ShimmeringText }

