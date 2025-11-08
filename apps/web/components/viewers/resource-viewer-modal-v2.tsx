'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Download, Share2, Bookmark, ExternalLink, Play } from 'lucide-react';
import { VideoPlayer } from '../ui/video-player';
import { Resource } from '../../lib/types';

type ResourceLike = {
  id: string;
  title: string;
  description?: string;
  type: 'audio' | 'pdf' | 'video' | 'article';
  url?: string;
  thumbnail?: string;
  tags?: string[];
  createdAt?: Date;
  publisher?: string;
  isYouTube?: boolean;
  youtubeUrl?: string;
  content?: string;
  isPublic?: boolean;
};

interface ResourceViewerModalV2Props {
  resource: ResourceLike | Resource;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (resource: ResourceLike | Resource) => void;
  onShare?: (resource: ResourceLike | Resource) => void;
  onBookmark?: (resource: ResourceLike | Resource) => void;
  onViewArticle?: (resource: ResourceLike | Resource) => void;
}

export function ResourceViewerModalV2({ resource, isOpen, onClose, onDownload, onShare, onBookmark, onViewArticle }: ResourceViewerModalV2Props) {
  const isYouTube = !!resource.isYouTube || (!!resource.youtubeUrl && resource.youtubeUrl!.length > 0);
  const isVideo = resource.type === 'video' && (isYouTube || (!!resource.url && resource.url.toLowerCase().endsWith('.mp4')));
  const isPdf = resource.type === 'pdf' && !!resource.url;
  const isAudio = resource.type === 'audio' && !!resource.url;
  const isArticle = resource.type === 'article';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent wide className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
          <DialogDescription>
            <span className="mt-2 inline-flex flex-wrap items-center gap-2">
              {resource.tags?.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
              {resource.publisher && (
                <span className="text-sm text-muted-foreground">• {resource.publisher}</span>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isVideo && (
            <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black">
              {isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${(resource.youtubeUrl || resource.url || '').split('v=')[1] || ''}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={resource.title}
                />
              ) : (
                <VideoPlayer src={resource.url || ''} size="full" autoHide className="w-full" />
              )}
            </div>
          )}

          {isPdf && (
            <div className="w-full h-[85vh] rounded-lg overflow-hidden border bg-background">
              <iframe src={resource.url} className="w-full h-full" title={resource.title} />
            </div>
          )}

          {isAudio && (
            <div className="p-4 rounded-lg border bg-card">
              <audio src={resource.url} controls className="w-full" />
            </div>
          )}

          {isArticle && (
            <div className="p-4 rounded-lg border bg-card">
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: resource.content || resource.description || '' }} />
              {!resource.content && onViewArticle && (
                <Button className="mt-3" onClick={() => onViewArticle(resource)}>
                  <Play className="h-4 w-4 mr-2" />
                  Read Article
                </Button>
              )}
            </div>
          )}

          {!isVideo && !isPdf && !isAudio && !isArticle && (
            <div className="p-4 rounded-lg border bg-card text-sm text-muted-foreground">
              Unsupported resource type.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onShare && (
            <Button variant="outline" onClick={() => onShare(resource)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {onBookmark && (
            <Button variant="outline" onClick={() => onBookmark(resource)}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
          )}
          {onDownload && (
            <Button onClick={() => onDownload(resource)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


