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
  FileText,
  HelpCircle,
  Ticket
} from 'lucide-react';
import { dummyPatients, dummySupportTickets } from '../../../../lib/dummy-data';
import { Textarea } from '@workspace/ui/components/textarea';

export default function PatientSettingsPage() {
  const currentPatient = dummyPatients[0]; // Jean Baptiste
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

  const myTickets = dummySupportTickets.filter(ticket => ticket.userId === currentPatient?.id);

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
    name: currentPatient?.name || '',
    email: currentPatient?.email || '',
    phoneNumber: currentPatient?.phoneNumber || '',
    emergencyContact: currentPatient?.emergencyContact || '',
    dateOfBirth: currentPatient?.dateOfBirth || new Date(),
    medicalHistory: currentPatient?.medicalHistory || '',
    currentModule: currentPatient?.currentModule || '',
    language: 'en',
    timezone: 'Africa/Kigali',
    languages: ['English', 'Kinyarwanda']
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving profile:', profile);
      setHasUnsavedChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Implement logout logic
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (field: string, value: string | number | string[] | Date) => {
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
                      <AvatarImage src={currentPatient?.avatar} alt={currentPatient?.name} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {currentPatient?.name?.split(' ').map(n => n[0]).join('')}
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
                    <h2 className="text-2xl font-bold text-foreground">{currentPatient?.name}</h2>
                    <p className="text-primary font-medium">Patient</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Patient since {currentPatient?.createdAt?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{currentPatient?.currentModule || 'No module assigned'}</span>
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
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phoneNumber}
                        onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency">Emergency Contact</Label>
                      <Input
                        id="emergency"
                        value={profile.emergencyContact}
                        onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth instanceof Date ? profile.dateOfBirth.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleProfileChange('dateOfBirth', new Date(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentModule">Current Module</Label>
                      <Input
                        id="currentModule"
                        value={profile.currentModule}
                        onChange={(e) => handleProfileChange('currentModule', e.target.value)}
                        placeholder="e.g., Coping with Anxiety"
                      />
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

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label>Languages</Label>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Primary Language</Label>
                      <Select value={profile.language} onValueChange={(value) => handleProfileChange('language', value)}>
                        <SelectTrigger className="border-input focus:ring-primary/20">
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
                        <SelectTrigger className="border-input focus:ring-primary/20">
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
                      <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
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
                    <Label className="text-base font-medium text-foreground">Preferred Session Type</Label>
                    <Select defaultValue="video">
                      <SelectTrigger className="w-48 border-primary/20 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="audio">Audio Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
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
