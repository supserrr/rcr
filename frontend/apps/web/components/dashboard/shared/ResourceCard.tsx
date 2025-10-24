import React from 'react';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Play, 
  FileText, 
  Video, 
  BookOpen, 
  Clock, 
  Download,
  Eye
} from 'lucide-react';
import { Resource } from '../../../lib/types';

interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
  showActions?: boolean;
  delay?: number;
}

export function ResourceCard({ 
  resource, 
  onView, 
  onDownload, 
  showActions = true,
  delay = 0
}: ResourceCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Play className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'article':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatedCard delay={delay} className="h-full">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-0"></div>
      
      <div className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
              {getTypeIcon(resource.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">
                {resource.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {resource.type.toUpperCase()}
                </Badge>
                {resource.duration && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(resource.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description}
        </p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{resource.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 pt-2">
            {onView && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onView(resource)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {onDownload && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDownload(resource)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
