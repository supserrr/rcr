'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
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
import { dummyUsers, dummyPatients, dummyCounselors } from '../../../../lib/dummy-data';
import { UserRole } from '../../../../lib/types';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const allUsers = [...dummyUsers, ...dummyPatients, ...dummyCounselors];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' ? user.lastLogin : !user.lastLogin);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewUser = (userId: string) => {
    console.log('View user:', userId);
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
  };

  const handleAddUser = () => {
    console.log('Add new user');
  };

  const getRoleColor = (role: UserRole) => {
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

  const getStatusColor = (user: any) => {
    if (user.lastLogin) {
      const daysSinceLogin = Math.floor((Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin <= 7) return 'bg-green-100 text-green-800';
      if (daysSinceLogin <= 30) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (user: any) => {
    if (user.lastLogin) {
      const daysSinceLogin = Math.floor((Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin <= 7) return 'Active';
      if (daysSinceLogin <= 30) return 'Inactive';
      return 'Dormant';
    }
    return 'Never logged in';
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="User Management"
        description="Manage all users, patients, counselors, and administrators"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{allUsers.length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patients</p>
              <p className="text-2xl font-bold">{dummyPatients.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Counselors</p>
              <p className="text-2xl font-bold">{dummyCounselors.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </AnimatedCard>
        
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-lg">
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </AnimatedCard>
                  </AnimatedCard>
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
                  {user.lastLogin ? (
                    <div>
                      <p className="text-sm">{user.lastLogin.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.lastLogin.toLocaleTimeString()}
                      </p>
                    </AnimatedCard>
                  ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.createdAt.toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </AnimatedCard>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(user.id)}
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AnimatedCard>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {allUsers.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
        </AnimatedCard>
      </div>
    </div>
  );
}
