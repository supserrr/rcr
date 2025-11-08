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
  Eye,
  Edit,
  Trash2,
  StarOff,
  Globe,
  Lock
} from 'lucide-react';
import { Resource } from '../../../lib/types';

interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onUnsave?: (resource: Resource) => void;
  onPublish?: (resource: Resource) => void;
  onUnpublish?: (resource: Resource) => void;
  showActions?: boolean;
  showEditActions?: boolean;
  delay?: number;
}

export function ResourceCard({ 
  resource, 
  onView, 
  onDownload, 
  onEdit, 
  onDelete, 
  onUnsave,
  onPublish,
  onUnpublish,
  showActions = true, 
  showEditActions = false,
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
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'pdf':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'video':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'article':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 dark:bg-primary/15 rounded-full blur-2xl -z-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 group-hover:w-40 group-hover:h-40 transition-all duration-300"></div>
      
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

        {showEditActions ? (
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
            {onEdit && (
              <Button 
                size="sm" 
                variant="outline"
                className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary"
                onClick={() => onEdit(resource)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onUnsave && (
              <Button 
                size="sm" 
                variant="outline"
                className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary"
                onClick={() => onUnsave(resource)}
              >
                <StarOff className="h-4 w-4" />
              </Button>
            )}
            {resource.isPublic && onUnpublish && (
              <Button 
                size="sm" 
                variant="outline"
                className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 hover:border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                onClick={() => onUnpublish(resource)}
                title="Unpublish resource"
              >
                <Lock className="h-4 w-4" />
              </Button>
            )}
            {!resource.isPublic && onPublish && (
              <Button 
                size="sm" 
                variant="outline"
                className="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                onClick={() => onPublish(resource)}
                title="Publish resource"
              >
                <Globe className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDelete(resource)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : showActions && (
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
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
