'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Lightbulb,
  Heart,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function PatientAIChatPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant for Rwanda Cancer Relief. I'm here to help you with questions about your cancer journey, provide emotional support, and connect you with resources. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    "How can I manage anxiety?",
    "What are common side effects?",
    "How do I talk to my family?",
    "Where can I find support groups?"
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(newMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('anxiety') || message.includes('stress')) {
      return "I understand that anxiety is a common experience during cancer treatment. Here are some strategies that might help:\n\n• Practice deep breathing exercises\n• Try mindfulness meditation\n• Stay connected with your support network\n• Consider speaking with your counselor about specific techniques\n\nWould you like me to share some guided breathing exercises or connect you with resources for managing anxiety?";
    }
    
    if (message.includes('side effect') || message.includes('treatment')) {
      return "Side effects can vary depending on your specific treatment. Common ones include:\n\n• Fatigue and weakness\n• Nausea and appetite changes\n• Hair loss (with chemotherapy)\n• Skin changes\n• Emotional changes\n\nIt's important to communicate any side effects with your healthcare team. They can help manage them effectively. Would you like information about specific side effects or coping strategies?";
    }
    
    if (message.includes('family') || message.includes('support')) {
      return "Talking to family about your cancer journey can be challenging but important. Here are some tips:\n\n• Choose a comfortable time and place\n• Be honest about your feelings\n• Let them know how they can help\n• Consider family counseling sessions\n• Remember it's okay to set boundaries\n\nWould you like me to suggest some conversation starters or connect you with family support resources?";
    }
    
    if (message.includes('support group') || message.includes('community')) {
      return "Support groups can be incredibly helpful during your cancer journey. Rwanda Cancer Relief offers:\n\n• Online support groups\n• Peer mentoring programs\n• Family support sessions\n• Specialized groups for different cancer types\n\nI can help you find a group that matches your needs and schedule. Would you like me to show you available options?";
    }
    
    return "Thank you for sharing that with me. I'm here to support you through your cancer journey. While I can provide general information and emotional support, I always recommend discussing specific medical concerns with your healthcare team.\n\nIs there anything specific about your treatment, emotional well-being, or support resources that I can help you with today?";
  };

  const handleQuickQuestion = (question: string) => {
    setNewMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="AI Assistant"
        description="Get instant support and answers to your questions about your cancer journey"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quick Questions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Questions
              </h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => handleQuickQuestion(question)}
                >
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </AnimatedCard>

          {/* AI Info Card */}
          <AnimatedCard delay={0.6}>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4" />
                About Your AI Assistant
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">24/7 Available</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                I'm here to provide emotional support, answer questions about your cancer journey, and connect you with helpful resources.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>• General information and support</p>
                <p>• Emotional guidance</p>
                <p>• Resource recommendations</p>
                <p>• Connection to human counselors</p>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <AnimatedCard delay={0.7} className="h-[600px] flex flex-col">
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      AI Assistant
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your personal cancer support companion
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        }`}>
                          {message.isUser ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ask me anything about your cancer journey..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Heart className="h-3 w-3 inline mr-1" />
                Remember: I'm here to support you, but always consult your healthcare team for medical advice.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
