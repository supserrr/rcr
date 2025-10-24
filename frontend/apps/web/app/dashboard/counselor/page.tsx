'use client';

import React from 'react';
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
  Target
} from 'lucide-react';
import { dummyCounselors, dummySessions, dummyPatients, dummyMessages } from '../../../lib/dummy-data';

export default function CounselorDashboard() {
  const currentCounselor = dummyCounselors[0]; // Dr. Marie Claire
  const assignedPatients = dummyPatients.filter(patient => 
    currentCounselor.patients.includes(patient.id)
  );
  const upcomingSessions = dummySessions.filter(session => 
    session.counselorId === currentCounselor.id && 
    session.status === 'scheduled' &&
    new Date(session.scheduledAt) > new Date()
  );
  const recentMessages = dummyMessages.filter(msg => 
    msg.senderId === currentCounselor.id || msg.receiverId === currentCounselor.id
  ).slice(0, 3);

  const getPatientName = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient?.avatar;
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Welcome back, Dr. Marie Claire"
        description="Here's an overview of your patients and upcoming sessions"
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
        <AnimatedStatCard
          title="Rating"
          value={currentCounselor.rating}
          description="Based on patient feedback"
          icon={Star}
          trend={{ value: 5, isPositive: true }}
          delay={0.4}
        />
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
                          {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{session.duration} min</Badge>
                      <Button size="sm" variant="outline">
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
                    <Badge variant="outline">{patient.moduleProgress}%</Badge>
                  </div>
                  <Progress value={patient.moduleProgress} className="h-2" />
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
                  const isFromCounselor = message.senderId === currentCounselor.id;
                  const patientName = isFromCounselor ? 
                    getPatientName(message.receiverId) : 
                    getPatientName(message.senderId);
                  
                  return (
                    <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
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
            <Button className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Session
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message to Patient
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Add Session Notes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>
    </div>
  );
}
