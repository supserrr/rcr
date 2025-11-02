'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Target,
  Circle,
  CircleDot,
  Minus
} from 'lucide-react';
import { dummyCounselors, dummySessions, dummyPatients, dummyMessages, dummyChats } from '../../../lib/dummy-data';

export default function CounselorDashboard() {
  const router = useRouter();
  const [currentCounselor, setCurrentCounselor] = useState(dummyCounselors[0]!);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>(currentCounselor.availability);
  const assignedPatients = dummyPatients.filter(patient => 
    currentCounselor?.patients?.includes(patient.id)
  );
  const upcomingSessions = dummySessions.filter(session => 
    session.counselorId === currentCounselor?.id && 
    session.status === 'scheduled' &&
    new Date(session.date) > new Date()
  );
  const recentMessages = dummyMessages.filter(msg => 
    msg.senderId === currentCounselor?.id || msg.receiverId === currentCounselor?.id
  ).slice(0, 3);

  const getPatientName = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.avatar;
  };

  const handleMessageClick = (message: any) => {
    // Find the chat that includes this message
    // For counselor, the message should be from/to the counselor
    const chatId = dummyChats.find(chat => 
      chat.participants.includes(currentCounselor?.id || '') &&
      (message.senderId === currentCounselor?.id || message.receiverId === currentCounselor?.id)
    )?.id;
    
    if (chatId) {
      router.push(`/dashboard/counselor/chat?chatId=${chatId}`);
    } else {
      // Fallback: just navigate to chat page
      router.push('/dashboard/counselor/chat');
    }
  };

  const handleAvailabilityChange = (newAvailability: 'available' | 'busy' | 'offline') => {
    setAvailability(newAvailability);
    // In a real app, this would update the availability in the backend
    setCurrentCounselor({ ...currentCounselor, availability: newAvailability });
    console.log('Availability changed to:', newAvailability);
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'available':
        return CircleDot;
      case 'busy':
        return Circle;
      case 'offline':
        return Minus;
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Welcome back, Dr. Marie Claire"
        description="Here&apos;s an overview of your patients and upcoming sessions"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Active Patients"
          value={assignedPatients.length}
          description="Currently assigned"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <AnimatedStatCard
          title="Upcoming Sessions"
          value={upcomingSessions.length}
          description="Next session in 2 hours"
          icon={Calendar}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Messages"
          value={recentMessages.length}
          description="Unread messages"
          icon={MessageCircle}
          delay={0.3}
        />
        
        {/* Availability Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group">
            {/* Decorative gradient blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
            
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Availability Status
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="p-2 rounded-full bg-primary/10"
                >
                  {React.createElement(getAvailabilityIcon(), { className: 'h-4 w-4 text-primary' })}
                </motion.div>
              </div>
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-2xl font-bold"
                >
                  {availability.charAt(0).toUpperCase() + availability.slice(1)}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  Change status below
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="mt-4 pt-4 border-t border-border/20"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={availability === 'available' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'available' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleAvailabilityChange('available')}
                    >
                      <CircleDot className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={availability === 'busy' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'busy' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      onClick={() => handleAvailabilityChange('busy')}
                    >
                      <Circle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={availability === 'offline' ? 'default' : 'outline'}
                      size="sm"
                      className={availability === 'offline' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                      onClick={() => handleAvailabilityChange('offline')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Upcoming Sessions */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getPatientAvatar(session.patientId)} alt={getPatientName(session.patientId)} />
                        <AvatarFallback>
                          {getPatientName(session.patientId).split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{getPatientName(session.patientId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} at{' '}
                          {new Date(session.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{session.duration} min</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/counselor/sessions/session/${session.id}`)}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Patient Progress Overview */}
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Patient Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedPatients.map((patient) => (
                <div key={patient.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{patient.name}</span>
                    </div>
                    <Badge variant="outline">
                      {Object.values(patient.moduleProgress || {}).reduce((sum, progress) => sum + progress, 0) / Object.keys(patient.moduleProgress || {}).length || 0}%
                    </Badge>
                  </div>
                  <Progress 
                    value={Object.values(patient.moduleProgress || {}).reduce((sum, progress) => sum + progress, 0) / Object.keys(patient.moduleProgress || {}).length || 0} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Current module: {patient.currentModule}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Recent Messages */}
        <AnimatedCard delay={0.9}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => {
                  const isFromCounselor = message.senderId === currentCounselor?.id;
                  const patientName = isFromCounselor ? 
                    getPatientName(message.receiverId) : 
                    getPatientName(message.senderId);
                  
                  return (
                    <div 
                      key={message.id} 
                      onClick={() => handleMessageClick(message)}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-200"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getPatientAvatar(isFromCounselor ? message.receiverId : message.senderId)} />
                        <AvatarFallback>
                          {patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{patientName}</p>
                          <div className="flex items-center gap-2">
                            {isFromCounselor && (
                              <Badge variant="secondary" className="text-xs">Sent</Badge>
                            )}
                            {!message.isRead && !isFromCounselor && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent messages</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard delay={1.1}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/counselor/sessions')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/counselor/chat')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message to Patient
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                // In a real app, this would open a support ticket or issue reporting modal
                alert('Report Issue feature - would open issue reporting form');
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>
    </div>
  );
}
