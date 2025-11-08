import React from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Mic,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@/lib/api/sessions';

interface SessionCardProps {
  session: Session;
  patientName?: string;
  counselorName?: string;
  patientAvatar?: string;
  counselorAvatar?: string;
  onJoin?: (session: Session) => void;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
  showActions?: boolean;
}

export function SessionCard({
  session,
  patientName,
  counselorName,
  patientAvatar,
  counselorAvatar,
  onJoin,
  onReschedule,
  onCancel,
  showActions = true
}: SessionCardProps) {
  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rescheduled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Parse date - handle both string and Date objects
  const sessionDate = typeof session.date === 'string' ? new Date(session.date) : session.date;
  const sessionTime = session.time || '';
  
  // Format date and time for display
  const displayDate = format(sessionDate, 'MMM dd, yyyy');
  const displayTime = sessionTime || format(sessionDate, 'h:mm a');

  const isUpcoming = session.status === 'scheduled' && 
    sessionDate > new Date();

  return (
    <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(session.status)}
            <Badge className={getStatusColor(session.status)}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {session.type === 'audio' ? (
              <><Mic className="h-3 w-3" /> Audio Only</>
            ) : (
              <><Video className="h-3 w-3" /> Video</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={patientAvatar} alt={patientName} />
              <AvatarFallback>
                {patientName?.split(' ').map(n => n[0]).join('') || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{patientName || 'Patient'}</p>
              <p className="text-xs text-muted-foreground">Patient</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={counselorAvatar} alt={counselorName} />
              <AvatarFallback>
                {counselorName?.split(' ').map(n => n[0]).join('') || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{counselorName || 'Counselor'}</p>
              <p className="text-xs text-muted-foreground">Counselor</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{displayTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{session.duration} minutes</span>
          </div>
        </div>

        {session.notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {session.notes}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 pt-2">
            {session.status === 'scheduled' && onJoin && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onJoin(session)}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Session
              </Button>
            )}
            {session.status === 'scheduled' && onReschedule && (
              <Button 
                size="sm" 
                variant="outline"
                className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary"
                onClick={() => onReschedule(session)}
              >
                Reschedule
              </Button>
            )}
            {session.status === 'scheduled' && onCancel && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onCancel(session)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
