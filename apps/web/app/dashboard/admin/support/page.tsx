'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog';
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
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Search, 
  Filter, 
  Eye, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Send,
  X,
  Edit,
  Tag
} from 'lucide-react';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import {
  SupportApi,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketWithProfile,
} from '../../../../lib/api/support';
import { toast } from 'sonner';

export default function AdminSupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithProfile | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [tickets, setTickets] = useState<SupportTicketWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedProfileMetadata = (selectedTicket?.profile?.metadata ??
    undefined) as Record<string, unknown> | undefined;
  const selectedProfileEmail =
    typeof selectedProfileMetadata?.email === 'string' ? selectedProfileMetadata.email : undefined;
  const selectedProfilePhone =
    typeof selectedProfileMetadata?.contactPhone === 'string'
      ? selectedProfileMetadata.contactPhone
      : undefined;

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await SupportApi.listAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
      toast.error('Failed to load support tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const channel = SupportApi.subscribeToTickets(() => {
      // Refresh list on every change to keep admin view in sync
      loadTickets();
    });
    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  }, [tickets, searchTerm, selectedStatus, selectedPriority]);

  const handleViewTicket = (ticket: SupportTicketWithProfile) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
    setReplyText('');
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleReplyTicket = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    try {
      const updated = await SupportApi.updateTicket(selectedTicket.id, {
        admin_notes: replyText.trim(),
      });
      const mergedProfile = selectedTicket.profile;
      setSelectedTicket({ ...updated, profile: mergedProfile });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updated.id ? { ...updated, profile: ticket.profile ?? mergedProfile } : ticket,
        ),
      );
      toast.success('Reply saved successfully.');
      setReplyText('');
    } catch (error) {
      console.error('Error replying to ticket:', error);
      toast.error('Failed to save reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateTicketStatus = async (newStatus: SupportTicketStatus) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await SupportApi.updateTicket(selectedTicket.id, {
        status: newStatus,
        resolved_at: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : null,
      });
      const mergedProfile = selectedTicket.profile;
      setSelectedTicket({ ...updated, profile: mergedProfile });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updated.id ? { ...updated, profile: ticket.profile ?? mergedProfile } : ticket,
        ),
      );
      toast.success('Ticket status updated successfully.');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateTicketPriority = async (newPriority: SupportTicketPriority) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await SupportApi.updateTicket(selectedTicket.id, {
        priority: newPriority,
      });
      const mergedProfile = selectedTicket.profile;
      setSelectedTicket({ ...updated, profile: mergedProfile });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updated.id ? { ...updated, profile: ticket.profile ?? mergedProfile } : ticket,
        ),
      );
      toast.success('Ticket priority updated successfully.');
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      toast.error('Failed to update priority. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: SupportTicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicketPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SupportTicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Support Management"
        description="Manage support tickets and provide assistance to users"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               {tickets.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.priority === 'urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search tickets by subject or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as any)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tickets Table */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Support Tickets List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Spinner variant="bars" size={28} className="text-primary mr-3" />
                    Loading tickets…
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const profile = ticket.profile;
                const metadata = (profile?.metadata ?? {}) as Record<string, unknown>;
                const fallbackInitials =
                  typeof profile?.full_name === 'string' && profile.full_name.trim().length > 0
                    ? profile.full_name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()
                    : 'U';
                const supportEmail =
                  (metadata.email as string | undefined) ??
                  (metadata.contactEmail as string | undefined) ??
                  undefined;
              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? undefined} />
                        <AvatarFallback>{fallbackInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile?.full_name || 'Unknown User'}</p>
                        {supportEmail && (
                          <p className="text-xs text-muted-foreground">{supportEmail}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(ticket.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(ticket.updated_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3" />
                    <p>No support tickets found for the current filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
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

      {/* Ticket Detail Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={handleCloseTicketModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-muted-foreground">Ticket #{selectedTicket?.id}</span>
                <h3 className="text-lg font-semibold">{selectedTicket?.subject}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedTicket && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status === 'in_progress'
                      ? 'In Progress'
                      : selectedTicket.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)} Priority
                  </Badge>
                  <Badge variant="outline">
                    {selectedTicket.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 mt-4">
              {/* Ticket Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTicket.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {selectedTicket.profile?.full_name
                          ? selectedTicket.profile.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.profile?.full_name || 'Unknown User'}</p>
                      {selectedProfileEmail && (
                        <p className="text-sm text-muted-foreground">{selectedProfileEmail}</p>
                      )}
                      {selectedProfilePhone && (
                        <p className="text-xs text-muted-foreground">{selectedProfilePhone}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Date Information</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Created: {new Date(selectedTicket.created_at).toLocaleDateString()} at{' '}
                        {new Date(selectedTicket.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Updated: {new Date(selectedTicket.updated_at).toLocaleDateString()} at{' '}
                        {new Date(selectedTicket.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {selectedTicket.resolved_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Resolved: {new Date(selectedTicket.resolved_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Status and Priority Controls */}
              <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(value) => handleUpdateTicketStatus(value as SupportTicketStatus)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={selectedTicket.priority} 
                    onValueChange={(value) => handleUpdateTicketPriority(value as SupportTicketPriority)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
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

              {/* Reply Section */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="reply">Reply to Ticket</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add internal notes or a response to share with the patient..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Saved replies are visible to the patient in real time.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseTicketModal}>
              Close
            </Button>
            <Button
              onClick={handleReplyTicket}
              disabled={!replyText.trim() || isReplying}
              className="bg-primary hover:bg-primary/90"
            >
              {isReplying ? (
                <>
                  <Spinner variant="bars" size={16} className="text-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
