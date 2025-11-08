'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
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
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import { useRouter } from 'next/navigation';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useSessions } from '../../../../hooks/useSessions';
import { toast } from 'sonner';

export default function CounselorPatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inprogress'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [viewingPatient, setViewingPatient] = useState<AdminUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulePatient, setSchedulePatient] = useState<AdminUser | null>(null);

  // Load sessions to get assigned patients
  const counselorSessionsParams = useMemo(
    () => (user?.id ? { counselorId: user.id } : undefined),
    [user?.id]
  );

  const { sessions } = useSessions(counselorSessionsParams, {
    enabled: Boolean(user?.id),
  });

  // Load assigned patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        // Get unique patient IDs from sessions
        const patientIds = new Set(
          sessions.map(session => session.patientId)
        );
        
        // Fetch all patients
        const response = await AdminApi.listUsers({ role: 'patient' });
        const assignedPatientsList = response.users.filter(p => patientIds.has(p.id));
        setPatients(assignedPatientsList);
      } catch (error) {
        console.error('Error loading patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && sessions.length > 0) {
      loadPatients();
    } else if (user?.id) {
      setLoading(false);
    }
  }, [user?.id, sessions]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      (patient.fullName || patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((patient as any).currentModule || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Note: Progress tracking would need to be added to backend
    const avgProgress = (patient as any).avgProgress || 0;
    const isActive = avgProgress >= 80;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? isActive : !isActive);
    const matchesModule = moduleFilter === 'all' || ((patient as any).currentModule || '').toLowerCase() === moduleFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesModule;
  });

  const handleViewPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    setViewingPatient(patient);
    setIsProfileOpen(true);
  };

  const handleSendMessage = (patientId: string) => {
    router.push(`/dashboard/counselor/chat?patientId=${patientId}`);
  };

  const handleScheduleSession = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    setSchedulePatient(patient);
    setIsScheduleOpen(true);
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="My Patients"
        description="Manage your assigned patients and track their progress"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.length > 0 
                ? Math.round(patients.reduce((acc, p) => {
                    const avgProgress = (p as any).avgProgress || 0;
                    return acc + avgProgress;
                  }, 0) / patients.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average progress
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => {
                const avgProgress = (p as any).avgProgress || 0;
                return avgProgress >= 100;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Patients completed
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Search and Patient List moved below summary cards */}

      {/* Patient Progress Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle>Module Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.map((patient) => {
              const avgProgress = (patient as any).avgProgress || 0;
              return (
                <div key={patient.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={undefined} alt={patient.fullName || patient.email} />
                        <AvatarFallback>
                          {(patient.fullName || patient.email || 'P').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{patient.fullName || patient.email}</span>
                    </div>
                    <Badge variant="outline">
                      {Math.round(avgProgress)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={avgProgress} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {(patient as any).currentModule || 'No module'}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patients.slice(0, 3).map((patient) => (
              <div key={patient.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt={patient.fullName || patient.email} />
                  <AvatarFallback>
                    {(patient.fullName || patient.email || 'P').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{patient.fullName || patient.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {(patient as any).currentModule ? `Current module: ${(patient as any).currentModule}` : 'No module'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
    </div>

    {/* Search */}
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
        <Input
          placeholder="Search patients by name, email, or module..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
        />
      </div>
      <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>

    {/* Patients Table */}
    <AnimatedCard delay={0.5}>
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
                      <AvatarImage src={undefined} alt={patient.fullName || patient.email} />
                      <AvatarFallback>
                        {(patient.fullName || patient.email || 'P').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{patient.fullName || patient.email}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{(patient as any).currentModule || 'No module'}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {new Date(patient.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {Math.round((patient as any).avgProgress || 0)}%
                      </span>
                    </div>
                    <Progress 
                      value={(patient as any).avgProgress || 0} 
                      className="h-2" 
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Recent</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    ((patient as any).avgProgress || 0) >= 80 
                      ? "default" 
                      : "secondary"
                  }>
                    {((patient as any).avgProgress || 0) >= 80 
                      ? "Active" 
                      : "In Progress"}
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
    </AnimatedCard>
    {/* Profile modal */}
    {viewingPatient && (
      <ProfileViewModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={{
          id: viewingPatient.id,
          name: viewingPatient.fullName || viewingPatient.email || 'Patient',
          email: viewingPatient.email,
          role: 'patient' as const,
          avatar: undefined,
          createdAt: new Date(viewingPatient.createdAt),
          diagnosis: undefined,
          treatmentStage: undefined,
          assignedCounselor: undefined,
          moduleProgress: undefined,
        }}
        userType="patient"
        currentUserRole="counselor"
      />
    )}

    {/* Schedule session modal */}
    <ScheduleSessionModal
      isOpen={isScheduleOpen}
      onClose={() => setIsScheduleOpen(false)}
      counselorId={user?.id || ''}
      counselorName={user?.name || 'Counselor'}
      patients={patients.map(p => ({ id: p.id, name: p.fullName || p.email || 'Patient', avatar: undefined }))}
      preselectedPatientId={schedulePatient?.id}
      onSchedule={() => {
        alert('Session scheduled');
        setIsScheduleOpen(false);
      }}
    />

    {/* Filter dialog */}
    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Patients</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active (≥ 80%)</SelectItem>
                  <SelectItem value="inprogress">In Progress (&lt; 80%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Module</label>
              <Select value={moduleFilter} onValueChange={(v: any) => setModuleFilter(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(patients.map(p => (p as any).currentModule).filter(Boolean))].map((m) => (
                    <SelectItem key={m as string} value={String(m)}>{String(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setStatusFilter('all'); setModuleFilter('all'); }}>Reset</Button>
            <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
