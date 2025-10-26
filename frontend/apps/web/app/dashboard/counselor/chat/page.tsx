'use client';

import React, { useState } from 'react';
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
  Flag
} from 'lucide-react';
import { dummyChats, dummyMessages, dummyPatients } from '../../../../lib/dummy-data';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';

export default function CounselorChatPage() {
  const [selectedChat, setSelectedChat] = useState(dummyChats[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    console.log('Schedule session with patient');
  };

  const handleAddSessionNotes = () => {
    console.log('Add session notes');
  };

  const handleFlagPatient = () => {
    console.log('Flag patient for follow-up');
  };

  const handleArchiveChat = () => {
    console.log('Archive chat');
  };

  const handleDeleteChat = () => {
    console.log('Delete chat');
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    console.log('Toggle notifications:', !isNotificationsEnabled);
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Patient Messages"
        description="Communicate with your patients and provide ongoing support"
      />

      <div className="grid gap-6 lg:grid-cols-4 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <AnimatedCard delay={0.5} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Patient Conversations</h3>
                <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                  <MoreVertical className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="space-y-1">
                  {dummyChats.map((chat) => {
                     const patientId = chat.participants.find((id: string) => id !== '2'); // Exclude counselor ID
                    const patient = getPatientInfo(patientId || '');
                    
                    return (
                      <div
                        key={chat.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                          selectedChat === chat.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedChat(chat.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={patient?.avatar} alt={patient?.name} />
                              <AvatarFallback>
                                {patient?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
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
        <div className="lg:col-span-3">
          <AnimatedCard delay={0.7} className="h-full flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
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
                        <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg">
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
                            onClick={handleAddSessionNotes}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                          >
                            <FileText className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-foreground">Add Session Notes</span>
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
                            className={`flex ${isFromCounselor ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromCounselor
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className={`text-xs ${
                                  isFromCounselor ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                                {isFromCounselor && (
                                  <CheckCircle className="h-3 w-3 text-primary-foreground/70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message to the patient..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
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
    </div>
  );
}
