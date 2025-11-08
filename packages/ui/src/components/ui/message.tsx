"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: "user" | "assistant"
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex w-full gap-4 py-4",
          "data-[state=streaming]:animate-pulse",
          className
        )}
        {...props}
      />
    )
  }
)
Message.displayName = "Message"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 space-y-2 min-w-0", className)}
      {...props}
    />
  )
})
MessageContent.displayName = "MessageContent"

export { Message, MessageContent }

