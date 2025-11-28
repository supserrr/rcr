"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@workspace/ui/lib/utils';
import { Smile } from 'lucide-react';

export interface ReactionPickerProps {
  /**
   * Current reactions on the message {reaction: [userId1, userId2, ...]}
   */
  reactions?: Record<string, string[]>;
  /**
   * Current user ID to check if they've reacted
   */
  currentUserId?: string;
  /**
   * Callback when a reaction is added or removed
   */
  onReaction?: (reaction: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Common reactions (text-based)
 */
const COMMON_REACTIONS = ['like', 'love', 'laugh', 'wow', 'sad', 'pray'];

/**
 * ReactionPicker component
 * 
 * Displays message reactions and allows users to add/remove reactions.
 * Shows a popover with reaction picker when clicking the reaction button.
 */
export function ReactionPicker({
  reactions = {},
  currentUserId,
  onReaction,
  className,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (reaction: string) => {
    onReaction?.(reaction);
    setIsOpen(false);
  };

  // Get all unique reactions that have reactions
  const reactedReactions = Object.keys(reactions).filter(
    (reaction) => reactions[reaction] && reactions[reaction].length > 0
  );

  // Check if current user has reacted with any reaction
  const userHasReacted = currentUserId
    ? reactedReactions.some((reaction) => reactions[reaction]?.includes(currentUserId))
    : false;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Display existing reactions */}
      {reactedReactions.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {reactedReactions.map((reaction) => {
            const userIds = reactions[reaction] || [];
            const count = userIds.length;
            const hasUserReacted = currentUserId ? userIds.includes(currentUserId) : false;

            return (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                  "hover:bg-muted/80 border",
                  hasUserReacted
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-transparent text-muted-foreground"
                )}
                title={`${count} reaction${count !== 1 ? 's' : ''}`}
              >
                <span>{reaction}</span>
                <span className="text-[10px] font-medium">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-full",
              userHasReacted && "bg-primary/10 text-primary"
            )}
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex items-center gap-1">
            {COMMON_REACTIONS.map((reaction) => {
              const userIds = reactions[reaction] || [];
              const hasUserReacted = currentUserId ? userIds.includes(currentUserId) : false;

              return (
                <button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className={cn(
                    "h-8 px-2 rounded-md text-xs transition-colors flex items-center justify-center",
                    "hover:bg-muted",
                    hasUserReacted && "bg-primary/10"
                  )}
                  title={hasUserReacted ? 'Remove reaction' : 'Add reaction'}
                >
                  {reaction}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

