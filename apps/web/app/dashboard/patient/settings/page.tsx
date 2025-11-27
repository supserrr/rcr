'use client';

import React, { useMemo, useRef, useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  Bell, 
  Shield, 
  LogOut,
  Camera,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Settings2,
  UserCheck,
  Clock,
  MapPin,
  Award,
  Languages,
  Trash2,
  X,
  Plus,
  MessageCircle,
  Send,
  FileText,
  HelpCircle,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { AuthApi } from '../../../../lib/api/auth';
import {
  SupportApi,
  SupportTicketRecord,
  SupportTicketCategory,
  SupportTicketPriority,
} from '../../../../lib/api/support';
import { toast } from 'sonner';
import { Textarea } from '@workspace/ui/components/textarea';
import { useEffect } from 'react';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';

export default function PatientSettingsPage() {
  const { user, isLoading: authLoading, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'technical' as SupportTicketCategory,
    priority: 'medium' as SupportTicketPriority,
    description: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarButtonClick = () => {
    if (isUploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = /image\/(png|jpeg|jpg)/i.test(file.type);
    const isSmallEnough = file.size <= 2 * 1024 * 1024;

    if (!isImage || !isSmallEnough) {
      toast.error('Please upload a JPG or PNG image under 2MB.');
      event.target.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { url, user: updatedUser } = await AuthApi.uploadProfileImage(file);
      
      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        avatar_url: url,
      }));
      
      // Refresh user in auth context to update avatar across the app
      await checkAuth();
      
      toast.success('Profile image updated successfully.');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update profile image. Please try again.',
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };


  const [myTickets, setMyTickets] = useState<SupportTicketRecord[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sessionReminders: true,
    patientMessages: true,
    resourceUpdates: true,
    systemAlerts: true,
  });

  const [sessionPreferences, setSessionPreferences] = useState({
    sessionDuration: '60',
    sessionType: 'video',
    reminderLeadTime: '24', // hours
  });

  const [securityPreferences, setSecurityPreferences] = useState({
    loginAlerts: false,
    lastRevokeRequest: '',
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    dateOfBirth: new Date(),
    medicalHistory: '',
    preferredLanguage: '',
    timezone: 'Africa/Kigali',
    additionalLanguages: [] as string[],
    lastSignInAt: '',
    // Onboarding data
    age: '',
    gender: '',
    location: '',
    cancerType: '',
    diagnosisDate: '',
    currentTreatment: '',
    treatmentStage: '',
    supportNeeds: [] as string[],
    familySupport: '',
    consultationType: [] as string[],
    specialRequests: '',
    avatar_url: user?.avatar || ''
  });

  const profileAvatarUrl = useMemo(
    () => normalizeAvatarUrl(profile.avatar_url || user?.avatar),
    [profile.avatar_url, user?.avatar],
  );

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const currentUser = await AuthApi.getCurrentUser();
        if (!currentUser) {
          // Session expired; keep existing auth state data
          return;
        }
        const metadata = currentUser.metadata || {};
        
        const contactPhone =
          (typeof currentUser.contactPhone === 'string' && currentUser.contactPhone.length > 0
            ? currentUser.contactPhone
            : undefined) ??
          (typeof metadata.contactPhone === 'string' ? metadata.contactPhone : undefined) ??
          (typeof metadata.phoneNumber === 'string' ? metadata.phoneNumber : undefined) ??
          (typeof (currentUser as any).phoneNumber === 'string'
            ? ((currentUser as any).phoneNumber as string)
            : undefined);
        const emergencyContactName =
          (typeof currentUser.emergencyContactName === 'string'
            ? currentUser.emergencyContactName
            : undefined) ??
          (typeof metadata.emergencyContactName === 'string'
            ? metadata.emergencyContactName
            : undefined);
        const emergencyContactPhone =
          (typeof currentUser.emergencyContactPhone === 'string'
            ? currentUser.emergencyContactPhone
            : undefined) ??
          (typeof metadata.emergencyContactPhone === 'string'
            ? metadata.emergencyContactPhone
            : undefined) ??
          (typeof metadata.emergencyContact === 'string'
            ? metadata.emergencyContact
            : undefined);
        const preferredLanguage =
          (typeof currentUser.preferredLanguage === 'string'
            ? currentUser.preferredLanguage
            : undefined) ??
          (typeof metadata.preferredLanguage === 'string'
            ? metadata.preferredLanguage
            : undefined) ??
          (typeof metadata.language === 'string' ? metadata.language : undefined) ??
          'kinyarwanda';
        const treatmentStage =
          (typeof currentUser.treatmentStage === 'string'
            ? currentUser.treatmentStage
            : undefined) ??
          (typeof metadata.treatmentStage === 'string' ? metadata.treatmentStage : undefined) ??
          '';
        const rawLanguages = Array.isArray(metadata.languages)
          ? metadata.languages
          : Array.isArray(metadata.language_preferences)
            ? metadata.language_preferences
            : [];
        const additionalLanguages = rawLanguages
          .filter((lang): lang is string => typeof lang === 'string' && lang.trim().length > 0)
          .filter((lang) => lang.toLowerCase() !== preferredLanguage.toLowerCase());

        setProfile((prev) => ({
          ...prev,
          name: currentUser.name,
          email: currentUser.email,
          contactPhone: contactPhone || '',
          emergencyContactName: emergencyContactName || '',
          emergencyContactPhone: emergencyContactPhone || '',
          dateOfBirth:
            typeof metadata.dateOfBirth === 'string'
              ? new Date(metadata.dateOfBirth)
              : metadata.dateOfBirth instanceof Date
                ? metadata.dateOfBirth
                : new Date(),
          medicalHistory: (typeof metadata.medicalHistory === 'string' ? metadata.medicalHistory : '') || '',
          preferredLanguage: preferredLanguage || '',
          timezone: (typeof metadata.timezone === 'string' ? metadata.timezone : 'Africa/Kigali') || 'Africa/Kigali',
          additionalLanguages,
          lastSignInAt:
            typeof metadata.lastSignInAt === 'string'
              ? metadata.lastSignInAt
              : prev.lastSignInAt,
          age:
            (typeof metadata.age === 'string'
              ? metadata.age
              : typeof metadata.age === 'number'
                ? String(metadata.age)
                : '') || '',
          gender: (typeof metadata.gender === 'string' ? metadata.gender : '') || '',
          location: (typeof metadata.location === 'string' ? metadata.location : '') || '',
          cancerType: (typeof metadata.cancerType === 'string' ? metadata.cancerType : '') || '',
          diagnosisDate: (typeof metadata.diagnosisDate === 'string' ? metadata.diagnosisDate : '') || '',
          currentTreatment: (typeof metadata.currentTreatment === 'string' ? metadata.currentTreatment : '') || '',
          treatmentStage,
          supportNeeds: Array.isArray(metadata.supportNeeds) ? metadata.supportNeeds : [],
          familySupport: (typeof metadata.familySupport === 'string' ? metadata.familySupport : '') || '',
          consultationType: Array.isArray(metadata.consultationType) ? metadata.consultationType : [],
          specialRequests: (typeof metadata.specialRequests === 'string' ? metadata.specialRequests : '') || '',
          avatar_url:
            (typeof currentUser.avatar === 'string'
              ? currentUser.avatar
              : typeof metadata.avatar_url === 'string'
                ? metadata.avatar_url
                : '') || ''
        }));

        const notificationPrefs =
          (currentUser.notificationPreferences as Record<string, unknown> | undefined) ??
          (metadata.notificationPreferences as Record<string, unknown> | undefined);
        if (notificationPrefs) {
          setNotifications((prev) => ({
            ...prev,
            email:
              notificationPrefs.email !== undefined ? Boolean(notificationPrefs.email) : prev.email,
            push:
              notificationPrefs.push !== undefined ? Boolean(notificationPrefs.push) : prev.push,
            sms: notificationPrefs.sms !== undefined ? Boolean(notificationPrefs.sms) : prev.sms,
            sessionReminders:
              notificationPrefs.sessionReminders !== undefined
                ? Boolean(notificationPrefs.sessionReminders)
                : prev.sessionReminders,
            patientMessages:
              notificationPrefs.patientMessages !== undefined
                ? Boolean(notificationPrefs.patientMessages)
                : prev.patientMessages,
            resourceUpdates:
              notificationPrefs.resourceUpdates !== undefined
                ? Boolean(notificationPrefs.resourceUpdates)
                : prev.resourceUpdates,
            systemAlerts:
              notificationPrefs.systemAlerts !== undefined
                ? Boolean(notificationPrefs.systemAlerts)
                : prev.systemAlerts,
          }));
        }

        const supportPrefs =
          (currentUser.supportPreferences as Record<string, unknown> | undefined) ??
          (metadata.supportPreferences as Record<string, unknown> | undefined);
        if (supportPrefs) {
          setSessionPreferences((prev) => ({
            sessionDuration:
              supportPrefs.sessionDuration !== undefined
                ? String(supportPrefs.sessionDuration)
                : prev.sessionDuration,
            sessionType:
              typeof supportPrefs.sessionType === 'string'
                ? supportPrefs.sessionType
                : prev.sessionType,
            reminderLeadTime:
              supportPrefs.reminderLeadTime !== undefined
                ? String(supportPrefs.reminderLeadTime)
                : prev.reminderLeadTime,
          }));
        }

        const securityPrefs =
          (currentUser.securityPreferences as Record<string, unknown> | undefined) ??
          (metadata.securityPreferences as Record<string, unknown> | undefined);
        if (securityPrefs) {
          setSecurityPreferences((prev) => ({
            loginAlerts:
              securityPrefs.loginAlerts !== undefined
                ? Boolean(securityPrefs.loginAlerts)
                : prev.loginAlerts,
            lastRevokeRequest:
              typeof securityPrefs.lastRevokeRequest === 'string'
                ? securityPrefs.lastRevokeRequest
                : prev.lastRevokeRequest,
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Use auth user data as fallback
        setProfile(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          avatar_url: user.avatar || ''
        }));
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const fetchTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const data = await SupportApi.listMyTickets();
        if (isMounted) {
          setMyTickets(data);
        }
      } catch (error) {
        console.error('Error loading support tickets:', error);
        toast.error('Failed to load support tickets.');
      } finally {
        if (isMounted) {
          setIsLoadingTickets(false);
        }
      }
    };

    fetchTickets();

    const channel = SupportApi.subscribeToTickets((ticket) => {
      if (ticket.user_id !== user.id) {
        return;
      }

      setMyTickets((prev) => {
        const existingIndex = prev.findIndex((existing) => existing.id === ticket.id);
        if (existingIndex >= 0) {
          const clone = [...prev];
          clone[existingIndex] = ticket;
          return clone;
        }
        return [ticket, ...prev];
      });
    });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      if (!profile.contactPhone.trim()) {
        toast.error('Please provide your primary contact phone number.');
        setIsSaving(false);
        return;
      }

      if (!profile.emergencyContactName.trim() || !profile.emergencyContactPhone.trim()) {
        toast.error('Please provide both an emergency contact name and phone number.');
        setIsSaving(false);
        return;
      }

      // Update profile with all fields including onboarding data
      await AuthApi.updateProfile({
        fullName: profile.name,
        phoneNumber: profile.contactPhone,
        contactPhone: profile.contactPhone,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        preferredLanguage: profile.preferredLanguage || undefined,
        treatmentStage: profile.treatmentStage || undefined,
        metadata: {
          contactPhone: profile.contactPhone,
          phoneNumber: profile.contactPhone,
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone: profile.emergencyContactPhone,
          dateOfBirth: profile.dateOfBirth instanceof Date ? profile.dateOfBirth.toISOString() : profile.dateOfBirth,
          medicalHistory: profile.medicalHistory,
          language: profile.preferredLanguage,
          preferredLanguage: profile.preferredLanguage,
          timezone: profile.timezone,
          languages: profile.additionalLanguages,
          additionalLanguages: profile.additionalLanguages,
          // Onboarding data
          age: profile.age,
          gender: profile.gender,
          location: profile.location,
          cancerType: profile.cancerType,
          diagnosisDate: profile.diagnosisDate,
          currentTreatment: profile.currentTreatment,
          treatmentStage: profile.treatmentStage,
          supportNeeds: profile.supportNeeds,
          familySupport: profile.familySupport,
          consultationType: profile.consultationType,
          specialRequests: profile.specialRequests,
          avatar_url: profile.avatar_url
        }
      });
      
      setHasUnsavedChanges(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordChangeData.currentPassword || !passwordChangeData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordChangeData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await AuthApi.changePassword({
        currentPassword: passwordChangeData.currentPassword,
        newPassword: passwordChangeData.newPassword,
      });
      
      toast.success('Password changed successfully');
      setShowPasswordChangeModal(false);
      setPasswordChangeData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthApi.signOut();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      await AuthApi.updateProfile({
        notificationPreferences: updated,
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      toast.error('Failed to update notification preferences. Please try again.');
      setNotifications(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleSessionPreferenceChange = async (
    key: keyof typeof sessionPreferences,
    value: string,
  ) => {
    const previousValue = sessionPreferences[key];
    const updated = { ...sessionPreferences, [key]: value };
    setSessionPreferences(updated);
    try {
      await AuthApi.updateProfile({
        supportPreferences: updated,
      });
    } catch (error) {
      console.error('Failed to update session preferences:', error);
      toast.error('Failed to update session preferences. Please try again.');
      setSessionPreferences((prev) => ({ ...prev, [key]: previousValue }));
    }
  };

  const handleSecurityPreferenceChange = async (
    key: keyof typeof securityPreferences,
    value: boolean,
  ) => {
    const previousValue = securityPreferences[key];
    const updated = { ...securityPreferences, [key]: value };
    setSecurityPreferences(updated);
    try {
      await AuthApi.updateProfile({
        securityPreferences: updated,
      });
    } catch (error) {
      console.error('Failed to update security preferences:', error);
      toast.error('Failed to update security preferences. Please try again.');
      setSecurityPreferences((prev) => ({ ...prev, [key]: previousValue }));
    }
  };

  const handleSignOutOtherSessions = async () => {
    const timestamp = new Date().toISOString();
    const updated = { ...securityPreferences, lastRevokeRequest: timestamp };
    setSecurityPreferences(updated);
    try {
      await AuthApi.updateProfile({
        securityPreferences: updated,
      });
      toast.success('We will sign out other sessions and notify you when complete.');
    } catch (error) {
      console.error('Failed to sign out other sessions:', error);
      toast.error('Failed to sign out other sessions. Please try again.');
      setSecurityPreferences(securityPreferences);
    }
  };

  const handleProfileChange = (field: string, value: string | number | string[] | Date) => {
    setProfile(prev => {
      const next = { ...prev, [field]: value } as typeof prev;
      if (field === 'preferredLanguage' && typeof value === 'string') {
        next.additionalLanguages = prev.additionalLanguages.filter(
          (lang) => lang.toLowerCase() !== value.toLowerCase(),
        );
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleAddLanguage = (language: string) => {
    const normalized = language.trim();
    if (
      normalized &&
      normalized.toLowerCase() !== profile.preferredLanguage.toLowerCase() &&
      !profile.additionalLanguages.some((lang) => lang.toLowerCase() === normalized.toLowerCase())
    ) {
      setProfile(prev => ({
        ...prev,
        additionalLanguages: [...prev.additionalLanguages, normalized]
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      additionalLanguages: prev.additionalLanguages.filter(
        (lang) => lang.toLowerCase() !== languageToRemove.toLowerCase(),
      )
    }));
    setHasUnsavedChanges(true);
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage =
          (payload && typeof payload.error === 'string' && payload.error.length > 0)
            ? payload.error
            : 'Failed to delete account. Please try again.';
        throw new Error(errorMessage);
      }

      toast.success('Your account has been deleted.');

      try {
        await AuthApi.signOut();
      } catch (signOutError) {
        console.warn('Sign out after deletion failed:', signOutError);
      }

      setDeleteConfirmation('');
      setIsDeleteModalOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete account. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user?.id) {
      toast.error('You must be signed in to create a support ticket.');
      return;
    }

    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error('Please provide a subject and description for your ticket.');
      return;
    }

    setIsCreatingTicket(true);
    try {
      const ticket = await SupportApi.createTicket({
        subject: ticketForm.subject.trim(),
        category: ticketForm.category,
        priority: ticketForm.priority,
        description: ticketForm.description.trim(),
      });

      setTicketForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        description: '',
      });
      
      setMyTickets((prev) => [ticket, ...prev]);
      toast.success('Support ticket created successfully.');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create support ticket. Please try again.',
      );
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'support', label: 'Support', icon: MessageCircle }
  ];

  // Loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Not authenticated</h3>
        <p className="text-muted-foreground">Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Settings"
        description="Manage your account and preferences"
      >
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Unsaved changes</span>
          </div>
        )}
      </AnimatedPageHeader>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <AnimatedCard delay={0.1} className="sticky top-8">
            <div className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-xl ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:shadow-md'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </AnimatedCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <AnimatedCard delay={0.2}>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg">
                      <AvatarImage src={profileAvatarUrl} alt={user?.name || 'Patient'} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg border-primary/20 hover:bg-primary/10"
                      onClick={handleAvatarButtonClick}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Spinner variant="bars" size={16} className="text-primary" />
                      ) : (
                      <Camera className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{user?.name || 'Patient'}</h2>
                    <p className="text-primary font-medium">Patient</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Patient since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last sign-in{' '}
                      {profile.lastSignInAt
                        ? new Date(profile.lastSignInAt).toLocaleString()
                        : 'N/A'}
                    </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Active Patient
                    </Badge>
                  </div>
                </div>
              </AnimatedCard>

              {/* Personal Information */}
              <AnimatedCard delay={0.3}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Primary Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={profile.contactPhone}
                        onChange={(e) => handleProfileChange('contactPhone', e.target.value)}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={profile.timezone} onValueChange={(value) => handleProfileChange('timezone', value)}>
                        <SelectTrigger id="timezone" className="border-input focus:ring-primary/20">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Kigali">Africa/Kigali</SelectItem>
                          <SelectItem value="Africa/Lubumbashi">Africa/Lubumbashi</SelectItem>
                          <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={profile.emergencyContactName}
                        onChange={(e) => handleProfileChange('emergencyContactName', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={profile.emergencyContactPhone}
                        onChange={(e) => handleProfileChange('emergencyContactPhone', e.target.value)}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={profile.age}
                        onChange={(e) => handleProfileChange('age', e.target.value)}
                        placeholder="Enter your age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={profile.gender} onValueChange={(value) => handleProfileChange('gender', value)}>
                        <SelectTrigger className="border-input focus:ring-primary/20">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="e.g., Kigali, Rwanda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth instanceof Date ? profile.dateOfBirth.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleProfileChange('dateOfBirth', new Date(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <Select
                      value={profile.preferredLanguage}
                      onValueChange={(value) => handleProfileChange('preferredLanguage', value)}
                    >
                        <SelectTrigger className="border-input focus:ring-primary/20">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="kinyarwanda">Kinyarwanda</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="swahili">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <textarea
                      id="medicalHistory"
                      className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-input"
                      value={profile.medicalHistory}
                      onChange={(e) => handleProfileChange('medicalHistory', e.target.value)}
                      placeholder="Describe your medical history and current health status..."
                    />
                  </div>

                  {/* Medical Information */}
                  <div className="pt-4 border-t border-primary/10">
                    <h4 className="text-base font-semibold text-foreground mb-4">Medical Information</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cancerType">Cancer Type</Label>
                        <Input
                          id="cancerType"
                          value={profile.cancerType}
                          onChange={(e) => handleProfileChange('cancerType', e.target.value)}
                          placeholder="e.g., Breast Cancer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                        <Input
                          id="diagnosisDate"
                          type="date"
                          value={profile.diagnosisDate}
                          onChange={(e) => handleProfileChange('diagnosisDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentTreatment">Current Treatment</Label>
                        <Input
                          id="currentTreatment"
                          value={profile.currentTreatment}
                          onChange={(e) => handleProfileChange('currentTreatment', e.target.value)}
                          placeholder="e.g., Chemotherapy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="treatmentStage">Treatment Stage</Label>
                        <Select value={profile.treatmentStage} onValueChange={(value) => handleProfileChange('treatmentStage', value)}>
                          <SelectTrigger className="border-input focus:ring-primary/20">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stage-1">Stage 1</SelectItem>
                            <SelectItem value="stage-2">Stage 2</SelectItem>
                            <SelectItem value="stage-3">Stage 3</SelectItem>
                            <SelectItem value="stage-4">Stage 4</SelectItem>
                            <SelectItem value="in-remission">In Remission</SelectItem>
                            <SelectItem value="survivor">Survivor</SelectItem>
                            <SelectItem value="not-specified">Not Specified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Support Information */}
                  <div className="pt-4 border-t border-primary/10">
                    <h4 className="text-base font-semibold text-foreground mb-4">Support Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="supportNeeds">Support Needs</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile.supportNeeds.map((need, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                          >
                            {need}
                            <button
                              onClick={() => {
                                const newNeeds = profile.supportNeeds.filter((_, i) => i !== index);
                                handleProfileChange('supportNeeds', newNeeds);
                              }}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add support need..."
                          className="flex-1 border-input focus:ring-primary/20"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget as HTMLInputElement;
                              if (input.value.trim() && !profile.supportNeeds.includes(input.value.trim())) {
                                handleProfileChange('supportNeeds', [...profile.supportNeeds, input.value.trim()]);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            if (input.value.trim() && !profile.supportNeeds.includes(input.value.trim())) {
                              handleProfileChange('supportNeeds', [...profile.supportNeeds, input.value.trim()]);
                              input.value = '';
                            }
                          }}
                          className="border-primary/20 hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="familySupport">Family Support</Label>
                        <Select value={profile.familySupport} onValueChange={(value) => handleProfileChange('familySupport', value)}>
                          <SelectTrigger className="border-input focus:ring-primary/20">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strong">Strong Support</SelectItem>
                            <SelectItem value="moderate">Moderate Support</SelectItem>
                            <SelectItem value="limited">Limited Support</SelectItem>
                            <SelectItem value="none">No Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="consultationType">Preferred Consultation Types</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile.consultationType.map((type, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                          >
                            {type}
                            <button
                              onClick={() => {
                                const newTypes = profile.consultationType.filter((_, i) => i !== index);
                                handleProfileChange('consultationType', newTypes);
                              }}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => {
                          if (!profile.consultationType.includes(value)) {
                            handleProfileChange('consultationType', [...profile.consultationType, value]);
                          }
                        }}>
                          <SelectTrigger className="flex-1 border-input focus:ring-primary/20">
                            <SelectValue placeholder="Add consultation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="video">Video Call</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="chat">Chat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="specialRequests">Special Requests or Notes</Label>
                      <textarea
                        id="specialRequests"
                        className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-input"
                        value={profile.specialRequests}
                        onChange={(e) => handleProfileChange('specialRequests', e.target.value)}
                        placeholder="Any special requests or additional information..."
                      />
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="text-sm text-muted-foreground">
                      Primary language:{' '}
                      {profile.preferredLanguage
                        ? profile.preferredLanguage.charAt(0).toUpperCase() +
                          profile.preferredLanguage.slice(1)
                        : 'Not set'}
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {profile.additionalLanguages.map((language, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                          >
                            {language}
                            <button
                              onClick={() => handleRemoveLanguage(language)}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add a language..."
                          className="flex-1 border-input focus:ring-primary/20"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLanguage(newLanguage);
                              setNewLanguage('');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleAddLanguage(newLanguage);
                            setNewLanguage('');
                          }}
                          disabled={!newLanguage.trim()}
                          className="border-primary/20 hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Changes are saved automatically</span>
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!hasUnsavedChanges || isSaving}
                      className="min-w-[120px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      {isSaving ? (
                        <>
                          <Spinner variant="bars" size={16} className="text-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {activeTab === 'notifications' && (
            <AnimatedCard delay={0.2}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="space-y-1">
                      <Label className="text-base font-medium text-foreground">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="space-y-1">
                      <Label className="text-base font-medium text-foreground">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser notifications for important updates</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="space-y-1">
                      <Label className="text-base font-medium text-foreground">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Text message alerts for urgent matters</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Session & Support Notifications</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Session Reminders</Label>
                        <p className="text-sm text-muted-foreground">Remind me before scheduled sessions</p>
                      </div>
                      <Switch
                        checked={notifications.sessionReminders}
                        onCheckedChange={(checked) => handleNotificationChange('sessionReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Counselor Messages</Label>
                        <p className="text-sm text-muted-foreground">Messages from your counselors</p>
                      </div>
                      <Switch
                        checked={notifications.patientMessages}
                        onCheckedChange={(checked) => handleNotificationChange('patientMessages', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Resource Updates</Label>
                        <p className="text-sm text-muted-foreground">New resources and materials available</p>
                      </div>
                      <Switch
                        checked={notifications.resourceUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('resourceUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                      </div>
                      <Switch
                        checked={notifications.systemAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('systemAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <AnimatedCard delay={0.2}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Change Password</Label>
                        <p className="text-sm text-muted-foreground">Update your account password</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-primary/20 hover:bg-primary/10"
                        onClick={() => setShowPasswordChangeModal(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when there are logins from new devices or locations.
                        </p>
                      </div>
                      <Switch
                        checked={securityPreferences.loginAlerts}
                        onCheckedChange={(checked) =>
                          handleSecurityPreferenceChange('loginAlerts', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Sign Out Other Sessions</Label>
                        <p className="text-sm text-muted-foreground">
                          Immediately revoke access from other active sessions.
                        </p>
                        {securityPreferences.lastRevokeRequest && (
                          <p className="text-xs text-muted-foreground">
                            Last request: {new Date(securityPreferences.lastRevokeRequest).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/10"
                        onClick={handleSignOutOtherSessions}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Sign Out Others
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Data & Privacy</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Export Data</Label>
                        <p className="text-sm text-muted-foreground">Download your account data</p>
                      </div>
                      <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                        <Mail className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1">
                        <Label className="text-base font-medium text-foreground">Privacy Settings</Label>
                        <p className="text-sm text-muted-foreground">Manage your privacy preferences</p>
                      </div>
                      <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Delete Account Section */}
              <AnimatedCard delay={0.4}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-destructive/20">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Danger Zone</h3>
                  </div>

                  <div className="p-6 border border-destructive/20 rounded-xl bg-gradient-to-r from-destructive/5 to-transparent">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-semibold text-foreground mb-2">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>• All your profile information will be deleted</p>
                          <p>• Your session history will be permanently removed</p>
                          <p>• All messages and communications will be lost</p>
                          <p>• You will lose access to all platform features</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          variant="destructive"
                          className="bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {activeTab === 'preferences' && (
            <AnimatedCard delay={0.2}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings2 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Preferred Session Duration</Label>
                    <Select
                      value={sessionPreferences.sessionDuration}
                      onValueChange={(value) => handleSessionPreferenceChange('sessionDuration', value)}
                    >
                      <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Preferred Session Format</Label>
                    <Select
                      value={sessionPreferences.sessionType}
                      onValueChange={(value) => handleSessionPreferenceChange('sessionType', value)}
                    >
                      <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="audio">Audio Only</SelectItem>
                        <SelectItem value="chat">Text Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Reminder Lead Time</Label>
                    <Select
                      value={sessionPreferences.reminderLeadTime}
                      onValueChange={(value) => handleSessionPreferenceChange('reminderLeadTime', value)}
                    >
                      <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                        <SelectValue placeholder="Select reminder window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="48">48 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="6">6 hours before</SelectItem>
                        <SelectItem value="1">1 hour before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              </AnimatedCard>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6">
                {/* Create New Ticket */}
                <AnimatedCard delay={0.2}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Create Support Ticket</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-subject">Subject *</Label>
                        <Input
                          id="ticket-subject"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue"
                          className="border-input focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ticket-category">Category *</Label>
                          <Select 
                            value={ticketForm.category} 
                          onValueChange={(value) =>
                            setTicketForm(prev => ({
                              ...prev,
                              category: value as SupportTicketCategory,
                            }))
                          }
                          >
                            <SelectTrigger className="border-input focus:ring-primary/20">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="scheduling">Scheduling</SelectItem>
                              <SelectItem value="billing">Billing & Payment</SelectItem>
                              <SelectItem value="account">Account Issue</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticket-priority">Priority</Label>
                          <Select 
                            value={ticketForm.priority} 
                          onValueChange={(value) =>
                            setTicketForm(prev => ({
                              ...prev,
                              priority: value as SupportTicketPriority,
                            }))
                          }
                          >
                            <SelectTrigger className="border-input focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticket-description">Description *</Label>
                        <Textarea
                          id="ticket-description"
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Please provide detailed information about your issue. Include any error messages, steps to reproduce, and what you were trying to do when the issue occurred."
                          className="min-h-[150px] border-input focus:ring-primary/20 resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          The more details you provide, the faster we can help you.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>We typically respond within 24 hours</span>
                        </div>
                        <Button
                          onClick={handleCreateTicket}
                          disabled={isCreatingTicket || !ticketForm.subject || !ticketForm.category || !ticketForm.description}
                          className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          {isCreatingTicket ? (
                            <>
                              <Spinner variant="bars" size={16} className="text-white mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* My Tickets */}
                <AnimatedCard delay={0.3}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Ticket className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">My Support Tickets</h3>
                    </div>

                    {isLoadingTickets ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Spinner variant="bars" size={28} className="text-primary mb-3" />
                        <p>Loading your support tickets…</p>
                      </div>
                    ) : myTickets.length > 0 ? (
                      <div className="space-y-3">
                        {myTickets.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            className="p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold text-foreground">#{ticket.id}</h4>
                                  <p className="font-medium text-foreground">{ticket.subject}</p>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {ticket.description}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge className={getStatusColor(ticket.status)}>
                                    {ticket.status === 'in_progress'
                                      ? 'In Progress'
                                      : ticket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </Badge>
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                                  </Badge>
                                  <Badge variant="outline" className="border-primary/20">
                                    {ticket.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      Created {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Updated {new Date(ticket.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                  {ticket.resolved_at && (
                                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>
                                        Resolved {new Date(ticket.resolved_at).toLocaleDateString()}
                                      </span>
                              </div>
                                  )}
                                </div>
                                {ticket.admin_notes && (
                                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary-foreground/80">
                                    <p className="font-medium text-primary mb-1">Support Team Response</p>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                      {ticket.admin_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No support tickets yet</p>
                        <p className="text-sm text-muted-foreground">Create a ticket above if you need assistance</p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </div>
            )}
          </div>
        </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordChangeModal} onOpenChange={setShowPasswordChangeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordChangeData.currentPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordChangeData.newPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordChangeData.confirmPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordChangeModal(false);
                setPasswordChangeData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordChangeData.currentPassword || !passwordChangeData.newPassword || !passwordChangeData.confirmPassword}
            >
              {isChangingPassword ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Changing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete your account and remove all data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h4 className="font-semibold text-foreground mb-2">What will be deleted:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your profile and personal information</li>
                <li>• All session history and notes</li>
                <li>• All messages and communications</li>
                <li>• Your account credentials</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-destructive/20 focus:ring-destructive/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
