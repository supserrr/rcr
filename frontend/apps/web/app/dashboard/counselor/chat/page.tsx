'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/ui/dropdown-menu';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  Archive,
  Trash2,
  Bell,
  BellOff,
  User,
  Calendar,
  FileText,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { dummyChats, dummyMessages, dummyPatients, dummyCounselors } from '../../../../lib/dummy-data';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';

export default function CounselorChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(dummyChats[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const currentCounselor = dummyCounselors[0]; // Dr. Marie Uwimana
  const [showConversations, setShowConversations] = useState(true);

  // Check for chatId in URL query params on mount
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      // Check if chat exists
      const chat = dummyChats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chatId);
        // Clean up the URL query parameter
        router.replace('/dashboard/counselor/chat', { scroll: false });
      }
    }
  }, [searchParams, router]);

  const activeChat = dummyChats.find(chat => chat.id === selectedChat);
  const activeMessages = dummyMessages.filter(msg => 
    activeChat?.participants.includes(msg.senderId) && 
    activeChat?.participants.includes(msg.receiverId)
  );

  const getPatientInfo = (patientId: string) => {
    return dummyPatients.find(p => p.id === patientId);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewPatientProfile = () => {
    setIsProfileOpen(true);
  };

  const handleScheduleSession = () => {
    if (activeChat) {
      const patientId = activeChat.participants.find((id: string) => id !== '2');
      const patient = getPatientInfo(patientId || '');
      if (patient) {
        setSelectedPatient(patient);
        setIsScheduleOpen(true);
      } else {
        alert('Patient information not found');
      }
    } else {
      alert('Please select a conversation first');
    }
  };

  const handleFlagPatient = () => {
    console.log('Flag patient for follow-up');
    if (confirm('Flag this patient for follow-up?')) {
      alert('Patient flagged for follow-up');
    }
  };

  const handleArchiveChat = () => {
    console.log('Archive chat');
    if (confirm('Are you sure you want to archive this conversation?')) {
      alert('Conversation archived');
    }
  };

  const handleDeleteChat = () => {
    console.log('Delete chat');
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      alert('Conversation deleted');
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    console.log('Toggle notifications:', !isNotificationsEnabled);
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all conversations as read');
    // In a real app, this would update the unread count for all chats
    alert('All conversations marked as read');
  };

  const handleFilterConversations = () => {
    console.log('Opening conversation filter');
    // In a real app, this would open a filter modal or toggle filter options
    alert('Filter conversations feature coming soon');
  };

  const handleArchiveAll = () => {
    console.log('Archiving all conversations');
    // In a real app, this would archive all conversations
    if (confirm('Are you sure you want to archive all conversations?')) {
      alert('All conversations archived');
    }
  };

  const handleConfirmSchedule = async (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => {
    try {
      // In a real app, this would make an API call to create the session
      console.log('Scheduling session:', sessionData);
      
      // Show success message
      alert('Session scheduled successfully! Patient has been notified.');
      
      // Close modal
      setIsScheduleOpen(false);
      setSelectedPatient(null);
      
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Failed to schedule session. Please try again.');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatedPageHeader
        title="Patient Messages"
        description="Communicate with your patients and provide ongoing support"
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-4 h-[calc(100vh-280px)] md:h-[600px]">
        {/* Chat List */}
        <div className={`lg:col-span-1 ${showConversations ? 'block' : 'hidden lg:block'}`}>
          <AnimatedCard delay={0.5} className="h-full flex flex-col">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-semibold">Patient Conversations</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                      <MoreVertical className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg z-[100]">
                    <DropdownMenuItem 
                      onClick={handleMarkAllAsRead}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-foreground">Mark all as read</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleFilterConversations}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-foreground">Filter conversations</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleArchiveAll}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                    >
                      <Archive className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-foreground">Archive all</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {dummyChats.map((chat) => {
                     const patientId = chat.participants.find((id: string) => id !== '2'); // Exclude counselor ID
                    const patient = getPatientInfo(patientId || '');
                    
                    return (
                      <div
                        key={chat.id}
                        className={`p-2 md:p-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 border-b group ${
                          selectedChat === chat.id ? 'bg-muted dark:bg-muted/50' : ''
                        }`}
                        onClick={() => {
                          setSelectedChat(chat.id);
                          setShowConversations(false);
                        }}
                      >
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarImage src={patient?.avatar} alt={patient?.name} />
                              <AvatarFallback>
                                {patient?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {patient?.name || 'Patient'}
                              </p>
                               {(chat.unreadCount || 0) > 0 && (
                                 <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                   {chat.unreadCount}
                                 </Badge>
                               )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage?.content || 'No messages yet'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {chat.lastMessage?.timestamp ? 
                                new Date(chat.lastMessage.timestamp).toLocaleDateString() : 
                                'No recent activity'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Chat Area */}
        <div className={`col-span-1 lg:col-span-3 ${showConversations ? 'hidden lg:block' : 'block'}`}>
          <AnimatedCard delay={0.7} className="h-full flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Back Button for Mobile */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowConversations(true)}
                        className="lg:hidden mr-2"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getPatientInfo(activeChat.participants[0] || '')?.avatar || ''} />
                        <AvatarFallback>
                          {getPatientInfo(activeChat.participants[0] || '')?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {getPatientInfo(activeChat.participants[0] || '')?.name || 'Patient'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            Patient
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                            <MoreVertical className="h-4 w-4 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg z-[100]">
                          <DropdownMenuItem 
                            onClick={handleViewPatientProfile}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-foreground">View Patient Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handleScheduleSession}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-foreground">Schedule Session</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handleFlagPatient}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            <Flag className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-foreground">Flag for Follow-up</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleToggleNotifications}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            {isNotificationsEnabled ? (
                              <>
                                <BellOff className="mr-2 h-4 w-4 text-primary" />
                                <span className="text-foreground">Mute Notifications</span>
                              </>
                            ) : (
                              <>
                                <Bell className="mr-2 h-4 w-4 text-primary" />
                                <span className="text-foreground">Enable Notifications</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleArchiveChat}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            <Archive className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-foreground">Archive Chat</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handleDeleteChat}
                            className="hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Delete Chat</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {activeMessages.map((message) => {
                        const isFromCounselor = message.senderId === '2'; // Counselor ID
                        const senderName = isFromCounselor ? 'Dr. Marie Claire' : 
                          getPatientInfo(message.senderId)?.name || 'Patient';
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex flex-col ${isFromCounselor ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromCounselor
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1">
                              <p className={`text-xs ${
                                isFromCounselor ? 'text-primary/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {isFromCounselor && (
                                <CheckCircle className="h-3 w-3 text-primary/70" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-2 md:p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" title="Attach file" className="h-10 w-10 p-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message to the patient..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-10 h-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="h-10 w-10 p-0">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a patient conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {/* Profile View Modal */}
      {activeChat && (
        <ProfileViewModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={getPatientInfo(activeChat.participants[0] || '') || null}
          userType="patient"
          currentUserRole="counselor"
        />
      )}

      {/* Schedule Session Modal */}
      {isScheduleOpen && (
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => {
            setIsScheduleOpen(false);
            setSelectedPatient(null);
          }}
          counselorId={currentCounselor?.id || '2'}
          counselorName={currentCounselor?.name || 'Dr. Marie Uwimana'}
          patients={dummyPatients}
          preselectedPatientId={selectedPatient?.id}
          onSchedule={handleConfirmSchedule}
        />
      )}
    </div>
  );
}
