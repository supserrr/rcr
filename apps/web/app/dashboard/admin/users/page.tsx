'use client';

import React, { useState, useEffect } from 'react';
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
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'counselor' | 'admin' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await AdminApi.listUsers();
        setUsers(response.users);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    // Note: lastLogin not in AdminUser type, would need to be added to backend
    const matchesStatus = selectedStatus === 'all'; // Always true for now
    
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
    // Note: lastLogin not in AdminUser type, would need to be added to backend
    // For now, assume all users are active
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (user: AdminUser) => {
    // Note: lastLogin not in AdminUser type, would need to be added to backend
    // For now, assume all users are active
    return 'Active';
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
              <p className="text-2xl font-bold">{loading ? '...' : users.length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patients</p>
              <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'patient').length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Counselors</p>
              <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'counselor').length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'admin').length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    {/* Note: lastLogin not in AdminUser type, would need to be added to backend */}
                    <span className="text-sm text-muted-foreground">N/A</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
        </div>
      </div>
    </div>
  );
}
