'use client';

import React, { useState, useRef, useEffect } from 'react';
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

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function CounselorAIChatPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(false); // Control sidebar visibility on mobile
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

  if (!user) return null;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const greeting = `Good ${getTimeGreeting()} ${user.name || 'User'}!`;
  const assistantMessage = 'How can I assist you today?';

  const handleSend = (messageText: string, files?: File[]) => {
    console.log('Message:', messageText);
    console.log('Files:', files);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate streaming AI response
    const responseText = 'This is a **sample AI response** for counselors with some formatting. Your actual AI integration will go here. It can include `code snippets` and *emphasized text*.';
    const words = responseText.split(' ');
    let currentContent = '';
    let wordIndex = 0;
    
    const aiMessageId = (Date.now() + 1).toString();
    
    // Add empty AI message first
    const initialAiMessage: Message = {
      id: aiMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialAiMessage]);
    
    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentContent += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        wordIndex++;
        
        // Update the AI message content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: currentContent }
            : msg
        ));
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
      }
    }, 50); // Stream one word every 50ms
  };

  const handleSubmit = () => {
    if (message.trim()) {
      const messageToSend = message;
      setMessage('');
      handleSend(messageToSend);
    }
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowSidebar(false);
    console.log('Selected thread:', threadId);
  };

  const handleNewThread = () => {
    setActiveThreadId(undefined);
    setShowSidebar(false);
    console.log('Creating new thread');
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] flex flex-col md:flex-row">
      {/* Desktop Chat Threads Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <ChatThreadsSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={(id) => setActiveThreadId(id)}
          onNewThread={() => setActiveThreadId(undefined)}
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
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <Response className="text-sm sm:text-base prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {msg.content}
                        </Response>
                      ) : (
                        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>
                    <p className={`text-xs mt-1 mx-2 ${
                      msg.sender === 'user' ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                ))}
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
                onClick={() => setMessage('What are the latest counseling techniques for cancer patients?')}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Latest counseling techniques?
              </button>
              <button
                onClick={() => setMessage('How can I best support my patients mental health?')}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Best practices for patient support?
              </button>
              <button
                onClick={() => setMessage('What documentation should I maintain for patient sessions?')}
                className="px-3 sm:px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation"
                disabled={isLoading}
              >
                Documentation guidelines
              </button>
            </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }} className="w-full">
              <PromptBox 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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