'use client';

import React, { useState } from 'react';
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
import { dummySupportTickets, dummyUsers } from '../../../../lib/dummy-data';
import { SupportTicket } from '../../../../lib/types';

export default function AdminSupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredTickets = dummySupportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getUserInfo = (userId: string) => {
    return dummyUsers.find(user => user.id === userId);
  };

  const handleViewTicket = (ticket: SupportTicket) => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Replying to ticket:', selectedTicket.id, replyText);
      
      // In a real app, this would update the ticket with the reply
      alert('Reply sent successfully!');
      setReplyText('');
    } catch (error) {
      console.error('Error replying to ticket:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateTicketStatus = async (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Updating ticket status:', selectedTicket.id, newStatus);
      
      // In a real app, this would update the ticket status
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateTicketPriority = async (newPriority: SupportTicket['priority']) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Updating ticket priority:', selectedTicket.id, newPriority);
      
      // In a real app, this would update the ticket priority
      setSelectedTicket({ ...selectedTicket, priority: newPriority });
      alert('Ticket priority updated successfully!');
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      alert('Failed to update priority. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
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
              {dummySupportTickets.filter(t => t.status === 'open').length}
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
               {dummySupportTickets.filter(t => t.status === 'in_progress').length}
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
              {dummySupportTickets.filter(t => t.status === 'resolved').length}
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
              {dummySupportTickets.filter(t => t.priority === 'urgent').length}
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
            {filteredTickets.map((ticket) => {
              const user = getUserInfo(ticket.userId);
              
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
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>
                          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
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
                      <p className="text-sm">{ticket.createdAt.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{ticket.updatedAt.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.updatedAt.toLocaleTimeString()}
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
            })}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {dummySupportTickets.length} tickets
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
                    {selectedTicket.status === 'in_progress' ? 'In Progress' : selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                  </Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)} Priority
                  </Badge>
                  <Badge variant="outline">{selectedTicket.category}</Badge>
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
                      <AvatarImage src={getUserInfo(selectedTicket.userId)?.avatar} />
                      <AvatarFallback>
                        {getUserInfo(selectedTicket.userId)?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserInfo(selectedTicket.userId)?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{getUserInfo(selectedTicket.userId)?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Date Information</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created: {selectedTicket.createdAt.toLocaleDateString()} at {selectedTicket.createdAt.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Updated: {selectedTicket.updatedAt.toLocaleDateString()} at {selectedTicket.updatedAt.toLocaleTimeString()}</span>
                    </div>
                    {selectedTicket.resolvedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Resolved: {selectedTicket.resolvedAt.toLocaleDateString()}</span>
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
                    onValueChange={(value) => handleUpdateTicketStatus(value as SupportTicket['status'])}
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
                    onValueChange={(value) => handleUpdateTicketPriority(value as SupportTicket['priority'])}
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
                  placeholder="Type your reply here..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your reply will be sent to the user via email.
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
