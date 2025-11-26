'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
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
  ArrowLeft,
  Wifi,
  WifiOff,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useChat } from '../../../../hooks/useChat';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { fetchPatientProfilesFromSessions } from '../../../../lib/utils/fetchPatientProfiles';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { MessageBubble, type Message as MessageBubbleMessage } from '@workspace/ui/components/message-bubble';
import { MessageInput } from '@workspace/ui/components/message-input';
import { TypingIndicator } from '@workspace/ui/components/typing-indicator';
import type { Message } from '@/lib/api/chat';
import type { Patient } from '@/lib/types';
import { useNotifications } from '../../../../hooks/useRealtime';
import { subscribeToMessages } from '../../../../lib/realtime/client';

export default function CounselorChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<AdminUser | null>(null);
  const [viewingPatient, setViewingPatient] = useState<AdminUser | null>(null);
  const [showConversations, setShowConversations] = useState(true);
  const [previewLength, setPreviewLength] = useState(30);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load chats using the hook
  const chatParams = useMemo(
    () => (user?.id ? { participantId: user.id } : undefined),
    [user?.id]
  );

  const {
    chats,
    messages,
    currentChat,
    loading: chatsLoading,
    error: chatsError,
    sendMessage,
    selectChat,
    deleteChat,
    reactToMessage,
    editMessage,
    deleteMessage,
    refreshChats,
    realtimeConnected,
    createChat,
  } = useChat(chatParams);
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  // Load participants (patients and counselors) for profile view and booking
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setPatientsLoading(true);
        
        // Get all participant IDs from chats (excluding current user)
        const participantIds = Array.from(new Set(
          chats
            .flatMap(chat => chat.participants)
            .filter(id => id !== user?.id)
        ));

        let participantsList: AdminUser[] = [];
        
        // Fetch both patients and counselors
        try {
          const [patientsResponse, counselorsResponse] = await Promise.all([
            AdminApi.listUsers({ role: 'patient' }).catch(() => ({ users: [] })),
            AdminApi.listUsers({ role: 'counselor' }).catch(() => ({ users: [] }))
          ]);
          
          const allUsers = [...patientsResponse.users, ...counselorsResponse.users];
          
          if (participantIds.length > 0) {
            participantsList = allUsers.filter(u => participantIds.includes(u.id));
          } else {
            participantsList = allUsers;
          }
        } catch (adminError) {
          console.warn('[CounselorChat] AdminApi failed, using fallback:', adminError);
        }

        // Fallback: Fetch directly from profiles table (respects RLS for sessions/chats)
        if (participantIds.length > 0 && participantsList.length < participantIds.length) {
          const missingIds = participantIds.filter(id => !participantsList.some(p => p.id === id));
          if (missingIds.length > 0) {
            const fallbackParticipants = await fetchPatientProfilesFromSessions(missingIds);
            participantsList = [...participantsList, ...fallbackParticipants];
          }
        }

        setPatients(participantsList);
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast.error('Failed to load participants');
      } finally {
        setPatientsLoading(false);
      }
    };

    if (user?.id) {
      fetchParticipants();
    }
  }, [user?.id, chats]);

  // Check for chatId in URL query params (only when chats are loaded and chatId exists)
  const chatIdFromUrl = searchParams.get('chatId');
  const hasProcessedChatId = useRef(false);
  
  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0 && !hasProcessedChatId.current) {
      hasProcessedChatId.current = true;
      selectChat(chatIdFromUrl);
      // Clean up the URL query parameter (only once)
      router.replace('/dashboard/counselor/chat', { scroll: false });
    }
  }, [chatIdFromUrl, chats.length, selectChat, router]);

  // Subscribe to notifications and show toasts for new messages
  useNotifications(
    user?.id || null,
    (notification) => {
      // Only show notifications for message_received type
      if (notification.type_key === 'message_received' && isNotificationsEnabled) {
        const metadata = notification.metadata as Record<string, unknown> | undefined;
        const chatId = metadata?.chatId as string | undefined;
        const senderName = metadata?.senderName as string | undefined;
        
        // Only show notification if not viewing this chat
        if (chatId && chatId !== currentChat?.id) {
          toast.info(notification.message, {
            description: senderName ? `From ${senderName}` : undefined,
            action: {
              label: 'View',
              onClick: () => {
                selectChat(chatId);
              },
            },
          });
        }
      }
    },
    (error) => {
      console.error('Notification subscription error:', error);
    }
  );

  // Subscribe to messages from all chats to show notifications
  useEffect(() => {
    if (!user?.id || !isNotificationsEnabled) return;

    const unsubscribes: (() => void)[] = [];

    // Subscribe to messages from all chats
    chats.forEach((chat) => {
      // Skip the current chat as it's already handled by useChat
      if (chat.id === currentChat?.id) return;

      const unsubscribe = subscribeToMessages(
        chat.id,
        (message) => {
          // Only show notification if message is not from current user and not in current chat
          if (message.sender_id !== user.id && message.chat_id !== currentChat?.id) {
            const participantId = chat.participants.find((id) => id !== user.id);
            const participantInfo = participantId
              ? patients.find((p) => p.id === participantId) ||
                counselors.find((c) => c.id === participantId)
              : null;
            const senderName = participantInfo?.fullName || participantInfo?.email || 'Someone';

            toast.info(
              message.content.length > 50 ? `${message.content.slice(0, 47)}...` : message.content,
              {
                description: `From ${senderName}`,
                action: {
                  label: 'View',
                  onClick: () => {
                    selectChat(chat.id);
                  },
                },
              }
            );
          }
        },
        (error) => {
          console.error(`Error subscribing to messages for chat ${chat.id}:`, error);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [chats, currentChat?.id, user?.id, isNotificationsEnabled, patients, counselors, selectChat]);

  // Force container update when chat changes
  const [messagesKey, setMessagesKey] = useState(0);
  const lastMessageIdRef = useRef<string | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const lastChatIdForKeyRef = useRef<string | null>(null);
  
  // Update key only when chat changes, not on every message
  // Delay the update slightly to allow messages to load first
  useEffect(() => {
    if (currentChat?.id && lastChatIdForKeyRef.current !== currentChat.id) {
      lastChatIdForKeyRef.current = currentChat.id;
      // Delay key update to allow messages to load and scroll to happen first
      const timeoutId = setTimeout(() => {
        setMessagesKey(prev => prev + 1);
        lastMessageIdRef.current = null;
        lastMessageCountRef.current = 0;
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentChat?.id]);

  // Auto-scroll to bottom when chat is selected or messages are loaded
  const lastChatIdForScrollRef = useRef<string | null>(null);
  const lastMessageCountForScrollRef = useRef<number>(0);
  const needsScrollOnLoadRef = useRef<boolean>(false);
  
  // Track when chat changes to trigger scroll after messages load
  useEffect(() => {
    if (currentChat?.id && lastChatIdForScrollRef.current !== currentChat.id) {
      lastChatIdForScrollRef.current = currentChat.id;
      lastMessageCountForScrollRef.current = 0;
      needsScrollOnLoadRef.current = true;
    }
    if (!currentChat) {
      lastChatIdForScrollRef.current = null;
      lastMessageCountForScrollRef.current = 0;
      needsScrollOnLoadRef.current = false;
    }
  }, [currentChat?.id]);
  
  // Scroll to bottom when messages are loaded after chat selection
  useEffect(() => {
    if (currentChat && messages.length > 0 && needsScrollOnLoadRef.current) {
      const messageCount = messages.length;
      // Only scroll if we have messages and haven't scrolled yet for this load
      if (messageCount > lastMessageCountForScrollRef.current) {
        lastMessageCountForScrollRef.current = messageCount;
        // Use multiple timeouts to ensure scroll happens after all DOM updates
        const timeout1 = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }, 150);
        const timeout2 = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }, 500);
        const timeout3 = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          needsScrollOnLoadRef.current = false;
        }, 800);
        return () => {
          clearTimeout(timeout1);
          clearTimeout(timeout2);
          clearTimeout(timeout3);
        };
      }
    }
  }, [currentChat?.id, messages.length, messagesKey]);

  // Auto-scroll to bottom when new messages arrive (only if message count or last message ID changes)
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const messageCount = messages.length;
  const lastMessageId = lastMessage?.id ?? null; // Ensure it's never undefined
  
  useEffect(() => {
    if (messageCount > 0 && currentChat) {
      // Only scroll if we have a new message (different ID or count increased)
      if (
        (lastMessageId && lastMessageId !== lastMessageIdRef.current) ||
        messageCount > lastMessageCountRef.current
      ) {
        lastMessageIdRef.current = lastMessageId;
        lastMessageCountRef.current = messageCount;
        
        // Use setTimeout to ensure DOM is updated
        const timeoutId = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messageCount, lastMessageId, currentChat?.id]);

  // Trigger scroll immediately after sending a message
  useEffect(() => {
    if (shouldScroll) {
      // Try scrolling immediately, then again after a delay to catch realtime updates
      const immediateTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      
      const delayedTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShouldScroll(false);
      }, 300);
      
      return () => {
        clearTimeout(immediateTimeout);
        clearTimeout(delayedTimeout);
      };
    }
  }, [shouldScroll]);

  // Update preview length based on screen size
  useEffect(() => {
    const updatePreviewLength = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setPreviewLength(20); // Mobile
      } else if (width < 768) {
        setPreviewLength(30); // Small tablets
      } else if (width < 1024) {
        setPreviewLength(40); // Tablets
      } else {
        setPreviewLength(50); // Desktop
      }
    };

    updatePreviewLength();
    window.addEventListener('resize', updatePreviewLength);
    return () => window.removeEventListener('resize', updatePreviewLength);
  }, []);

  // Get the other participant (patient or counselor) from the current chat
  const getParticipantId = (chat: typeof currentChat) => {
    if (!chat || !user) return null;
    return chat.participants.find(id => id !== user.id);
  };

  const getParticipantInfo = (participantId: string | null | undefined) => {
    if (!participantId) return null;
    // Check both patients and counselors
    return patients.find(p => p.id === participantId) || 
           counselors.find(c => c.id === participantId) || 
           null;
  };

  // Keep old function names for backward compatibility
  const getPatientId = getParticipantId;
  const getPatientInfo = getParticipantInfo;

  const currentParticipantId = currentChat ? getParticipantId(currentChat) : null;
  const currentParticipantInfo = currentParticipantId ? getParticipantInfo(currentParticipantId) : null;
  
  // For backward compatibility
  const currentPatientId = currentParticipantId;
  const currentPatientInfo = currentParticipantInfo;

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChat || !user) return;
    
    // Prevent any default form behavior
    const trimmedContent = content.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, trimmedContent);
        setEditingMessage(null);
        toast.success('Message edited');
      } else {
        await sendMessage({
          chatId: currentChat.id,
          content: trimmedContent,
          type: 'text',
          replyToId: replyTo?.id,
        });
        setReplyTo(null);
        // Trigger scroll after sending message
        setShouldScroll(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      // Restore message on error
      setNewMessage(trimmedContent);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await reactToMessage(messageId, emoji);
    } catch (error) {
      console.error('Error reacting to message:', error);
      toast.error('Failed to react to message');
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setReplyTo(null);
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleCopy = (content: string) => {
    toast.success('Message copied to clipboard');
  };

  const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: Message[] }> = [];
    let currentDate = '';
    
    const sortedMessages = [...messages]
      .filter((message, index, self) => 
        index === self.findIndex((m) => m.id === message.id)
      )
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    
    sortedMessages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = messageDate.toDateString();
      const dateLabel = formatDateSeparator(messageDate);
      
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: dateLabel, messages: [] });
      }
      
      const lastGroup = groups[groups.length - 1];
      if (lastGroup) {
        lastGroup.messages.push(message);
      }
    });
    
    return groups;
  }, [messages]);

  const handleViewPatientProfile = async () => {
    if (!currentParticipantId) return;
    
    // First check if participant is already loaded
    let participant = currentParticipantInfo;
    
    if (!participant) {
      // Participant not found, try to fetch it
      try {
        const isCounselor = currentParticipantInfo?.role === 'counselor';
        toast.loading(`Loading ${isCounselor ? 'counselor' : 'patient'} information...`, { id: 'loading-participant' });
        
        // Try AdminApi first (works for both patients and counselors)
        try {
          participant = await AdminApi.getUser(currentParticipantId);
        } catch (adminError) {
          console.warn('[CounselorChat] AdminApi failed, trying fallback:', adminError);
          
          // Fallback: Use the shared utility function to fetch profile
          const fetchedProfiles = await fetchPatientProfilesFromSessions([currentParticipantId]);
          
          if (fetchedProfiles.length > 0) {
            participant = fetchedProfiles[0] || null;
          } else {
            toast.error(`Failed to load ${isCounselor ? 'counselor' : 'patient'} information.`);
            toast.dismiss('loading-participant');
            return;
          }
        }
        
        // Update participants list
        setPatients(prev => {
          if (!prev.find(p => p.id === currentParticipantId)) {
            return [...prev, participant!];
          }
          return prev;
        });
        
        toast.dismiss('loading-participant');
      } catch (error) {
        console.error('[CounselorChat] Error loading participant:', error);
        toast.dismiss('loading-participant');
        toast.error('Failed to load participant information.');
        return;
      }
    }
    
    if (participant) {
      setViewingPatient(participant);
      setIsProfileOpen(true);
    }
  };

  const handleScheduleSession = () => {
    if (currentChat && currentPatientInfo) {
      setSelectedPatient(currentPatientInfo);
      setIsScheduleOpen(true);
    } else {
      toast.error('Please select a conversation first');
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
    if (!currentChat) return;
    setChatToDelete(currentChat.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteChat(chatToDelete);
      toast.success('Conversation deleted successfully');
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
      // Navigate away if we deleted the current chat
      if (currentChat?.id === chatToDelete) {
        router.push('/dashboard/counselor/chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    console.log('Toggle notifications:', !isNotificationsEnabled);
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all messages as read for all chats
      // This would need to be implemented in the API
      toast.success('All conversations marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
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

  const handleNewChat = () => {
    setIsNewChatDialogOpen(true);
    loadCounselors();
  };

  const loadCounselors = async () => {
    if (!user?.id) return;
    
    setCounselorsLoading(true);
    try {
      const response = await AdminApi.listUsers({ role: 'counselor' });
      // Filter out the current user
      const otherCounselors = response.users.filter(c => c.id !== user.id);
      setCounselors(otherCounselors);
    } catch (error) {
      console.error('Error loading counselors:', error);
      toast.error('Failed to load counselors');
    } finally {
      setCounselorsLoading(false);
    }
  };

  const handleSelectCounselor = async (counselorId: string) => {
    if (!user?.id) return;
    
    try {
      toast.loading('Creating chat...', { id: 'creating-chat' });
      const newChat = await createChat({ participantId: counselorId });
      toast.dismiss('creating-chat');
      toast.success('Chat created successfully');
      setIsNewChatDialogOpen(false);
      setSearchQuery('');
      // Select the newly created chat
      selectChat(newChat.id);
      setShowConversations(false);
    } catch (error) {
      toast.dismiss('creating-chat');
      console.error('Error creating chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create chat');
    }
  };

  const filteredCounselors = useMemo(() => {
    if (!searchQuery.trim()) return counselors;
    const query = searchQuery.toLowerCase();
    return counselors.filter(counselor => 
      counselor.fullName?.toLowerCase().includes(query) ||
      counselor.email?.toLowerCase().includes(query) ||
      counselor.specialty?.toLowerCase().includes(query)
    );
  }, [counselors, searchQuery]);

  const handleConfirmSchedule = async (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => {
    // Scheduling is handled by the ScheduleSessionModal component
    setIsScheduleOpen(false);
    setSelectedPatient(null);
    toast.success('Session scheduled successfully! Patient has been notified.');
  };

  if (authLoading || chatsLoading || patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (chatsError) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading chats</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <AnimatedPageHeader
        title="Messages"
        description="Communicate with your patients and fellow counselors"
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-4 h-[calc(100vh-280px)] md:h-[600px]">
        {/* Chat List */}
        <div className={`lg:col-span-1 ${showConversations ? 'block' : 'hidden lg:block'}`}>
          <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group h-full flex flex-col">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-semibold">Conversations</h3>
                  <div className="flex items-center gap-1" title={realtimeConnected ? 'Realtime Connected' : 'Realtime Disconnected'}>
                    {realtimeConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                      <MoreVertical className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg z-[100]">
                    <DropdownMenuItem 
                      onClick={handleNewChat}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                    >
                      <UserPlus className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-foreground">New Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                  {chats.length > 0 ? (
                    chats.map((chat) => {
                      const participantId = getParticipantId(chat);
                      const participant = getParticipantInfo(participantId);
                      const isCounselor = participant?.role === 'counselor';
                      
                      return (
                        <div
                          key={chat.id}
                          className={`p-2 md:p-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 border-b group ${
                            currentChat?.id === chat.id ? 'bg-muted dark:bg-muted/50' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (currentChat?.id !== chat.id) {
                            selectChat(chat.id);
                            }
                            setShowConversations(false);
                          }}
                          onMouseDown={(e) => {
                            // Prevent text selection on click
                            if (e.detail > 1) {
                              e.preventDefault();
                            }
                          }}
                        >
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarImage src={participant?.avatarUrl} alt={participant?.fullName || participant?.email} />
                              <AvatarFallback>
                                {(participant?.fullName || participant?.email || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {participant?.fullName || participant?.email || 'User'}
                                </p>
                                {isCounselor && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 flex-shrink-0">
                                    Counselor
                                  </Badge>
                                )}
                              </div>
                               {chat.unreadCount > 0 && chat.lastMessage?.senderId !== user?.id && (
                                 <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs flex-shrink-0">
                                   {chat.unreadCount}
                                 </Badge>
                               )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage?.content ? 
                                (chat.lastMessage.content.length > previewLength 
                                  ? chat.lastMessage.content.substring(0, previewLength) + '...' 
                                  : chat.lastMessage.content)
                                : 'No messages yet'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {chat.lastMessage?.createdAt ? 
                                new Date(chat.lastMessage.createdAt).toLocaleDateString() : 
                                'No recent activity'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Start a conversation with a patient or counselor</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className={`col-span-1 lg:col-span-3 ${showConversations ? 'hidden lg:block' : 'block'}`}>
          <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group h-full flex flex-col">
            {currentChat ? (
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
                        <AvatarImage src={currentParticipantInfo?.avatarUrl} />
                        <AvatarFallback>
                          {currentParticipantInfo?.fullName?.split(' ').map(n => n[0]).join('') || 
                           currentParticipantInfo?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {currentParticipantInfo?.fullName || currentParticipantInfo?.email || 'User'}
                          </h3>
                          {currentParticipantInfo?.role === 'counselor' && (
                            <Badge variant="outline" className="text-xs">
                              Counselor
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {realtimeConnected ? 'Online' : 'Offline'}
                          </p>
                          {currentParticipantInfo?.specialty && (
                            <p className="text-xs text-muted-foreground">
                              • {currentParticipantInfo.specialty}
                            </p>
                          )}
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
                            <span className="text-foreground">
                              {currentParticipantInfo?.role === 'counselor' ? 'View Counselor Profile' : 'View Patient Profile'}
                            </span>
                          </DropdownMenuItem>
                          {currentParticipantInfo?.role === 'patient' && (
                            <DropdownMenuItem 
                              onClick={handleScheduleSession}
                              className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                            >
                              <Calendar className="mr-2 h-4 w-4 text-primary" />
                              <span className="text-foreground">Schedule Session</span>
                            </DropdownMenuItem>
                          )}
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
                    <div className="space-y-4" key={`messages-${currentChat?.id}-${messagesKey}`}>
                      {groupedMessages.length > 0 ? (
                        <>
                          {groupedMessages.map((group, groupIndex) => (
                            <div key={group.date}>
                              {group.messages.map((message, msgIndex) => {
                                const isOwnMessage = message.senderId === user?.id;
                                const senderParticipant = getParticipantInfo(message.senderId);
                                const senderInfo = isOwnMessage
                                  ? { name: 'You', avatar: undefined }
                                  : {
                                      name: senderParticipant?.fullName || 
                                            senderParticipant?.email || 
                                            (senderParticipant?.role === 'counselor' ? 'Counselor' : 'Patient'),
                                      avatar: senderParticipant?.avatarUrl,
                                    };
                                
                                const replyToMessage = message.replyToId
                                  ? messages.find((m) => m.id === message.replyToId)
                                  : message.replyTo;
                                
                                const status: 'sending' | 'sent' | 'delivered' | 'read' = 
                                  isOwnMessage
                                    ? message.isRead
                                      ? 'read'
                                      : 'sent'
                                    : 'sent';
                                
                                return (
                                  <MessageBubble
                                    key={message.id}
                                    message={{
                                      ...message,
                                      replyTo: replyToMessage,
                                    } as MessageBubbleMessage}
                                    isOwn={isOwnMessage}
                                    senderInfo={senderInfo}
                                    currentUserId={user?.id}
                                    showDateSeparator={msgIndex === 0}
                                    dateSeparator={msgIndex === 0 ? group.date : undefined}
                                    onReply={(msg) => setReplyTo(msg as Message)}
                                    onReact={handleReact}
                                    onEdit={isOwnMessage ? handleEdit : undefined}
                                    onDelete={isOwnMessage ? handleDelete : undefined}
                                    onCopy={handleCopy}
                                    status={isOwnMessage ? status : undefined}
                                  />
                                );
                              })}
                            </div>
                          ))}
                          <TypingIndicator isVisible={isOtherTyping} name={currentParticipantInfo?.fullName || currentParticipantInfo?.email || 'User'} />
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs mt-1">Start the conversation</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-2 md:p-4 border-t">
                  <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={handleSendMessage}
                    onTyping={() => {
                      // Don't show typing indicator for current user's typing
                      // This callback is for future use if we want to send typing status to server
                    }}
                    replyTo={replyTo}
                    onCancelReply={() => {
                      setReplyTo(null);
                      setEditingMessage(null);
                      setNewMessage('');
                    }}
                    placeholder={editingMessage ? 'Edit your message...' : 'Type your message...'}
                  />
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
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Profile View Modal */}
      {isProfileOpen && (viewingPatient || currentParticipantInfo) && (
        <ProfileViewModal
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setViewingPatient(null);
          }}
          user={viewingPatient || currentParticipantInfo ? {
            id: (viewingPatient || currentParticipantInfo)!.id,
            name: (viewingPatient || currentParticipantInfo)!.fullName || (viewingPatient || currentParticipantInfo)!.email || 'User',
            email: (viewingPatient || currentParticipantInfo)!.email,
            role: ((viewingPatient || currentParticipantInfo)!.role === 'counselor' ? 'counselor' : 'patient') as 'patient' | 'counselor',
            avatar: (viewingPatient || currentParticipantInfo)!.avatarUrl,
            createdAt: new Date((viewingPatient || currentParticipantInfo)!.createdAt),
            metadata: (viewingPatient || currentParticipantInfo)!.metadata || {},
            diagnosis: (viewingPatient || currentParticipantInfo)!.cancerType || ((viewingPatient || currentParticipantInfo)!.metadata?.diagnosis as string) || ((viewingPatient || currentParticipantInfo)!.metadata?.cancer_type as string),
            treatmentStage: (viewingPatient || currentParticipantInfo)!.treatmentStage || ((viewingPatient || currentParticipantInfo)!.metadata?.treatment_stage as string),
            assignedCounselor: ((viewingPatient || currentParticipantInfo)!.metadata?.assigned_counselor_id as string) || undefined,
            moduleProgress: ((viewingPatient || currentParticipantInfo)!.metadata?.module_progress as Record<string, number>) || undefined,
          } as Patient : null}
          userType={(viewingPatient || currentParticipantInfo)?.role === 'counselor' ? 'counselor' : 'patient'}
          currentUserRole="counselor"
        />
      )}

      {/* Schedule Session Modal */}
      {isScheduleOpen && user && (
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => {
            setIsScheduleOpen(false);
            setSelectedPatient(null);
          }}
          counselorId={user.id}
          counselorName={user.name || 'Counselor'}
          patients={patients.map(patient => ({
            id: patient.id,
            name: patient.fullName || patient.email,
            avatar: undefined // AdminUser doesn't have avatar
          }))}
          preselectedPatientId={selectedPatient?.id}
          onSchedule={handleConfirmSchedule}
        />
      )}

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setChatToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteChat}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Chat with Counselor</DialogTitle>
            <DialogDescription>
              Select a counselor to start a new conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search counselors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[300px]">
              {counselorsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner variant="bars" size={24} className="text-primary" />
                </div>
              ) : filteredCounselors.length > 0 ? (
                <div className="space-y-2">
                  {filteredCounselors.map((counselor) => {
                    // Check if chat already exists with this counselor
                    const existingChat = chats.find(chat => 
                      chat.participants.includes(counselor.id) && 
                      chat.participants.includes(user?.id || '')
                    );
                    
                    return (
                      <div
                        key={counselor.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/20 ${
                          existingChat ? 'opacity-60' : ''
                        }`}
                        onClick={() => {
                          if (existingChat) {
                            selectChat(existingChat.id);
                            setIsNewChatDialogOpen(false);
                            setSearchQuery('');
                            setShowConversations(false);
                          } else {
                            handleSelectCounselor(counselor.id);
                          }
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={counselor.avatarUrl} alt={counselor.fullName} />
                          <AvatarFallback>
                            {counselor.fullName?.split(' ').map(n => n[0]).join('') || 
                             counselor.email?.charAt(0).toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {counselor.fullName || counselor.email}
                          </p>
                          {counselor.specialty && (
                            <p className="text-sm text-muted-foreground truncate">
                              {counselor.specialty}
                            </p>
                          )}
                          {existingChat && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Chat already exists
                            </p>
                          )}
                        </div>
                        {existingChat ? (
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <UserPlus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    {searchQuery ? 'No counselors found' : 'No other counselors available'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewChatDialogOpen(false);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
