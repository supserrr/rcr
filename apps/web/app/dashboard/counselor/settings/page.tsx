'use client';

import React, { useState } from 'react';
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
  HelpCircle,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { AuthApi } from '../../../../lib/api/auth';
import { toast } from 'sonner';
import { Textarea } from '@workspace/ui/components/textarea';
import { useEffect } from 'react';

export default function CounselorSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
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
    category: '',
    priority: 'medium',
    description: ''
  });

  // Support tickets - placeholder for now (no API endpoint yet)
  const myTickets: any[] = [];
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sessionReminders: true,
    patientMessages: true,
    resourceUpdates: true,
    systemAlerts: true
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    specialty: '',
    bio: '',
    credentials: '',
    experience: 0,
    location: '',
    language: 'en',
    timezone: 'Africa/Kigali',
    languages: [] as string[],
    // Onboarding data
    licenseNumber: '',
    licenseExpiry: '',
    issuingAuthority: '',
    highestDegree: '',
    university: '',
    graduationYear: '',
    additionalCertifications: [] as string[],
    yearsOfExperience: '',
    previousEmployers: '',
    specializations: [] as string[],
    consultationTypes: [] as string[],
    availability: '',
    motivation: '',
    references: '',
    emergencyContact: '',
    avatar_url: user?.avatar || ''
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const currentUser = await AuthApi.getCurrentUser();
        const metadata = currentUser.metadata || {};
        
        setProfile(prev => ({
          ...prev,
          name: currentUser.name,
          email: currentUser.email,
          phoneNumber: (typeof metadata.phoneNumber === 'string' ? metadata.phoneNumber : (currentUser as any).phoneNumber) || '',
          specialty: (typeof metadata.specialty === 'string' ? metadata.specialty : (Array.isArray(metadata.specializations) && metadata.specializations.length > 0 ? metadata.specializations[0] : '')) || '',
          bio: (typeof metadata.bio === 'string' ? metadata.bio : '') || '',
          credentials: (typeof metadata.credentials === 'string' ? metadata.credentials : '') || '',
          experience: typeof metadata.experience === 'number' ? metadata.experience : (typeof metadata.yearsOfExperience === 'string' ? parseInt(metadata.yearsOfExperience) : (typeof metadata.yearsOfExperience === 'number' ? metadata.yearsOfExperience : 0)),
          location: (typeof metadata.location === 'string' ? metadata.location : '') || '',
          language: (typeof metadata.language === 'string' ? metadata.language : 'en') || 'en',
          timezone: (typeof metadata.timezone === 'string' ? metadata.timezone : 'Africa/Kigali') || 'Africa/Kigali',
          languages: Array.isArray(metadata.languages) ? metadata.languages : [],
          // Onboarding data from metadata
          licenseNumber: (typeof metadata.licenseNumber === 'string' ? metadata.licenseNumber : '') || '',
          licenseExpiry: (typeof metadata.licenseExpiry === 'string' ? metadata.licenseExpiry : '') || '',
          issuingAuthority: (typeof metadata.issuingAuthority === 'string' ? metadata.issuingAuthority : '') || '',
          highestDegree: (typeof metadata.highestDegree === 'string' ? metadata.highestDegree : '') || '',
          university: (typeof metadata.university === 'string' ? metadata.university : '') || '',
          graduationYear: (typeof metadata.graduationYear === 'string' ? metadata.graduationYear : (typeof metadata.graduationYear === 'number' ? String(metadata.graduationYear) : '')) || '',
          additionalCertifications: Array.isArray(metadata.additionalCertifications) ? metadata.additionalCertifications : [],
          yearsOfExperience: (typeof metadata.yearsOfExperience === 'string' ? metadata.yearsOfExperience : (typeof metadata.yearsOfExperience === 'number' ? String(metadata.yearsOfExperience) : '')) || '',
          previousEmployers: (typeof metadata.previousEmployers === 'string' ? metadata.previousEmployers : '') || '',
          specializations: Array.isArray(metadata.specializations) ? metadata.specializations : [],
          consultationTypes: Array.isArray(metadata.consultationTypes) ? metadata.consultationTypes : [],
          availability: (typeof metadata.availability === 'string' ? metadata.availability : '') || '',
          motivation: (typeof metadata.motivation === 'string' ? metadata.motivation : '') || '',
          references: (typeof metadata.references === 'string' ? metadata.references : '') || '',
          emergencyContact: (typeof metadata.emergencyContact === 'string' ? metadata.emergencyContact : '') || '',
          avatar_url: (typeof currentUser.avatar === 'string' ? currentUser.avatar : (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '')) || ''
        }));
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

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      // Update profile with all fields including onboarding data
      await AuthApi.updateProfile({
        fullName: profile.name,
        phoneNumber: profile.phoneNumber,
        metadata: {
          // Basic profile fields
          phoneNumber: profile.phoneNumber,
          specialty: profile.specialty,
          bio: profile.bio,
          credentials: profile.credentials,
          experience: profile.experience,
          location: profile.location,
          language: profile.language,
          timezone: profile.timezone,
          languages: profile.languages,
          // Onboarding data
          licenseNumber: profile.licenseNumber,
          licenseExpiry: profile.licenseExpiry,
          issuingAuthority: profile.issuingAuthority,
          highestDegree: profile.highestDegree,
          university: profile.university,
          graduationYear: profile.graduationYear,
          additionalCertifications: profile.additionalCertifications,
          yearsOfExperience: profile.yearsOfExperience,
          previousEmployers: profile.previousEmployers,
          specializations: profile.specializations,
          consultationTypes: profile.consultationTypes,
          availability: profile.availability,
          motivation: profile.motivation,
          references: profile.references,
          emergencyContact: profile.emergencyContact,
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

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (field: string, value: string | number | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAddLanguage = (language: string) => {
    if (language && !profile.languages.includes(language)) {
      setProfile(prev => ({ 
        ...prev, 
        languages: [...prev.languages, language] 
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setProfile(prev => ({ 
      ...prev, 
      languages: prev.languages.filter(lang => lang !== languageToRemove) 
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Account deleted successfully');
      // Redirect to login or home page
      // window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingTicket(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating ticket:', ticketForm);
      
      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: ''
      });
      
      alert('Support ticket created successfully! Ticket ID: #' + Date.now().toString().slice(-6));
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                        <AvatarImage src={undefined} alt={user?.name || 'Counselor'} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg border-primary/20 hover:bg-primary/10"
                      >
                        <Camera className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground">{user?.name || 'Counselor'}</h2>
                      <p className="text-primary font-medium">{profile.specialty || 'General Counseling'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{profile.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location || 'Not specified'}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Verified Counselor
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phoneNumber}
                          onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          value={profile.specialty}
                          onChange={(e) => handleProfileChange('specialty', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        placeholder="Tell patients about your background, approach, and expertise..."
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="credentials">Credentials</Label>
                        <Input
                          id="credentials"
                          value={profile.credentials}
                          onChange={(e) => handleProfileChange('credentials', e.target.value)}
                          placeholder="e.g., PhD in Clinical Psychology"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={profile.experience}
                          onChange={(e) => handleProfileChange('experience', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>

                    {/* Professional Information */}
                    <div className="pt-4 border-t border-primary/10">
                      <h4 className="text-base font-semibold text-foreground mb-4">Professional Information</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            value={profile.licenseNumber}
                            onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
                            placeholder="Enter license number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                          <Input
                            id="licenseExpiry"
                            type="date"
                            value={profile.licenseExpiry}
                            onChange={(e) => handleProfileChange('licenseExpiry', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                        <Input
                          id="issuingAuthority"
                          value={profile.issuingAuthority}
                          onChange={(e) => handleProfileChange('issuingAuthority', e.target.value)}
                          placeholder="e.g., Rwanda Medical Council"
                        />
                      </div>
                    </div>

                    {/* Education */}
                    <div className="pt-4 border-t border-primary/10">
                      <h4 className="text-base font-semibold text-foreground mb-4">Education</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="highestDegree">Highest Degree</Label>
                          <Input
                            id="highestDegree"
                            value={profile.highestDegree}
                            onChange={(e) => handleProfileChange('highestDegree', e.target.value)}
                            placeholder="e.g., PhD, Master's, Bachelor's"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="university">University</Label>
                          <Input
                            id="university"
                            value={profile.university}
                            onChange={(e) => handleProfileChange('university', e.target.value)}
                            placeholder="University name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={profile.graduationYear}
                          onChange={(e) => handleProfileChange('graduationYear', e.target.value)}
                          placeholder="e.g., 2020"
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="additionalCertifications">Additional Certifications</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.additionalCertifications.map((cert, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                            >
                              {cert}
                              <button
                                onClick={() => {
                                  const newCerts = profile.additionalCertifications.filter((_, i) => i !== index);
                                  handleProfileChange('additionalCertifications', newCerts);
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
                            placeholder="Add certification..."
                            className="flex-1 border-input focus:ring-primary/20"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget as HTMLInputElement;
                                if (input.value.trim() && !profile.additionalCertifications.includes(input.value.trim())) {
                                  handleProfileChange('additionalCertifications', [...profile.additionalCertifications, input.value.trim()]);
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
                              if (input.value.trim() && !profile.additionalCertifications.includes(input.value.trim())) {
                                handleProfileChange('additionalCertifications', [...profile.additionalCertifications, input.value.trim()]);
                                input.value = '';
                              }
                            }}
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="pt-4 border-t border-primary/10">
                      <h4 className="text-base font-semibold text-foreground mb-4">Experience</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            value={profile.yearsOfExperience}
                            onChange={(e) => handleProfileChange('yearsOfExperience', e.target.value)}
                            placeholder="e.g., 5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="previousEmployers">Previous Employers</Label>
                          <Input
                            id="previousEmployers"
                            value={profile.previousEmployers}
                            onChange={(e) => handleProfileChange('previousEmployers', e.target.value)}
                            placeholder="List previous employers"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="specializations">Specializations</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.specializations.map((spec, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                            >
                              {spec}
                              <button
                                onClick={() => {
                                  const newSpecs = profile.specializations.filter((_, i) => i !== index);
                                  handleProfileChange('specializations', newSpecs);
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
                            placeholder="Add specialization..."
                            className="flex-1 border-input focus:ring-primary/20"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget as HTMLInputElement;
                                if (input.value.trim() && !profile.specializations.includes(input.value.trim())) {
                                  handleProfileChange('specializations', [...profile.specializations, input.value.trim()]);
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
                              if (input.value.trim() && !profile.specializations.includes(input.value.trim())) {
                                handleProfileChange('specializations', [...profile.specializations, input.value.trim()]);
                                input.value = '';
                              }
                            }}
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="pt-4 border-t border-primary/10">
                      <h4 className="text-base font-semibold text-foreground mb-4">Professional Details</h4>
                      <div className="space-y-2">
                        <Label htmlFor="consultationTypes">Consultation Types</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.consultationTypes.map((type, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex items-center gap-1"
                            >
                              {type}
                              <button
                                onClick={() => {
                                  const newTypes = profile.consultationTypes.filter((_, i) => i !== index);
                                  handleProfileChange('consultationTypes', newTypes);
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
                            if (!profile.consultationTypes.includes(value)) {
                              handleProfileChange('consultationTypes', [...profile.consultationTypes, value]);
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
                        <Label htmlFor="availability">Availability</Label>
                        <Input
                          id="availability"
                          value={profile.availability}
                          onChange={(e) => handleProfileChange('availability', e.target.value)}
                          placeholder="e.g., Weekdays 9am-5pm"
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="motivation">Motivation Statement</Label>
                        <textarea
                          id="motivation"
                          className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-input"
                          value={profile.motivation}
                          onChange={(e) => handleProfileChange('motivation', e.target.value)}
                          placeholder="Why you want to be a counselor..."
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="references">References</Label>
                        <textarea
                          id="references"
                          className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground border-input"
                          value={profile.references}
                          onChange={(e) => handleProfileChange('references', e.target.value)}
                          placeholder="Professional references..."
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          value={profile.emergencyContact}
                          onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                          placeholder="Emergency contact information"
                        />
                      </div>
                    </div>

                    {/* Professional Languages */}
                    <div className="space-y-2">
                      <Label>Professional Languages</Label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
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
                            className="flex-1"
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
                        <p className="text-xs text-muted-foreground">
                          Languages you can provide counseling in
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="language">Primary Language</Label>
                        <Select value={profile.language} onValueChange={(value) => handleProfileChange('language', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="rw">Kinyarwanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={profile.timezone} onValueChange={(value) => handleProfileChange('timezone', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Kigali">Africa/Kigali</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                    <h3 className="text-lg font-semibold text-foreground mb-4">Session & Patient Notifications</h3>
                    
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
                          <Label className="text-base font-medium text-foreground">Patient Messages</Label>
                          <p className="text-sm text-muted-foreground">Messages from patients and families</p>
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
                          <Label className="text-base font-medium text-foreground">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Shield className="h-4 w-4 mr-2" />
                          Enable
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-foreground">Login Activity</Label>
                          <p className="text-sm text-muted-foreground">View recent login attempts</p>
                        </div>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
                            <p>• Your patient assignments will be reassigned</p>
                            <p>• All session history will be permanently removed</p>
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
                      <Label className="text-base font-medium text-foreground">Default Session Duration</Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                          <SelectValue />
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
                      <Label className="text-base font-medium text-foreground">Working Hours</Label>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <Label className="text-sm text-muted-foreground">Start Time</Label>
                          <Input type="time" defaultValue="09:00" className="border-primary/20 focus:ring-primary/20" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">End Time</Label>
                          <Input type="time" defaultValue="17:00" className="border-primary/20 focus:ring-primary/20" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">Time Zone</Label>
                      <Select defaultValue="Africa/Kigali">
                        <SelectTrigger className="w-64 border-primary/20 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Kigali">Africa/Kigali (GMT+2)</SelectItem>
                          <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
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
                            onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger className="border-input focus:ring-primary/20">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="scheduling">Scheduling</SelectItem>
                              <SelectItem value="billing">Billing & Payment</SelectItem>
                              <SelectItem value="account">Account Issue</SelectItem>
                              <SelectItem value="patient">Patient-related Issue</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticket-priority">Priority</Label>
                          <Select 
                            value={ticketForm.priority} 
                            onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
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
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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

                    {myTickets.length > 0 ? (
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
                                    {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                  </Badge>
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                                  </Badge>
                                  <Badge variant="outline" className="border-primary/20">
                                    {ticket.category}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>Created {ticket.createdAt.toLocaleDateString()}</span>
                                  </div>
                                </div>
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                <li>• Patient assignments (will be reassigned)</li>
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
