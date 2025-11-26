"use client";

import React, { KeyboardEvent } from 'react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@workspace/ui/lib/utils';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import type { Message } from './message-bubble';

export interface MessageInputProps {
  /**
   * Current input value
   */
  value: string;
  /**
   * Callback when input value changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when message is sent
   */
  onSend: (content: string) => void;
  /**
   * Callback when user starts/stops typing (for typing indicators)
   */
  onTyping?: (isTyping: boolean) => void;
  /**
   * Message being replied to (if any)
   */
  replyTo?: Message | null;
  /**
   * Callback to cancel reply
   */
  onCancelReply?: () => void;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MessageInput component
 * 
 * Input component for sending messages in a chat.
 * Features:
 * - Reply preview
 * - Typing indicator integration
 * - Send button with proper states
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 */
export function MessageInput({
  value,
  onChange,
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type your message...",
  className,
}: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Only send on Enter key, not Shift+Enter (for new lines)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedValue = value.trim();
    // Only send if there's actual content and not disabled
    if (trimmedValue && trimmedValue.length > 0 && !disabled) {
      onSend(trimmedValue);
      onChange('');
      onTyping?.(false);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Notify typing status
    if (onTyping) {
      if (newValue.trim().length > 0) {
        onTyping(true);
      } else {
        onTyping(false);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border-l-2 border-primary/30">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-primary mb-1">
              Replying to {replyTo.senderName || 'User'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {replyTo.deletedAt ? 'This message was deleted' : replyTo.content}
            </div>
          </div>
          {onCancelReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 shrink-0"
          title="Attach file"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10 h-10"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            title="Add emoji"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
          }}
          disabled={!value.trim() || disabled}
          className="h-10 w-10 p-0 shrink-0"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

