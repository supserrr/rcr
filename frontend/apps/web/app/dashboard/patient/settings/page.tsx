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
  EyeOff
} from 'lucide-react';
import { dummyPatients } from '../../../../lib/dummy-data';

export default function PatientSettingsPage() {
  const currentPatient = dummyPatients[0]; // Jean Baptiste
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sessionReminders: true,
    resourceUpdates: true,
    supportMessages: true
  });

  const [profile, setProfile] = useState({
    name: currentPatient.name,
    email: currentPatient.email,
    phoneNumber: currentPatient.phoneNumber,
    emergencyContact: currentPatient.emergencyContact,
    language: 'en',
    timezone: 'Africa/Kigali'
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
    // Implement save logic
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

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Settings"
        description="Manage your account settings, preferences, and privacy"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentPatient.avatar} alt={currentPatient.name} />
                    <AvatarFallback>
                      {currentPatient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">{currentPatient.name}</h3>
                  <p className="text-sm text-muted-foreground">Patient since {currentPatient.createdAt.toLocaleDateString()}</p>
                  <Badge variant="secondary" className="mt-1">
                    {currentPatient.role.charAt(0).toUpperCase() + currentPatient.role.slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={profile.language} onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}>
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
                  <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}>
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

              <Button onClick={handleSaveProfile} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </AnimatedCard>

          {/* Medical Information */}
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentPatient.dateOfBirth.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Module</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <span className="text-sm">{currentPatient.currentModule}</span>
                    <Badge variant="outline">{currentPatient.moduleProgress}%</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Medical History</Label>
                <div className="p-3 border rounded-md bg-muted/50">
                  <p className="text-sm">{currentPatient.medicalHistory}</p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Text message alerts</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Reminders</Label>
                  <p className="text-sm text-muted-foreground">Remind me before sessions</p>
                </div>
                <Switch
                  checked={notifications.sessionReminders}
                  onCheckedChange={(checked) => handleNotificationChange('sessionReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resource Updates</Label>
                  <p className="text-sm text-muted-foreground">New resources available</p>
                </div>
                <Switch
                  checked={notifications.resourceUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('resourceUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Support Messages</Label>
                  <p className="text-sm text-muted-foreground">Messages from counselors</p>
                </div>
                <Switch
                  checked={notifications.supportMessages}
                  onCheckedChange={(checked) => handleNotificationChange('supportMessages', checked)}
                />
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Account Actions */}
          <AnimatedCard delay={0.5}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              
              <Separator />
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
