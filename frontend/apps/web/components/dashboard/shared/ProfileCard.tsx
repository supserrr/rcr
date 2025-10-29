import React from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { MapPin, Clock, MessageCircle } from 'lucide-react';

interface ProfileCardProps {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  specialty?: string;
  location?: string;
  availability?: 'available' | 'busy' | 'offline';
  bio?: string;
  languages?: string[];
  experience?: number;
  onBookSession?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onSendMessage?: (id: string) => void;
  showActions?: boolean;
}

export function ProfileCard({
  id,
  name,
  title,
  avatar,
  specialty,
  location,
  availability,
  bio,
  languages,
  experience,
  onBookSession,
  onViewProfile,
  onSendMessage,
  showActions = true
}: ProfileCardProps) {
  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/15 rounded-3xl border-primary/20 dark:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/20 group">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getAvailabilityColor(availability)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              {title && <p className="text-sm text-muted-foreground">{title}</p>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3">
        {specialty && (
          <div>
            <Badge variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          </div>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          
          {availability && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{getAvailabilityText(availability)}</span>
            </div>
          )}
          
          {experience && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{experience} years experience</span>
            </div>
          )}
        </div>

        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {bio}
          </p>
        )}

        {languages && languages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Languages:</p>
            <div className="flex flex-wrap gap-1">
              {languages.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 pt-2">
            {onBookSession && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onBookSession(id)}
                disabled={availability === 'offline'}
              >
                Book Session
              </Button>
            )}
            {onViewProfile && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewProfile(id)}
              >
                View Profile
              </Button>
            )}
            {onSendMessage && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onSendMessage(id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
