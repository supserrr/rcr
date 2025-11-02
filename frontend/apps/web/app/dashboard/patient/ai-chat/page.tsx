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
import { ArrowLeft, Menu } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function PatientAIChatPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(true); // Control sidebar visibility on mobile

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
    const responseText = 'This is a **sample AI response** with some formatting. Your actual AI integration will go here. It can include `code snippets` and *emphasized text*.';
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
    setShowSidebar(false); // Hide sidebar on mobile when thread selected
    console.log('Selected thread:', threadId);
  };

  const handleNewThread = () => {
    setActiveThreadId(undefined);
    setShowSidebar(false); // Hide sidebar on mobile when new thread created
    console.log('Creating new thread');
  };

  return (
    <div className="relative w-full flex -m-6" style={{ height: 'calc(100vh - 8rem + 3rem)', minHeight: '600px' }}>
      {/* Chat Threads Sidebar */}
      <div className={`flex-shrink-0 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
        <ChatThreadsSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Back Button */}
        {!showSidebar && (
          <div className="lg:hidden px-4 py-2 border-b bg-sidebar">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className="h-10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Conversations
            </Button>
          </div>
        )}
        {/* Main Content Area */}
        <div className={`relative z-10 w-full flex flex-col items-center p-3 md:p-6 flex-1 overflow-hidden ${messages.length === 0 ? 'justify-center' : ''}`}>
          {/* Messages Display */}
          {messages.length > 0 ? (
            <div className="w-full max-w-4xl flex-1 flex flex-col items-center overflow-hidden pl-0 md:pl-12 mb-4">
              <ScrollArea className="w-full flex-1 min-h-0">
              <div className="space-y-4 pr-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-2 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <Response className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {msg.content}
                        </Response>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
            <div className={`w-full max-w-4xl flex flex-col items-center pl-0 md:pl-12 justify-center pt-8 md:pt-16`}>
            {/* Spiral Animation - Top */}
            <div className="flex justify-center items-center pb-8">
              <SpiralAnimation 
                totalDots={600}
                dotColor="#8B5CF6" // Cancer purple theme
                backgroundColor="transparent"
                duration={4}
                size={200}
                dotRadius={1.5}
              />
            </div>
            
            {/* Greeting Text - Below Spiral */}
            <div className="text-center space-y-1 pb-8 -mt-4">
              <h1 className="text-3xl font-bold text-foreground">
                {greeting}
              </h1>
              <p className="text-xl text-muted-foreground">
                {assistantMessage}
              </p>
            </div>
          </div>
          </>
          )}
          
          {/* Bottom Content - AI Prompt Box */}
          <div className={`w-full max-w-4xl pt-2 md:pt-4 pb-2 md:pb-4 pl-0 md:pl-12 ${messages.length > 0 ? 'mt-auto' : ''}`}>
            {/* Suggestion Chips */}
            {messages.length === 0 && (
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <button
                onClick={() => setMessage('What support resources are available for cancer patients?')}
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                What support resources are available?
              </button>
              <button
                onClick={() => setMessage('How can I find a counselor near me?')}
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                How can I find a counselor?
              </button>
              <button
                onClick={() => setMessage('Tell me about financial assistance programs')}
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                Tell me about financial assistance
              </button>
            </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}>
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