'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Trash2, 
  Eye,
  Filter,
  Users,
  UserCheck,
  UserX,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  Calendar,
  Briefcase,
  Shield,
  GraduationCap,
  Star,
  Heart,
  FileText,
  Download
} from 'lucide-react';
import {
  AdminApi,
  type AdminUser,
  type UserSummary,
} from '../../../../lib/api/admin';
import { createClient as createSupabaseClient } from '../../../../lib/supabase/client';
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
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { Patient, Counselor, type CounselorAvailabilityStatus } from '../../../../lib/types';

const firstDefined = <T,>(...values: Array<T | null | undefined>): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(false);
  const realtimeRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseUrlRef = useRef<string | undefined>(undefined);
  if (supabaseUrlRef.current === undefined) {
    const fromEnv =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);
    supabaseUrlRef.current = fromEnv ? fromEnv.replace(/\/+$/, '') : undefined;
  }

  const toAbsoluteAvatarSrc = useCallback((value: string | undefined): string | undefined => {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    const supabaseUrl = supabaseUrlRef.current;
    if (!supabaseUrl) {
      return trimmed;
    }

    const normalizedPath = trimmed.replace(/^\/+/, '');
    if (normalizedPath.startsWith('storage/v1/object/public/')) {
      return `${supabaseUrl}/${normalizedPath}`;
    }

    return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
  }, []);

  const resolveAvatarUrl = useCallback(
    (user?: AdminUser | null) => {
      if (!user) {
        return undefined;
      }

      let candidate = user.avatarUrl;

      const metadataAvatarUrl =
        user.metadata && typeof user.metadata['avatar_url'] === 'string'
          ? (user.metadata['avatar_url'] as string)
          : user.metadata && typeof user.metadata['avatarUrl'] === 'string'
            ? (user.metadata['avatarUrl'] as string)
            : undefined;

      const metadataAvatar =
        user.metadata && typeof user.metadata['avatar'] === 'string'
          ? (user.metadata['avatar'] as string)
          : undefined;

      const metadataProfileAvatar =
        user.metadata && typeof user.metadata['profile'] === 'object' && user.metadata['profile'] !== null
          ? (() => {
              const profileRecord = user.metadata!['profile'] as Record<string, unknown>;
              if (typeof profileRecord['avatarUrl'] === 'string') {
                return profileRecord['avatarUrl'] as string;
              }
              if (typeof profileRecord['avatar_url'] === 'string') {
                return profileRecord['avatar_url'] as string;
              }
              return undefined;
            })()
          : undefined;

      if (!candidate) {
        candidate = metadataAvatarUrl || metadataAvatar || metadataProfileAvatar || undefined;
      }

      return toAbsoluteAvatarSrc(candidate);
    },
    [toAbsoluteAvatarSrc],
  );

  const coerceStringValue = useCallback((value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return undefined;
  }, []);

  const coerceStringArrayValue = useCallback(
    (value: unknown): string[] | undefined => {
      if (!value) {
        return undefined;
      }
      if (Array.isArray(value)) {
        const normalized = value
          .map((item) => {
            if (typeof item === 'string') {
              return item.trim();
            }
            if (item && typeof item === 'object') {
              const record = item as Record<string, unknown>;
              return coerceStringValue(
                record.label ?? record.name ?? record.value ?? record.title ?? record.text,
              );
            }
            return undefined;
          })
          .filter((item): item is string => Boolean(item));
        if (normalized.length === 0) {
          return undefined;
        }
        const seen = new Set<string>();
        const result: string[] = [];
        normalized.forEach((entry) => {
          const trimmed = entry.trim();
          if (trimmed.length > 0 && !seen.has(trimmed)) {
            seen.add(trimmed);
            result.push(trimmed);
          }
        });
        return result.length > 0 ? result : undefined;
      }
      const single = coerceStringValue(value);
      return single ? [single] : undefined;
    },
    [coerceStringValue],
  );

  const coerceBooleanValue = useCallback((value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
        return false;
      }
      return undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value === 1) {
        return true;
      }
      if (value === 0) {
        return false;
      }
      return undefined;
    }
    return undefined;
  }, []);

  const getRecordString = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): string | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceStringValue(record[key]);
        if (value) {
          return value;
        }
      }
      return undefined;
    },
    [coerceStringValue],
  );

  const getRecordStringArray = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): string[] | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceStringArrayValue(record[key]);
        if (value && value.length > 0) {
          return value;
        }
      }
      return undefined;
    },
    [coerceStringArrayValue],
  );

  const getRecordBoolean = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): boolean | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceBooleanValue(record[key]);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    },
    [coerceBooleanValue],
  );

  const getMetadataString = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): string | undefined => {
      return getRecordString(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordString],
  );

  const getMetadataStringArray = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): string[] | undefined => {
      return getRecordStringArray(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordStringArray],
  );

  const getMetadataBoolean = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): boolean | undefined => {
      return getRecordBoolean(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordBoolean],
  );

  const mergeStringArrays = useCallback(
    (...values: Array<unknown>): string[] => {
      const seen = new Set<string>();
      const result: string[] = [];
      values.forEach((value) => {
        const arr = coerceStringArrayValue(value);
        if (arr) {
          arr.forEach((entry) => {
            const trimmed = entry.trim();
            if (trimmed.length > 0 && !seen.has(trimmed)) {
              seen.add(trimmed);
              result.push(trimmed);
            }
          });
        }
      });
      return result;
    },
    [coerceStringArrayValue],
  );

  const renderBadgeList = useCallback(
    (values?: string[] | null) => {
      const normalized = coerceStringArrayValue(values);
      if (!normalized || normalized.length === 0) {
        return <p className="text-xs text-muted-foreground">Not provided</p>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {normalized.map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {value}
            </Badge>
          ))}
        </div>
      );
    },
    [coerceStringArrayValue],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboardData = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? false;

      if (showLoading && isMountedRef.current) {
        setLoading(true);
        setSummaryLoading(true);
      }

      try {
        const [summaryResponse, response] = await Promise.all([
          AdminApi.getUserSummary(),
          AdminApi.listUsers(),
        ]);

        if (!isMountedRef.current) {
          return;
        }

        const derived = response.users.reduce(
          (acc, user) => {
            acc.total += 1;
            if (user.role === 'patient') {
              acc.patients += 1;
            } else if (user.role === 'counselor') {
              acc.counselors += 1;
            } else if (user.role === 'admin') {
              acc.admins += 1;
            }
            if (user.isVerified) {
              acc.verified += 1;
            }
            return acc;
          },
          { total: 0, patients: 0, counselors: 0, admins: 0, verified: 0 },
        );
        const derivedUnverified = Math.max(0, derived.total - derived.verified);

        const mergedSummary: UserSummary = {
          totals: {
            total: Math.max(summaryResponse?.totals.total ?? 0, derived.total),
            patients: Math.max(summaryResponse?.totals.patients ?? 0, derived.patients),
            counselors: Math.max(summaryResponse?.totals.counselors ?? 0, derived.counselors),
            admins: Math.max(summaryResponse?.totals.admins ?? 0, derived.admins),
            newThisMonth: summaryResponse?.totals.newThisMonth ?? 0,
            activeLast30Days: summaryResponse?.totals.activeLast30Days ?? 0,
          },
          verification: {
            verified: Math.max(summaryResponse?.verification.verified ?? 0, derived.verified),
            unverified: Math.max(summaryResponse?.verification.unverified ?? 0, derivedUnverified),
          },
        };

        setSummary(mergedSummary);
        setUsers(response.users);
      } catch (error) {
        if (isMountedRef.current) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        }
      } finally {
        if (showLoading && isMountedRef.current) {
        setLoading(false);
        setSummaryLoading(false);
      }
      }
    },
    [],
  );

  // Load all users
  useEffect(() => {
    void loadDashboardData({ showLoading: true });
  }, [loadDashboardData]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client was not created; real-time updates disabled.');
      return;
    }

    const scheduleRefresh = () => {
      if (realtimeRefreshTimeoutRef.current) {
        clearTimeout(realtimeRefreshTimeoutRef.current);
      }
      realtimeRefreshTimeoutRef.current = setTimeout(() => {
        realtimeRefreshTimeoutRef.current = null;
        void loadDashboardData();
      }, 250);
    };

    const channel = supabase
      .channel('admin-users-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'counselor_profiles' },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_metrics_overview' },
        scheduleRefresh,
      );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        scheduleRefresh();
      }
    });

    return () => {
      if (realtimeRefreshTimeoutRef.current) {
        clearTimeout(realtimeRefreshTimeoutRef.current);
        realtimeRefreshTimeoutRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

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
    const baseUser = users.find((user) => user.id === userId);
    if (!baseUser) {
      toast.error('Unable to locate user details.');
      return;
    }
    // Fetch full user data with all metadata
    try {
      const fullUser = await AdminApi.getUser(userId);
      setSelectedUser(fullUser);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to cached user data
      setSelectedUser(baseUser);
      setIsProfileModalOpen(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this account? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await AdminApi.deleteUser(userId);
      setUsers((previous) => previous.filter((user) => user.id !== userId));
      void loadDashboardData();
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
              filteredUsers.map((user) => {
                let avatarSrc = resolveAvatarUrl(user);
                const displayName = user.fullName || user.email || 'User';
                const initials = displayName
                  .split(' ')
                  .map((segment) => segment.trim().charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                <TableRow key={`${user.id}-${user.role}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {avatarSrc ? (
                          <AvatarImage src={avatarSrc} alt={displayName} />
                        ) : null}
                        <AvatarFallback>
                          {initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName}</p>
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
                      >
                        <Eye className="h-4 w-4" />
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
              );
            })
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
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-hidden px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Review account metadata and recent activity.</DialogDescription>
          </DialogHeader>
        <div className="mt-4">
          {selectedUser ? (
            (() => {
              const viewAvatarSrc = resolveAvatarUrl(selectedUser);
              const counselorProfile = selectedUser.counselorProfile;
              const counselorMetadata = counselorProfile?.metadata as Record<string, unknown> | undefined;
              const metadataItems = [
                ...Object.entries(selectedUser.metadata ?? {}).map(([key, rawValue]) => ({
                  key,
                  value: formatMetadataValue(rawValue),
                })),
                ...(counselorMetadata
                  ? Object.entries(counselorMetadata).map(([key, rawValue]) => ({
                      key: `counselor.${key}`,
                      value: formatMetadataValue(rawValue),
                    }))
                  : []),
              ].filter((entry) => entry.value.length > 0);
              const documents = selectedUser.documents ?? [];
              const phoneValue = firstDefined(
                coerceStringValue(selectedUser.phoneNumber),
                getRecordString(counselorMetadata, 'contactPhone', 'phoneNumber', 'phone'),
                getMetadataString(selectedUser, 'phoneNumber', 'phone_number', 'contactPhone', 'contact_phone', 'phone'),
              );
              const practiceValue = firstDefined(
                coerceStringValue(selectedUser.practiceName),
                coerceStringValue(counselorProfile?.practiceName),
                getRecordString(counselorMetadata, 'practiceName', 'practice_name'),
                getMetadataString(selectedUser, 'practiceName', 'practice_name'),
              );
              const locationValue = firstDefined(
                coerceStringValue(selectedUser.location),
                coerceStringValue(selectedUser.practiceLocation),
                coerceStringValue(counselorProfile?.practiceLocation),
                getRecordString(counselorMetadata, 'practiceLocation', 'location', 'city', 'region', 'country'),
                getMetadataString(selectedUser, 'location', 'practiceLocation', 'practice_location', 'city', 'region', 'country'),
              );
              const locationLabel = coerceStringValue(locationValue ?? practiceValue) ?? 'Not provided';
              const availabilityValue = firstDefined(
                coerceStringValue(selectedUser.availabilityStatus),
                coerceStringValue(selectedUser.availability),
                coerceStringValue(counselorProfile?.availabilityStatus),
                getRecordString(counselorMetadata, 'availabilityStatus', 'availability'),
                getMetadataString(selectedUser, 'availabilityStatus', 'availability_status', 'availability'),
              );
              const acceptingNewPatientsValue = firstDefined(
                coerceBooleanValue(selectedUser.acceptingNewPatients),
                coerceBooleanValue(counselorProfile?.acceptingNewPatients),
                getRecordBoolean(counselorMetadata, 'acceptingNewPatients', 'accepting_new_patients'),
                getMetadataBoolean(selectedUser, 'acceptingNewPatients', 'accepting_new_patients'),
              );
              const telehealthValue = firstDefined(
                coerceBooleanValue(selectedUser.telehealthOffered),
                coerceBooleanValue(counselorProfile?.telehealthOffered),
                getRecordBoolean(counselorMetadata, 'telehealthOffered', 'telehealth'),
                getMetadataBoolean(selectedUser, 'telehealthOffered', 'telehealth_offered', 'telehealth'),
              );
              const languages = mergeStringArrays(
                selectedUser.languages,
                counselorProfile?.languages,
                getRecordStringArray(counselorMetadata, 'languages', 'languagePreferences', 'language_preferences'),
                getMetadataStringArray(selectedUser, 'languages', 'languagePreferences', 'language_preferences'),
                getMetadataString(selectedUser, 'preferredLanguage', 'language', 'preferred_language'),
              );
              const serviceRegions = mergeStringArrays(
                selectedUser.serviceRegions,
                counselorProfile?.serviceRegions,
                getRecordStringArray(counselorMetadata, 'serviceRegions', 'service_regions'),
                getMetadataStringArray(selectedUser, 'serviceRegions', 'service_regions'),
              );
              const supportedTimezones = mergeStringArrays(
                selectedUser.supportedTimezones,
                counselorProfile?.supportedTimezones,
                getRecordStringArray(counselorMetadata, 'supportedTimezones', 'supported_timezones'),
                getMetadataStringArray(selectedUser, 'supportedTimezones', 'supported_timezones'),
                getMetadataString(selectedUser, 'timezone'),
              );
              const sessionModalities = mergeStringArrays(
                selectedUser.sessionModalities,
                counselorProfile?.sessionModalities,
                getRecordStringArray(counselorMetadata, 'sessionModalities', 'session_modalities'),
                getMetadataStringArray(selectedUser, 'sessionModalities', 'session_modalities'),
              );
              const specializations = mergeStringArrays(
                selectedUser.specializations,
                counselorProfile?.specializations,
                getRecordStringArray(counselorMetadata, 'specializations'),
                getMetadataStringArray(selectedUser, 'specializations'),
              );
              const consultationTypes = mergeStringArrays(
                selectedUser.consultationTypes,
                getRecordStringArray(counselorMetadata, 'consultationTypes', 'consultation_types'),
                getMetadataStringArray(selectedUser, 'consultationTypes', 'consultation_types'),
              );
              const professionalHighlights = mergeStringArrays(
                selectedUser.professionalHighlights,
                counselorProfile?.professionalHighlights,
                getRecordStringArray(counselorMetadata, 'professionalHighlights', 'professional_highlights'),
                getMetadataStringArray(selectedUser, 'professionalHighlights', 'professional_highlights'),
              );
              const bioValue = firstDefined(
                coerceStringValue(selectedUser.bio),
                getRecordString(counselorMetadata, 'bio'),
                getMetadataString(selectedUser, 'bio'),
              );
              const approachValue = firstDefined(
                coerceStringValue(selectedUser.approachSummary),
                getRecordString(counselorMetadata, 'approachSummary', 'approach_summary'),
                getMetadataString(selectedUser, 'approachSummary', 'approach_summary'),
              );
              const specialtyValue = firstDefined(
                coerceStringValue(selectedUser.specialty),
                getRecordString(counselorMetadata, 'specialty'),
                getMetadataString(selectedUser, 'specialty'),
              );
              const preferredLanguageValue = firstDefined(
                coerceStringValue(selectedUser.preferredLanguage),
                getMetadataString(selectedUser, 'preferredLanguage', 'preferred_language', 'language'),
              );
              const ageValue = selectedUser.age;
              const genderValue = firstDefined(
                coerceStringValue(selectedUser.gender),
                getMetadataString(selectedUser, 'gender'),
              );
              const cancerTypeValue = firstDefined(
                coerceStringValue(selectedUser.cancerType),
                getMetadataString(selectedUser, 'cancerType'),
              );
              const diagnosisDateValue = firstDefined(
                coerceStringValue(selectedUser.diagnosisDate),
                getMetadataString(selectedUser, 'diagnosisDate'),
              );
              const currentTreatmentValue = firstDefined(
                coerceStringValue(selectedUser.currentTreatment),
                getMetadataString(selectedUser, 'currentTreatment'),
              );
              const treatmentStageValue = firstDefined(
                coerceStringValue(selectedUser.treatmentStage),
                getMetadataString(selectedUser, 'treatmentStage', 'treatment_stage'),
              );
              const supportNeedsValue = firstDefined(
                coerceStringValue(selectedUser.supportNeeds),
                getMetadataString(selectedUser, 'supportNeeds'),
              );
              const familySupportValue = firstDefined(
                coerceStringValue(selectedUser.familySupport),
                getMetadataString(selectedUser, 'familySupport'),
              );
              const consultationTypeValue = firstDefined(
                coerceStringValue(selectedUser.consultationType),
                getMetadataString(selectedUser, 'consultationType'),
              );
              const specialRequestsValue = firstDefined(
                coerceStringValue(selectedUser.specialRequests),
                getMetadataString(selectedUser, 'specialRequests'),
              );
              const isCounselor = selectedUser.role === 'counselor';
              const isPatient = selectedUser.role === 'patient';
              const phoneLabel = phoneValue ?? 'Not provided';
              const practiceLabel = practiceValue ?? (isCounselor ? 'Not provided' : 'Not applicable');
              const availabilityLabel = availabilityValue ?? (isCounselor ? 'Unknown' : 'Not applicable');
              const acceptingNewPatientsLabel =
                acceptingNewPatientsValue === undefined
                  ? isCounselor
                    ? 'Unknown'
                    : 'Not applicable'
                  : acceptingNewPatientsValue
                    ? 'Yes'
                    : 'No';
              const telehealthLabel =
                telehealthValue === undefined
                  ? isCounselor
                    ? 'Unknown'
                    : 'Not applicable'
                  : telehealthValue
                    ? 'Yes'
                    : 'No';
              const languagesNode = renderBadgeList(languages.length > 0 ? languages : undefined);
              const serviceRegionsNode = isCounselor
                ? renderBadgeList(serviceRegions.length > 0 ? serviceRegions : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const supportedTimezonesNode = isCounselor
                ? renderBadgeList(supportedTimezones.length > 0 ? supportedTimezones : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const sessionModalitiesNode = isCounselor
                ? renderBadgeList(sessionModalities.length > 0 ? sessionModalities : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const hasProfessionalDetails = Boolean(
                specializations.length > 0 ||
                  consultationTypes.length > 0 ||
                  professionalHighlights.length > 0 ||
                  specialtyValue ||
                  approachValue ||
                  bioValue,
              );
              const formatDateLabel = (value?: string) => {
                if (!value) {
                  return 'Not provided';
                }
                const parsed = new Date(value);
                if (Number.isNaN(parsed.getTime())) {
                  return value;
                }
                return parsed.toLocaleDateString(undefined, { dateStyle: 'medium' });
              };
              const preferredLanguageLabel = preferredLanguageValue ?? (languages.length > 0 ? languages[0] : undefined);
              const genderLabel = genderValue ?? 'Not provided';
              const cancerTypeLabel = cancerTypeValue ?? 'Not provided';
              const currentTreatmentLabel = currentTreatmentValue ?? 'Not provided';
              const treatmentStageLabel = treatmentStageValue ?? 'Not provided';
              const supportNeedsLabel = supportNeedsValue ?? 'Not provided';
              const familySupportLabel = familySupportValue ?? 'Not provided';
              const consultationTypeLabel = consultationTypeValue ?? 'Not provided';
              const specialRequestsLabel = specialRequestsValue ?? 'Not provided';
              const diagnosisDateLabel = formatDateLabel(diagnosisDateValue);

               return (
                 <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1 sm:pr-3">
                   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                       <Avatar className="h-14 w-14">
                         {viewAvatarSrc ? <AvatarImage src={viewAvatarSrc} alt={selectedUser.fullName || selectedUser.email} /> : null}
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
                     <div className="flex flex-wrap gap-2">
                       <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                       <Badge className={getStatusColor(selectedUser)}>
                         {getStatusText(selectedUser)}
                       </Badge>
                       <Badge variant={selectedUser.isVerified ? 'secondary' : 'outline'}>
                         {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                       </Badge>
                     </div>
                   </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <InfoItem label="Created" value={new Date(selectedUser.createdAt).toLocaleString()} />
                <InfoItem
                  label="Last login"
                       value={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                     />
                     <InfoItem label="Phone" value={phoneLabel} />
                     <InfoItem label="Location" value={locationLabel} />
                     <InfoItem label="Practice" value={practiceLabel} />
                     <InfoItem label="Availability" value={availabilityLabel} />
                     <InfoItem label="Accepting new patients" value={acceptingNewPatientsLabel} />
                     <InfoItem label="Telehealth" value={telehealthLabel} />
                     {specialtyValue ? <InfoItem label="Specialty" value={specialtyValue} /> : null}
              </div>

                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Languages</h4>
                       {languagesNode}
            </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Service Regions</h4>
                       {serviceRegionsNode}
                     </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Supported Timezones</h4>
                       {supportedTimezonesNode}
                     </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Session Modalities</h4>
                       {sessionModalitiesNode}
                     </div>
                   </div>

                   {hasProfessionalDetails ? (
                     <div className="space-y-3">
                       <h4 className="text-sm font-semibold">Professional Summary</h4>
                       {bioValue ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Bio</p>
                           <p className="text-sm text-foreground whitespace-pre-line">{bioValue}</p>
                         </div>
                       ) : null}
                       {approachValue ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Approach</p>
                           <p className="text-sm text-foreground whitespace-pre-line">{approachValue}</p>
                         </div>
                       ) : null}
                       {specializations.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Specializations</p>
                           {renderBadgeList(specializations)}
                         </div>
                       ) : null}
                       {consultationTypes.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Consultation Types</p>
                           {renderBadgeList(consultationTypes)}
                         </div>
                       ) : null}
                       {professionalHighlights.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Professional Highlights</p>
                           {renderBadgeList(professionalHighlights)}
                         </div>
                       ) : null}
                     </div>
                   ) : null}

                  {isPatient ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Patient Summary</h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem label="Preferred Language" value={preferredLanguageLabel ?? 'Not provided'} />
                        <InfoItem label="Age" value={ageValue !== undefined ? String(ageValue) : 'Not provided'} />
                        <InfoItem label="Gender" value={genderLabel} />
                        <InfoItem label="Cancer Type" value={cancerTypeLabel} />
                        <InfoItem label="Diagnosis Date" value={diagnosisDateLabel} />
                        <InfoItem label="Current Treatment" value={currentTreatmentLabel} />
                        <InfoItem label="Treatment Stage" value={treatmentStageLabel} />
                        <InfoItem label="Consultation Preference" value={consultationTypeLabel} />
                        <InfoItem label="Support Needs" value={supportNeedsLabel} />
                        <InfoItem label="Family Support" value={familySupportLabel} />
                        <InfoItem label="Special Requests" value={specialRequestsLabel} />
                      </div>
                    </div>
                  ) : null}

                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Documents</h4>
                      <div className="space-y-2">
                        {documents.map((document) => {
                          const documentUrl =
                            toAbsoluteAvatarSrc(document.url ?? document.storagePath ?? '') ??
                            document.url ??
                            document.storagePath ??
                            undefined;
                          return (
                            <div key={`${document.type}-${document.url}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium capitalize">
                                  {document.label || document.type || 'Document'}
                                </p>
                                {document.storagePath ? (
                                  <p className="text-xs text-muted-foreground break-all">{document.storagePath}</p>
                                ) : null}
                              </div>
                              {documentUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {metadataItems.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Metadata</h4>
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
                        {metadataItems.map(({ key, value }) => (
                          <MetadataItem key={key} label={formatKeyLabel(key)} value={value} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No user selected.
            </div>
          )}
        </div>
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile View Modal for Patients and Counselors */}
      {selectedUser && (() => {
        // Debug: Log what we're passing
        if (process.env.NODE_ENV === 'development') {
          console.log('[AdminUsersPage] Selected user:', {
            id: selectedUser.id,
            role: selectedUser.role,
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            hasMetadata: !!selectedUser.metadata,
            metadataKeys: selectedUser.metadata ? Object.keys(selectedUser.metadata) : [],
            metadata: selectedUser.metadata,
          });
        }
        
        if (selectedUser.role === 'patient') {
          const patientUser = {
            id: selectedUser.id,
            name: selectedUser.fullName || selectedUser.email || 'Patient',
            email: selectedUser.email,
            role: 'patient' as const,
            avatar: selectedUser.avatarUrl,
            createdAt: new Date(selectedUser.createdAt),
            // Pass all metadata and fields from AdminUser
            metadata: selectedUser.metadata || {},
            // Health info
            diagnosis: (selectedUser as any).cancerType || (selectedUser.metadata?.diagnosis as string) || (selectedUser.metadata?.cancer_type as string),
            treatmentStage: (selectedUser as any).treatmentStage || (selectedUser.metadata?.treatment_stage as string) || (selectedUser.metadata?.treatmentStage as string),
            cancerType: (selectedUser as any).cancerType || (selectedUser.metadata?.cancer_type as string) || (selectedUser.metadata?.cancerType as string),
            currentTreatment: (selectedUser.metadata?.current_treatment as string) || (selectedUser.metadata?.currentTreatment as string),
            diagnosisDate: (selectedUser.metadata?.diagnosis_date as string) || (selectedUser.metadata?.diagnosisDate as string),
            // Personal info
            age: (selectedUser.metadata?.age as string) || ((selectedUser as any).age as string),
            gender: (selectedUser.metadata?.gender as string) || ((selectedUser as any).gender as string),
            location: (selectedUser.metadata?.location as string) || ((selectedUser as any).location as string),
            phoneNumber: (selectedUser.metadata?.contactPhone as string) || (selectedUser.metadata?.contact_phone as string) || (selectedUser.metadata?.phone as string) || (selectedUser.metadata?.phoneNumber as string),
            preferredLanguage: (selectedUser.metadata?.preferred_language as string) || (selectedUser.metadata?.preferredLanguage as string) || (selectedUser.metadata?.language as string),
            // Support info
            supportNeeds: (selectedUser.metadata?.support_needs as string[]) || (selectedUser.metadata?.supportNeeds as string[]),
            familySupport: (selectedUser.metadata?.family_support as string) || (selectedUser.metadata?.familySupport as string),
            consultationType: (selectedUser.metadata?.consultation_type as string[]) || (selectedUser.metadata?.consultationType as string[]),
            specialRequests: (selectedUser.metadata?.special_requests as string) || (selectedUser.metadata?.specialRequests as string),
            // Emergency contact
            emergencyContactName: (selectedUser.metadata?.emergency_contact_name as string) || (selectedUser.metadata?.emergencyContactName as string),
            emergencyContactPhone: (selectedUser.metadata?.emergency_contact_phone as string) || (selectedUser.metadata?.emergencyContactPhone as string),
            emergencyContact: (selectedUser.metadata?.emergency_contact as string) || (selectedUser.metadata?.emergencyContact as string),
            // Assignment
            assignedCounselor: (selectedUser.metadata?.assigned_counselor_id as string) || ((selectedUser as any).assigned_counselor_id as string) || undefined,
            // Progress
            moduleProgress: (selectedUser.metadata?.module_progress as Record<string, number>) || undefined,
          } as Patient;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[AdminUsersPage] Patient user object:', {
              id: patientUser.id,
              name: patientUser.name,
              email: patientUser.email,
              hasMetadata: !!patientUser.metadata,
              metadataKeys: patientUser.metadata ? Object.keys(patientUser.metadata) : [],
              cancerType: patientUser.cancerType,
              age: patientUser.age,
              gender: patientUser.gender,
              location: patientUser.location,
            });
          }
          
          return (
            <ProfileViewModal
              isOpen={isProfileModalOpen}
              onClose={() => {
                setIsProfileModalOpen(false);
                setSelectedUser(null);
              }}
              user={patientUser}
              userType="patient"
              currentUserRole="admin"
            />
          );
        }
        
        if (selectedUser.role === 'counselor') {
          const counselorUser = {
            id: selectedUser.id,
            name: selectedUser.fullName || selectedUser.email || 'Counselor',
            email: selectedUser.email,
            role: 'counselor' as const,
            avatar: selectedUser.avatarUrl,
            createdAt: new Date(selectedUser.createdAt),
            specialty: selectedUser.specialty || '',
            experience: selectedUser.experienceYears ?? selectedUser.experience ?? 0,
            availability: (selectedUser.availabilityStatus as 'available' | 'busy' | 'offline') || 
                         (selectedUser.availability as 'available' | 'busy' | 'offline') || 
                         'available',
            // Include all additional fields from AdminUser
            phoneNumber: selectedUser.phoneNumber,
            bio: selectedUser.bio,
            credentials: Array.isArray(selectedUser.credentials) 
              ? selectedUser.credentials.join(', ') 
              : selectedUser.credentials,
            languages: selectedUser.languages,
            timezone: selectedUser.supportedTimezones?.[0],
            location: selectedUser.practiceLocation || selectedUser.location,
            visibilitySettings: selectedUser.visibilitySettings,
            approvalStatus: selectedUser.approvalStatus,
            availabilityStatus: selectedUser.availabilityStatus as CounselorAvailabilityStatus | undefined,
            sessionModalities: selectedUser.sessionModalities,
            acceptingNewPatients: selectedUser.acceptingNewPatients,
            telehealthOffered: selectedUser.telehealthOffered,
            // Additional fields that might be in metadata or counselorProfile
            practiceName: selectedUser.practiceName,
            practiceLocation: selectedUser.practiceLocation,
            serviceRegions: selectedUser.serviceRegions,
            specializations: selectedUser.specializations,
            demographicsServed: selectedUser.demographicsServed,
            approachSummary: selectedUser.approachSummary,
            professionalHighlights: selectedUser.professionalHighlights,
            educationHistory: selectedUser.educationHistory,
            licenseNumber: selectedUser.licenseNumber,
            licenseJurisdiction: selectedUser.licenseJurisdiction,
            licenseExpiry: selectedUser.licenseExpiry,
            motivationStatement: selectedUser.motivationStatement,
            emergencyContactName: selectedUser.emergencyContactName,
            emergencyContactPhone: selectedUser.emergencyContactPhone,
            professionalReferences: selectedUser.professionalReferences,
            documents: selectedUser.documents,
            counselorProfile: selectedUser.counselorProfile,
            metadata: selectedUser.metadata || {},
          } as Counselor & {
            practiceName?: string;
            practiceLocation?: string;
            serviceRegions?: string[];
            specializations?: string[];
            demographicsServed?: string[];
            approachSummary?: string;
            professionalHighlights?: string[];
            educationHistory?: Array<{ degree?: string; institution?: string; graduationYear?: number }>;
            licenseNumber?: string;
            licenseJurisdiction?: string;
            licenseExpiry?: string;
            motivationStatement?: string;
            emergencyContactName?: string;
            emergencyContactPhone?: string;
            professionalReferences?: Array<{ name?: string; organization?: string; email?: string; phone?: string }>;
            documents?: Array<{ label: string; url: string; type?: string; storagePath?: string }>;
            counselorProfile?: any;
          };
          
          // Use comprehensive counselor detail dialog instead of ProfileViewModal
          const profile = selectedUser.counselorProfile;
          const languages = selectedUser.languages ?? profile?.languages ?? [];
          const specializations = selectedUser.specializations ?? profile?.specializations ?? [];
          const consultationTypes = selectedUser.consultationTypes ?? profile?.sessionModalities ?? [];
          const demographics = selectedUser.demographicsServed ?? profile?.demographicsServed ?? [];
          const professionalHighlights = selectedUser.professionalHighlights ?? profile?.professionalHighlights ?? [];
          const educationHistory = selectedUser.educationHistory ?? profile?.educationHistory ?? [];
          const documents = selectedUser.documents ?? [];
          const references = Array.isArray(selectedUser.professionalReferences)
            ? selectedUser.professionalReferences
            : profile?.professionalReferences ?? [];
          const applicationDate = selectedUser.approvalSubmittedAt ?? selectedUser.createdAt;
          
          return (
            <Dialog open={isProfileModalOpen} onOpenChange={() => {
                setIsProfileModalOpen(false);
                setSelectedUser(null);
            }}>
              <DialogContent className="max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Counselor Profile</span>
                      <h3 className="text-lg font-semibold">{selectedUser.fullName || selectedUser.email}</h3>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    <span>
                      {(selectedUser.specialty || specializations[0] || 'General Counseling')} • {(selectedUser.experienceYears ?? selectedUser.experience ?? 0)} years experience • {languages.length} languages
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Professional Information Header */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Information
                    </h3>
                  </div>

                  {/* Basic Information */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage
                            src={toAbsoluteAvatarSrc(selectedUser.avatarUrl)}
                            alt={selectedUser.fullName || selectedUser.email}
                          />
                          <AvatarFallback className="text-lg">
                            {(selectedUser.fullName || selectedUser.email || 'C')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-2">
                          <h4 className="text-lg font-semibold">
                            {selectedUser.fullName || selectedUser.email}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="break-all">{selectedUser.email}</span>
                            </div>
                            {selectedUser.phoneNumber && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{selectedUser.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(selectedUser.practiceLocation || selectedUser.location) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">
                              {selectedUser.practiceLocation || selectedUser.location}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {selectedUser.specialty || specializations[0] || 'General Counseling'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {selectedUser.experienceYears ?? selectedUser.experience ?? 0} years experience
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-3 text-sm">Languages</h5>
                        <div className="flex flex-wrap gap-2">
                          {languages.length > 0 ? (
                            languages.map((language, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {language}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not provided</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3 text-sm">Availability</h5>
                        {selectedUser.availabilityStatus ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {selectedUser.availabilityStatus}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not provided</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium mb-1 text-sm">Application Date</h5>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{new Date(applicationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Practice & Availability */}
                  <div className="space-y-4 border-t pt-6">
                    <h5 className="font-medium text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Practice & Availability
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Practice Name</p>
                        <p className="text-sm font-medium">{selectedUser.practiceName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Practice Location</p>
                        <p className="text-sm font-medium">{selectedUser.practiceLocation || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Accepting New Patients</p>
                        {selectedUser.acceptingNewPatients !== undefined ? (
                          <Badge variant="outline" className="text-xs">
                            {selectedUser.acceptingNewPatients ? 'Yes' : 'No'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not provided</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Telehealth Offered</p>
                        {selectedUser.telehealthOffered !== undefined ? (
                          <Badge variant="outline" className="text-xs">
                            {selectedUser.telehealthOffered ? 'Yes' : 'No'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional License Information */}
                  <div className="space-y-6 border-t pt-6">
                    <h5 className="font-medium flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      Professional License
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">License Number</p>
                        <p className="text-sm font-medium">{selectedUser.licenseNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">License Jurisdiction</p>
                        <p className="text-sm font-medium">{selectedUser.licenseJurisdiction || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">License Expiry</p>
                        <p className="text-sm font-medium">{selectedUser.licenseExpiry || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Education Information */}
                  <div className="space-y-6 border-t pt-6">
                    <h5 className="font-medium flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4" />
                      Education & Certifications
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Highest Degree</p>
                        <p className="text-sm font-medium">{selectedUser.highestDegree || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">University/Institution</p>
                        <p className="text-sm font-medium">{selectedUser.university || 'Not provided'}</p>
                      </div>
                    </div>
                    {educationHistory.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground mb-1">Education History</p>
                        <div className="space-y-2">
                          {educationHistory.map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-muted/40">
                              <p className="text-sm font-medium">
                                {item.degree || 'Degree not specified'}
                              </p>
                              {(item.institution || item.graduationYear) && (
                                <p className="text-xs text-muted-foreground">
                                  {[item.institution, item.graduationYear].filter(Boolean).join(' • ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6 border-t pt-6">
                    <div className="space-y-3">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4" />
                        Credentials
                      </h5>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed">
                          {Array.isArray(selectedUser.credentials)
                            ? selectedUser.credentials.join(', ')
                            : selectedUser.credentials || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        Professional Bio
                      </h5>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed">
                          {selectedUser.bio || profile?.bio || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {professionalHighlights.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4" />
                          Professional Highlights
                        </h5>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {professionalHighlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Motivation */}
                  {selectedUser.motivationStatement && (
                    <div className="space-y-3 border-t pt-6">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4" />
                        Motivation to Join RCR
                      </h5>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedUser.motivationStatement}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {references && references.length > 0 && (
                    <div className="space-y-3 border-t pt-6">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        Professional References
                      </h5>
                      <div className="space-y-3">
                        {references.map((reference, index) => {
                          const refRecord =
                            reference && typeof reference === 'object'
                              ? (reference as Record<string, unknown>)
                              : typeof reference === 'string'
                                ? ({ name: reference } as Record<string, unknown>)
                                : undefined;

                          const referenceName = (() => {
                            const recordName = refRecord?.name;
                            if (typeof recordName === 'string') {
                              const trimmed = recordName.trim();
                              if (trimmed.length > 0) {
                                return trimmed;
                              }
                            }
                            return 'Reference';
                          })();

                          const detailKeys: Array<'organization' | 'email' | 'phone'> = [
                            'organization',
                            'email',
                            'phone',
                          ];
                          const refDetails = detailKeys
                            .map((key) => {
                              const value = refRecord?.[key];
                              return typeof value === 'string' && value.trim().length > 0
                                ? value.trim()
                                : undefined;
                            })
                            .filter((value): value is string => Boolean(value));

                          return (
                            <div key={index} className="p-4 border rounded-lg bg-muted/40">
                              <p className="text-sm font-medium">{referenceName}</p>
                              {refDetails.length > 0 ? (
                                <p className="text-xs text-muted-foreground">{refDetails.join(' • ')}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {(selectedUser.emergencyContactName || selectedUser.emergencyContactPhone) && (
                    <div className="space-y-3 border-t pt-6">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        Emergency Contact
                      </h5>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-1">
                        {selectedUser.emergencyContactName && (
                          <p className="text-sm font-medium">{selectedUser.emergencyContactName}</p>
                        )}
                        {selectedUser.emergencyContactPhone && (
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Uploads */}
                  <div className="space-y-4 border-t pt-6">
                    <h5 className="font-medium flex items-center gap-2 text-sm">
                      <Download className="h-4 w-4" />
                      Uploaded Documents
                    </h5>
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {documents.map((doc, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-muted/30 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FileText className="h-4 w-4" />
                              {doc.label}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={toAbsoluteAvatarSrc(doc.url) ?? doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                View Document
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No documents uploaded</div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsProfileModalOpen(false);
                    setSelectedUser(null);
                  }}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        }
        
        return null;
      })()}
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

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const formatted = value
      .map((item) => formatMetadataValue(item))
      .filter((item) => item.length > 0)
      .join(', ');
    return formatted;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }
  return '';
}

function formatKeyLabel(rawKey: string): string {
  return rawKey
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
