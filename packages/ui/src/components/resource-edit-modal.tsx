'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Badge } from './badge';
import { Switch } from './switch';
import { 
  X, 
  Upload, 
  FileText, 
  Video, 
  BookOpen,
  Play,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Resource } from '../lib/types';

interface ResourceEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedResource: Resource) => void;
  onDelete: (resourceId: string) => void;
  onCreateArticle?: () => void; // Added for article creation
}

export function ResourceEditModal({ 
  resource, 
  isOpen, 
  onClose, 
  onSave,
  onDelete,
  onCreateArticle
}: ResourceEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article' as 'audio' | 'pdf' | 'video' | 'article',
    url: '',
    thumbnail: '',
    duration: '',
    tags: '',
    publisher: '',
    isPublic: true,
    isYouTube: false,
    youtubeUrl: '',
    content: '', // Added for article content
    createdAt: new Date() // Added for creation date
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        thumbnail: resource.thumbnail || '',
        duration: resource.duration?.toString() || '',
        tags: resource.tags.join(', '),
        publisher: resource.publisher,
        isPublic: resource.isPublic,
        isYouTube: resource.isYouTube || false,
        youtubeUrl: resource.youtubeUrl || '',
        content: resource.content || '', // Added for article content
        createdAt: resource.createdAt // Added for creation date
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'article',
        url: '',
        thumbnail: '',
        duration: '',
        tags: '',
        publisher: '',
        isPublic: true,
        isYouTube: false,
        youtubeUrl: '',
        content: '', // Added for article content
        createdAt: new Date() // Added for creation date
      });
    }
  }, [resource]);

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

  const handleSave = async () => {
    if (!resource) return;
    
    setIsLoading(true);
    try {
      const updatedResource: Resource = {
        ...resource,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.isYouTube ? formData.youtubeUrl : formData.url,
        thumbnail: formData.thumbnail,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publisher: formData.publisher,
        isPublic: formData.isPublic,
        isYouTube: formData.isYouTube,
        youtubeUrl: formData.youtubeUrl,
        content: formData.content, // Added for article content
        createdAt: formData.createdAt // Added for creation date
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(updatedResource);
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onDelete(resource.id);
      onClose();
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, url: url }));
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate thumbnail upload
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, thumbnail: url }));
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent wide className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(formData.type)}
            Edit Resource
          </DialogTitle>
          <DialogDescription>
            <span className="text-muted-foreground text-sm">Update resource details and preview changes.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Type and Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                placeholder="Publisher name"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Resource description"
              rows={3}
            />
          </div>

          {/* URL and Duration */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="url">Resource URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/resource"
                disabled={formData.isYouTube}
              />
            </div>
            {(formData.type === 'audio' || formData.type === 'video') && (
              <div className="w-32">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="15"
                />
              </div>
            )}
          </div>

          {/* YouTube URL Option for Videos */}
          {formData.type === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isYouTube"
                  checked={formData.isYouTube}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isYouTube: e.target.checked,
                    url: e.target.checked ? '' : prev.url,
                    youtubeUrl: e.target.checked ? prev.youtubeUrl : ''
                  }))}
                  className="rounded"
                />
                <Label htmlFor="isYouTube">This is a YouTube video</Label>
              </div>
              
              {formData.isYouTube && (
                <div>
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the YouTube video URL here. The video will be embedded and displayed directly.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {formData.thumbnail && (
              <div className="mt-2">
                <img 
                  src={formData.thumbnail} 
                  alt="Thumbnail preview" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="meditation, anxiety, stress-relief"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                return (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {trimmedTag}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* File Upload */}
          {formData.type !== 'article' && !formData.isYouTube && (
            <div>
              <Label>Upload Resource File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept={formData.type === 'audio' ? 'audio/*' : formData.type === 'video' ? 'video/*' : formData.type === 'pdf' ? '.pdf' : '*'}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload {formData.type} file
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* YouTube Notice */}
          {formData.type === 'video' && formData.isYouTube && (
            <div className="border-2 border-dashed border-red-500/25 rounded-lg p-4 text-center bg-red-500/5">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">YouTube Video</h3>
              <p className="text-muted-foreground text-sm">
                This video will be embedded directly from YouTube and displayed like an uploaded video.
              </p>
            </div>
          )}

          {/* Article Creation Notice */}
          {formData.type === 'article' && (
            <div className="border-2 border-dashed border-primary/25 rounded-lg p-6 text-center bg-primary/5">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Create Article Content</h3>
              <p className="text-muted-foreground mb-4">
                Articles are created directly on the platform with rich text editing capabilities.
              </p>
              {onCreateArticle && (
                <Button onClick={onCreateArticle}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Open Article Editor
                </Button>
              )}
            </div>
          )}

          {/* Article Content */}
          {formData.type === 'article' && (
            <div>
              <Label htmlFor="content">Article Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter article content here..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use HTML tags for formatting. For rich text editing, use the Article Editor.
              </p>
            </div>
          )}

          {/* Creation Date */}
          <div>
            <Label htmlFor="createdAt">Creation Date</Label>
            <Input
              id="createdAt"
              type="date"
              value={formData.createdAt.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                createdAt: new Date(e.target.value) 
              }))}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="isPublic">Make this resource public</Label>
            </div>
            <Badge variant="outline" className={cn(formData.isPublic ? 'border-green-500/40 text-green-600 dark:text-green-400' : 'border-yellow-500/40 text-yellow-600 dark:text-yellow-400')}>
              {formData.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>

          {/* Live Preview */}
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(formData.type)}
                <span className="text-sm text-muted-foreground capitalize">{formData.type}</span>
              </div>
              <Badge variant="secondary">{formData.publisher || 'Publisher'}</Badge>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-lg font-semibold line-clamp-2">{formData.title || 'Untitled resource'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{formData.description || 'Description preview...'}</p>
              {formData.type === 'video' && !formData.isYouTube && formData.url && (
                <video src={formData.url} controls className="w-full rounded-md" />
              )}
              {formData.type === 'video' && formData.isYouTube && formData.youtubeUrl && (
                <div className="aspect-video w-full rounded-md overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${(formData.youtubeUrl || '').split('v=')[1] || ''}`}
                    title="YouTube preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              {formData.type === 'pdf' && formData.url && (
                <div className="w-full h-56 rounded-md overflow-hidden border">
                  <iframe src={formData.url} className="w-full h-full" title="PDF preview" />
                </div>
              )}
              {formData.type === 'audio' && formData.url && (
                <audio src={formData.url} controls className="w-full" />
              )}
              {formData.type === 'article' && (
                <div className="prose dark:prose-invert max-w-none border rounded-md p-3">
                  <div dangerouslySetInnerHTML={{ __html: formData.content || formData.description || '<p>Article content preview...</p>' }} />
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {formData.tags.split(',').map((t, i) => {
                  const tt = t.trim();
                  if (!tt) return null;
                  return <Badge key={i} variant="outline" className="text-xs">{tt}</Badge>;
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Delete Resource
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
