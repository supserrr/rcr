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
  FileText,
  MessageCircle,
  RefreshCw,
  BookOpen,
  Users,
  Calendar
} from 'lucide-react';

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function CounselorAIChatPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: "Hello Dr. Marie Claire! I'm your AI assistant for counseling support. I can help you with session planning, note templates, treatment strategies, and patient care guidance. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    "Session note templates",
    "Anxiety management techniques",
    "Family therapy approaches",
    "Patient progress tracking"
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
    
    if (message.includes('note') || message.includes('template')) {
      return "Here are some session note templates you can use:\n\n**Session Summary Template:**\n• Patient: [Name]\n• Date: [Date]\n• Session Type: Individual/Group\n• Key Topics Discussed:\n• Patient's Emotional State:\n• Interventions Used:\n• Homework/Assignments:\n• Next Session Goals:\n• Notes:\n\n**Progress Note Template:**\n• Progress since last session:\n• Challenges identified:\n• Coping strategies discussed:\n• Patient's response to interventions:\n• Recommendations for next session:\n\nWould you like me to customize any of these templates for specific situations?";
    }
    
    if (message.includes('anxiety') || message.includes('stress')) {
      return "Here are evidence-based anxiety management techniques for cancer patients:\n\n**Immediate Techniques:**\n• 4-7-8 Breathing Exercise\n• Progressive Muscle Relaxation\n• Grounding Techniques (5-4-3-2-1)\n• Mindfulness Meditation\n\n**Long-term Strategies:**\n• Cognitive Behavioral Therapy (CBT)\n• Exposure Therapy for treatment fears\n• Relaxation Training\n• Stress Inoculation Training\n\n**For Your Sessions:**\n• Start with breathing exercises\n• Use guided imagery\n• Practice mindfulness together\n• Assign daily practice homework\n\nWould you like detailed instructions for any of these techniques?";
    }
    
    if (message.includes('family') || message.includes('therapy')) {
      return "Family therapy approaches for cancer patients:\n\n**Key Principles:**\n• Open communication about diagnosis\n• Role adjustments and responsibilities\n• Emotional support systems\n• Future planning discussions\n\n**Session Structure:**\n1. Check-in with each family member\n2. Identify current challenges\n3. Practice communication exercises\n4. Develop family coping strategies\n5. Set family goals\n\n**Common Issues to Address:**\n• Overprotection vs. independence\n• Financial stress and planning\n• Caregiver burnout\n• Children's understanding and fears\n\n**Techniques:**\n• Family genogram mapping\n• Communication skills training\n• Problem-solving exercises\n• Ritual and tradition planning\n\nWould you like specific exercises for any of these areas?";
    }
    
    if (message.includes('progress') || message.includes('tracking')) {
      return "Patient progress tracking strategies:\n\n**Assessment Tools:**\n• PHQ-9 for depression screening\n• GAD-7 for anxiety assessment\n• Quality of Life scales\n• Treatment adherence tracking\n\n**Progress Indicators:**\n• Session attendance and engagement\n• Homework completion rates\n• Self-reported mood improvements\n• Coping skill utilization\n• Social support network strength\n\n**Documentation Methods:**\n• Weekly progress summaries\n• Goal achievement tracking\n• Symptom monitoring charts\n• Family feedback collection\n\n**Review Schedule:**\n• Weekly: Quick check-ins\n• Monthly: Comprehensive review\n• Quarterly: Treatment plan updates\n\nWould you like specific assessment tools or tracking templates?";
    }
    
    return "I'm here to support you in providing the best care for your patients. I can help with:\n\n• Session planning and structure\n• Evidence-based treatment approaches\n• Note templates and documentation\n• Patient assessment tools\n• Family therapy strategies\n• Crisis intervention techniques\n• Professional development resources\n\nWhat specific aspect of your counseling practice would you like to explore today?";
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
        title="AI Counseling Assistant"
        description="Get professional support for your counseling practice and patient care"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quick Questions Sidebar */}
        <div className="lg:col-span-1">
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Help
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

          {/* Professional Resources */}
          <AnimatedCard delay={0.6} className="mt-4">
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Professional Resources
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Evidence-Based</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Access to latest research, treatment protocols, and best practices in oncology psychology.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Treatment protocols</p>
                <p>• Assessment tools</p>
                <p>• Intervention strategies</p>
                <p>• Professional development</p>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      AI Counseling Assistant
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Professional
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your professional support for evidence-based counseling
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
                            : 'bg-gradient-to-br from-green-500 to-blue-600 text-white'
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
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
                    placeholder="Ask about treatment approaches, session planning, or patient care..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <FileText className="h-3 w-3 inline mr-1" />
                Professional guidance for evidence-based counseling practice.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
