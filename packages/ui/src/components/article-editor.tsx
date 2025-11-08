'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { 
  X, 
  Save,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Eye,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Resource } from '../lib/types';

interface ArticleEditorProps {
  article: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Resource) => void;
  onPreview?: (article: Resource) => void;
}

export function ArticleEditor({ 
  article, 
  isOpen, 
  onClose, 
  onSave,
  onPreview
}: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    publisher: '',
    isPublic: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        description: article.description,
        content: article.content || '',
        tags: article.tags.join(', '),
        publisher: article.publisher,
        isPublic: article.isPublic
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        tags: '',
        publisher: '',
        isPublic: true
      });
    }
  }, [article]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    
    setIsLoading(true);
    try {
      const articleData: Resource = {
        id: article?.id || `article-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: 'article',
        url: `/articles/${formData.title.toLowerCase().replace(/\s+/g, '-')}`,
        thumbnail: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop`,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: article?.createdAt || new Date(),
        isPublic: formData.isPublic,
        publisher: formData.publisher,
        content: formData.content
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(articleData);
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    
    const previewArticle: Resource = {
      id: 'preview',
      title: formData.title,
      description: formData.description,
      type: 'article',
      url: '',
      thumbnail: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop`,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      isPublic: formData.isPublic,
      publisher: formData.publisher,
      content: formData.content
    };
    
    if (onPreview) {
      onPreview(previewArticle);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    editorRef.current?.focus();
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Inserted image';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      document.execCommand('insertHTML', false, img.outerHTML);
    }
    editorRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {article ? 'Edit Article' : 'Create New Article'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the article"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="cancer, treatment, coping, wellness"
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

          {/* Content Editor */}
          <div>
            <Label>Article Content</Label>
            
            {/* Toolbar */}
            <div className="border border-input rounded-t-lg p-2 bg-muted/30 flex items-center gap-1 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertUnorderedList')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertOrderedList')}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock')}
                className="h-8 w-8 p-0"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="h-8 w-8 p-0"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                className="h-8 w-8 p-0"
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="border border-t-0 border-input rounded-b-lg p-4 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ whiteSpace: 'pre-wrap' }}
              onInput={(e) => {
                const content = e.currentTarget.innerHTML;
                setFormData(prev => ({ ...prev, content }));
              }}
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isPublic">Make this article public</Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!formData.title.trim() || !formData.content.trim()}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.title.trim() || !formData.content.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {article ? 'Update Article' : 'Create Article'}
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
