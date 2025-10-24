'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/dashboard/shared/PageHeader';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { 
  Search, 
  Eye, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Users,
  Filter
} from 'lucide-react';
import { dummyPatients, dummyCounselors } from '../../../../lib/dummy-data';

export default function CounselorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const currentCounselor = dummyCounselors[0]; // Dr. Marie Claire
  const assignedPatients = dummyPatients.filter(patient => 
    currentCounselor.patients.includes(patient.id)
  );

  const filteredPatients = assignedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.currentModule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patientId: string) => {
    console.log('View patient:', patientId);
  };

  const handleSendMessage = (patientId: string) => {
    console.log('Send message to patient:', patientId);
  };

  const handleScheduleSession = (patientId: string) => {
    console.log('Schedule session with patient:', patientId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Patients"
        description="Manage your assigned patients and track their progress"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(assignedPatients.reduce((acc, p) => acc + p.moduleProgress, 0) / assignedPatients.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedPatients.filter(p => p.moduleProgress >= 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Patients completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, email, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Current Module</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{patient.currentModule}</p>
                      <p className="text-xs text-muted-foreground">
                        Started {patient.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{patient.moduleProgress}%</span>
                      </div>
                      <Progress value={patient.moduleProgress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">2 days ago</p>
                      <p className="text-xs text-muted-foreground">Individual session</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.moduleProgress >= 80 ? "default" : "secondary"}>
                      {patient.moduleProgress >= 80 ? "Active" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPatient(patient.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendMessage(patient.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleSession(patient.id)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Progress Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Module Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignedPatients.map((patient) => (
              <div key={patient.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
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
                  {patient.currentModule}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedPatients.slice(0, 3).map((patient) => (
              <div key={patient.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Completed lesson in {patient.currentModule}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  2h ago
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
