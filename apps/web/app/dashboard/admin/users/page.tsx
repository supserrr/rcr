'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  AdminApi,
  type AdminUser,
  type UserSummary,
} from '../../../../lib/api/admin';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'counselor' | 'admin' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setSummaryLoading(true);
        const [summaryResponse, response] = await Promise.all([
          AdminApi.getUserSummary(),
          AdminApi.listUsers(),
        ]);
        setSummary(summaryResponse);
        setUsers(response.users);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.fullName || user.email || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isUserActive(user)) ||
        (selectedStatus === 'inactive' && !isUserActive(user));

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const handleViewUser = async (userId: string) => {
    setViewLoading(true);
    try {
      const detail = await AdminApi.getUser(userId);
      setSelectedUser(detail);
      setViewModalOpen(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this account? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await AdminApi.deleteUser(userId);
      setUsers((previous) => previous.filter((user) => user.id !== userId));
      toast.success('User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUser = () => {
    console.log('Add new user');
  };

  const getRoleColor = (role: 'patient' | 'counselor' | 'admin') => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'counselor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user: AdminUser) => {
    return isUserActive(user)
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (user: AdminUser) => {
    return isUserActive(user) ? 'Active' : 'Inactive';
  };

  const totalUsers = summary?.totals.total ?? users.length;
  const verifiedCount = summary?.verification.verified ?? 0;
  const unverifiedCount = summary?.verification.unverified ?? 0;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="User Management"
        description="Manage all users, patients, counselors, and administrators"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.total ?? users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patients</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.patients ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Counselors</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.counselors ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.admins ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.verification.verified ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unverified</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.verification.unverified ?? 0}
              </p>
            </div>
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'patient' | 'counselor' | 'admin' | 'all')}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="counselor">Counselors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner variant="bars" size={36} className="text-primary" />
        </div>
      ) : (
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={`${user.id}-${user.role}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={undefined} alt={user.fullName || user.email} />
                        <AvatarFallback>
                          {(user.fullName || user.email || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName || user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user)}>
                      {getStatusText(user)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : 'No activity'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(user.id)}
                        disabled={viewLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>
      )}

      {/* Results Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {totalUsers} users
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
          <Button size="sm" onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Review account metadata and recent activity.</DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner variant="bars" size={32} className="text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>
                    {(selectedUser.fullName || selectedUser.email || 'U')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {selectedUser.fullName || 'Not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem label="Role" value={selectedUser.role} />
                <InfoItem
                  label="Verified"
                  value={selectedUser.isVerified ? 'Yes' : 'No'}
                />
                <InfoItem
                  label="Status"
                  value={isUserActive(selectedUser) ? 'Active' : 'Inactive'}
                />
                <InfoItem
                  label="Created"
                  value={new Date(selectedUser.createdAt).toLocaleString()}
                />
                <InfoItem
                  label="Last login"
                  value={
                    selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Never'
                  }
                />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No user selected.
            </div>
          )}
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isUserActive(user: AdminUser) {
  if (!user.lastLogin) {
    return false;
  }
  const lastLoginDate = new Date(user.lastLogin);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return lastLoginDate >= thirtyDaysAgo;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  );
}
