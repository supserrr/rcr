"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { ReactionPicker } from './reaction-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import {
  CheckCircle,
  Check,
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Reply,
  Trash2,
} from 'lucide-react';

/**
 * Message type (matches ChatApi Message interface)
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  reactions?: Record<string, string[]>;
  replyTo?: Message;
  replyToId?: string;
  editedAt?: string;
  deletedAt?: string;
}

export interface MessageBubbleProps {
  /**
   * The message to display
   */
  message: Message;
  /**
   * Whether this message was sent by the current user
   */
  isOwn: boolean;
  /**
   * Sender information
   */
  senderInfo?: {
    name?: string;
    avatar?: string;
  };
  /**
   * Current user ID
   */
  currentUserId?: string;
  /**
   * Whether to show date separator
   */
  showDateSeparator?: boolean;
  /**
   * Date separator text (e.g., "Today", "Yesterday", "Jan 15, 2025")
   */
  dateSeparator?: string;
  /**
   * Callback when user wants to reply to this message
   */
  onReply?: (message: Message) => void;
  /**
   * Callback when user reacts to this message
   */
  onReact?: (messageId: string, emoji: string) => void;
  /**
   * Callback when user wants to edit this message
   */
  onEdit?: (message: Message) => void;
  /**
   * Callback when user wants to delete this message
   */
  onDelete?: (messageId: string) => void;
  /**
   * Callback when user copies the message
   */
  onCopy?: (content: string) => void;
  /**
   * Message status: 'sending' | 'sent' | 'delivered' | 'read'
   */
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MessageBubble component
 * 
 * Displays a single message in a chat with all features:
 * - Date separators
 * - Hover timestamps
 * - Read receipts
 * - Message status indicators
 * - Reply preview
 * - Reactions
 * - Edit/delete indicators
 * - Message actions menu
 * - Avatar display
 */
export function MessageBubble({
  message,
  isOwn,
  senderInfo,
  currentUserId,
  showDateSeparator = false,
  dateSeparator,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onCopy,
  status,
  className,
}: MessageBubbleProps) {
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isDeleted = !!message.deletedAt;
  const isEdited = !!message.editedAt;
  const hasReply = !!message.replyTo || !!message.replyToId;

  const handleCopy = () => {
    if (message.content && !isDeleted) {
      navigator.clipboard.writeText(message.content);
      onCopy?.(message.content);
    }
  };

  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    if (status === 'sending') {
      return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
    }

    if (status === 'read') {
      return <CheckCircle className="h-3 w-3 text-primary" />;
    }

    if (status === 'delivered') {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-muted-foreground" />
          <CheckCircle className="h-3 w-3 text-muted-foreground -ml-1" />
        </div>
      );
    }

    // Default: sent
    return (
      <div className="flex items-center">
        <Check className="h-3 w-3 text-muted-foreground" />
        <Check className="h-3 w-3 text-muted-foreground -ml-1" />
      </div>
    );
  };

  return (
    <div
      className={cn("flex flex-col", isOwn ? 'items-end' : 'items-start', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Date Separator */}
      {showDateSeparator && dateSeparator && (
        <div className="w-full flex items-center justify-center my-4">
          <div className="px-3 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground">
            {dateSeparator}
          </div>
        </div>
      )}

      <div className={cn("flex items-end gap-2 max-w-[70%]", isOwn && 'flex-row-reverse')}>
        <div className={cn("flex flex-col", isOwn ? 'items-end' : 'items-start')}>

          {/* Reply Preview */}
          {hasReply && (message.replyTo || message.replyToId) && (
            <div
              className={cn(
                "mb-1 px-3 py-2 rounded-lg border-l-2 text-xs max-w-full backdrop-blur-sm",
                isOwn
                  ? "bg-muted/40 dark:bg-muted/40 border-muted-foreground/30 text-muted-foreground"
                  : "bg-primary/20 dark:bg-primary/30 border-primary/40 text-primary-foreground/80"
              )}
            >
              {message.replyTo ? (
                <>
                  <div className="font-medium mb-1">
                    {message.replyTo.senderName || 'User'}
                  </div>
                  <div className="truncate">
                    {message.replyTo.deletedAt
                      ? 'This message was deleted'
                      : message.replyTo.content}
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">Replying to a message</div>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={cn(
              "group relative rounded-lg px-3 py-2 backdrop-blur-sm",
              isOwn
                ? "bg-slate-100/90 dark:bg-muted/90 text-slate-900 dark:text-foreground border border-slate-200/70 dark:border-border/70 shadow-sm"
                : "bg-primary/90 dark:bg-primary/95 text-primary-foreground backdrop-blur-sm",
              isDeleted && "opacity-60"
            )}
          >
            {/* Message Actions Menu (shown on hover) */}
            {isHovered && !isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "absolute -top-8 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      isOwn ? "right-0" : "left-0"
                    )}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onReact && (
                    <DropdownMenuItem onClick={() => handleReact('👍')}>
                      <span className="mr-2">👍</span>
                      React
                    </DropdownMenuItem>
                  )}
                  {isOwn && onEdit && !isDeleted && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(message)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </>
                  )}
                  {isOwn && onDelete && !isDeleted && (
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {isDeleted ? (
                <span className="italic text-muted-foreground">
                  This message was deleted
                </span>
              ) : (
                message.content
              )}
            </p>

            {/* Edit Indicator */}
            {isEdited && !isDeleted && (
              <span className="text-xs opacity-70 mt-1 block">(edited)</span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="mt-1">
              <ReactionPicker
                reactions={message.reactions}
                currentUserId={currentUserId}
                onReaction={handleReact}
              />
            </div>
          )}

          {/* Timestamp and Status */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-1",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
            onMouseEnter={() => setShowFullTimestamp(true)}
            onMouseLeave={() => setShowFullTimestamp(false)}
          >
            <span
              className={cn(
                "text-xs",
                isOwn ? "text-muted-foreground" : "text-primary/70"
              )}
              title={showFullTimestamp ? formatFullDate(message.createdAt) : undefined}
            >
              {formatTime(message.createdAt)}
            </span>
            {isOwn && renderStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}

