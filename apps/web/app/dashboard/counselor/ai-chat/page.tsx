'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { SpiralAnimation } from '@/components/ui/spiral-animation';
import { PromptBox } from '@workspace/ui/components/ui/chatgpt-prompt-input';
import { ChatThreadsSidebar } from '../../../../components/dashboard/shared/ChatThreadsSidebar';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { MessageLoading } from '@workspace/ui/components/ui/message-loading';
import { Response } from '@/components/ui/response';
import { Button } from '@workspace/ui/components/button';
import { Sheet, SheetContent, SheetTitle } from '@workspace/ui/components/sheet';
import { Menu } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

type AiThread = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  archived?: boolean;
};

export default function CounselorAIChatPage() {
  const { user } = useAuth();
  const defaultThreads = useMemo<AiThread[]>(() => [
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      lastMessage: 'Ask the assistant anything about supporting patients.',
      timestamp: new Date(),
      unreadCount: 0,
    },
    {
      id: 'case-prep',
      title: 'Case Prep Notes',
      lastMessage: 'Review questions for upcoming session.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      unreadCount: 0,
    },
    {
      id: 'resource-planner',
      title: 'Resource Planner',
      lastMessage: 'Generate follow-up resources for patients.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      unreadCount: 2,
    },
  ], []);

  const [threads, setThreads] = useState<AiThread[]>(defaultThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(defaultThreads[0]?.id ?? 'ai-assistant');
  const [showSidebar, setShowSidebar] = useState(false); // Control sidebar visibility on mobile
  const [input, setInput] = useState('');

  // Use the AI SDK's useChat hook
  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        model: 'gpt-4',
        webSearch: false,
      },
    }),
    onError: (error) => {
      console.error('AI Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const updateThreadPreview = useCallback((threadId: string, preview: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessage: preview,
              timestamp: new Date(),
              unreadCount: 0,
            }
          : thread
      )
    );
  }, []);

  const extractMessageText = useCallback((message: any) => {
    if (!message) return '';
    if (Array.isArray(message.parts)) {
      return message.parts
        .map((part: any) => {
          if (!part) return '';
          if (typeof part === 'string') return part;
          if ('text' in part && typeof part.text === 'string') return part.text;
          return '';
        })
        .join('')
        .trim();
    }
    if (typeof message.content === 'string') {
      return message.content;
    }
    if (Array.isArray(message.content)) {
      return message.content.join(' ');
    }
    return '';
  }, []);

  const handleChatSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const messageText = input.trim();
    setInput('');
    sendMessage({ text: messageText });
    updateThreadPreview(activeThreadId, messageText);
  };

  const append = (message: { role: 'user' | 'assistant'; content: string }) => {
    if (message.role === 'user') {
      setInput(message.content);
      sendMessage({ text: message.content });
      updateThreadPreview(activeThreadId, message.content);
    } else {
      setMessages(prev => [...prev, message as any]);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    const timer = setTimeout(() => {
      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    const preview = extractMessageText(lastMessage);
    if (!preview) return;
    updateThreadPreview(activeThreadId, preview);
  }, [messages, activeThreadId, extractMessageText, updateThreadPreview]);

  if (!user) return null;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const greeting = `Good ${getTimeGreeting()} ${user.name || 'User'}!`;
  const assistantMessage = 'How can I assist you today?';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (input.trim()) {
      handleChatSubmit(e as any);
    }
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowSidebar(false);
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
      )
    );
    setMessages([]);
    setInput('');
  };

  const handleNewThread = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: AiThread = {
      id: newId,
      title: `Conversation ${threads.length + 1}`,
      lastMessage: 'Describe how I can support a patient...',
      timestamp: new Date(),
      unreadCount: 0,
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setShowSidebar(false);
    setMessages([]);
    setInput('');
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] flex flex-col md:flex-row">
      {/* Desktop Chat Threads Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <ChatThreadsSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          threads={threads}
          emptyStateTitle="No conversations yet"
          emptyStateDescription="Start a new thread to plan your next counseling session."
        />
      </div>

      {/* Mobile Sheet Drawer */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-80 p-0 gap-0 overflow-hidden">
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          <div className="h-full w-full">
            <ChatThreadsSidebar
              activeThreadId={activeThreadId}
              onThreadSelect={handleThreadSelect}
              onNewThread={handleNewThread}
              threads={threads}
              emptyStateTitle="No conversations yet"
              emptyStateDescription="Start a new thread to plan your next counseling session."
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Toggle */}
        <div className="lg:hidden px-2 pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="h-7 w-7"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        {/* Main Content Area */}
        <div className={`relative z-10 w-full flex flex-col items-center flex-1 overflow-hidden ${messages.length === 0 ? 'justify-center p-2 sm:p-3 md:p-6' : 'p-2 sm:p-3 md:p-6'}`}>
          {/* Messages Display */}
          {messages.length > 0 ? (
            <div className="w-full max-w-4xl flex-1 flex flex-col items-center overflow-hidden mb-4">
              <ScrollArea className="w-full flex-1 min-h-0">
              <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <Response className="text-sm sm:text-base prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {msg.parts.map((part: any, idx: number) => 
                            part.type === 'text' ? part.text : 
                            part.type === 'reasoning' ? part.text :
                            JSON.stringify(part)
                          ).join('')}
                        </Response>
                      ) : (
                        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                          {msg.parts.map((part: any, idx: number) => 
                            part.type === 'text' ? part.text : 
                            part.type === 'reasoning' ? part.text :
                            JSON.stringify(part)
                          ).join('')}
                        </p>
                      )}
                    </div>
                    <p className={`text-xs mt-1 mx-2 ${
                      msg.role === 'user' ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2.5 sm:p-3 bg-primary/10 text-primary border border-primary/20">
                      <MessageLoading />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          ) : (
          <>
            {/* Top Content - Spiral and Text (shown when no messages) */}
            <div className={`w-full max-w-4xl flex flex-col items-center justify-center pt-4 sm:pt-8 md:pt-16`}>
            {/* Spiral Animation - Top */}
            <div className="flex justify-center items-center pb-6 sm:pb-8">
              <SpiralAnimation 
                totalDots={600}
                dotColor="#8B5CF6" // Purple to match patient
                backgroundColor="transparent"
                duration={4.5}
                size={150}
                dotRadius={1.5}
              />
            </div>
            
            {/* Greeting Text - Below Spiral */}
            <div className="text-center space-y-1 pb-6 sm:pb-8 -mt-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground px-4">
                {greeting}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground px-4">
                {assistantMessage}
              </p>
            </div>
          </div>
          </>
          )}
          
          {/* Bottom Content - AI Prompt Box */}
          <div className={`w-full max-w-4xl pt-2 sm:pt-4 pb-2 sm:pb-4 ${messages.length > 0 ? 'mt-auto' : ''}`}>
            {/* Suggestion Chips */}
            {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-3 sm:mb-4 px-2">
              <button
                onClick={() => append({ role: 'user', content: 'What are the latest counseling techniques for cancer patients?' })}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Latest counseling techniques?
              </button>
              <button
                onClick={() => append({ role: 'user', content: 'How can I best support my patients mental health?' })}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Best practices for patient support?
              </button>
              <button
                onClick={() => append({ role: 'user', content: 'What documentation should I maintain for patient sessions?' })}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Documentation guidelines
              </button>
            </div>
            )}
            
            <form onSubmit={handleSubmit} className="w-full">
              <PromptBox 
                value={input}
                onChange={(e) => handleInputChange(e)}
                onSubmit={handleSubmit}
                placeholder="Type your message here..."
                disabled={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}