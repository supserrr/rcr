'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { 
  X, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Download,
  Calendar,
  User,
  Eye,
  Printer,
  Clock,
  Edit
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Resource } from '../lib/types';

interface ArticleViewerProps {
  article: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (article: Resource) => void;
  onBookmark?: (article: Resource) => void;
  onDownload?: (article: Resource) => void;
  onEdit?: (article: Resource) => void;
}

export function ArticleViewer({ 
  article, 
  isOpen, 
  onClose, 
  onShare,
  onBookmark,
  onDownload,
  onEdit
}: ArticleViewerProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url: window.location.origin + article?.url,
        });
        showToastMessage('Article shared successfully!', 'success');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.origin + article?.url);
        showToastMessage('Link copied to clipboard!', 'success');
      }
      
      if (onShare && article) {
        onShare(article);
      }
    } catch (error) {
      showToastMessage('Share failed. Please try again.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked);
      
      if (onBookmark && article) {
        onBookmark(article);
      }
      
      showToastMessage(
        isBookmarked ? 'Removed from saved articles' : 'Added to saved articles', 
        'success'
      );
    } catch (error) {
      showToastMessage('Bookmark action failed. Please try again.', 'error');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onDownload && article) {
        onDownload(article);
      }
      
      // Create a downloadable HTML file
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${article?.title}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .meta { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 20px; 
              background: #f8f9fa; 
              padding: 12px; 
              border-radius: 8px; 
              border: 1px solid #e9ecef;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .content { line-height: 1.6; }
            .tags { margin-top: 20px; }
            .tag { background: #f0f0f0; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${article?.title}</h1>
          <div class="meta">
            <div class="meta-item">
              <span>📅</span>
              <span>${article?.createdAt.toLocaleDateString()}</span>
            </div>
            <div class="meta-item">
              <span>👤</span>
              <span>Published by ${article?.publisher}</span>
            </div>
          </div>
          <div class="content">
            ${article?.content || ''}
          </div>
          <div class="tags">
            ${article?.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article?.title.replace(/\s+/g, '-')}.html`;
      link.click();
      URL.revokeObjectURL(url);
      
      showToastMessage('Article downloaded successfully!', 'success');
    } catch (error) {
      showToastMessage('Download failed. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {article.title}
        </DialogTitle>
        
        {/* Article Content */}
        <div className="bg-background">
          {/* Hero Section */}
          <div className="px-6 py-6">
            <div className="max-w-3xl mx-auto">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {/* Article Meta */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{article.publisher}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  {article.content && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{getReadingTime(article.content)}</span>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                {article.title}
              </h1>

              {/* Article Description */}
              {article.description && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {article.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center space-x-2"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </Button>

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(article!)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="px-6 pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50",
                toastType === 'success' && "bg-green-500 text-white",
                toastType === 'error' && "bg-red-500 text-white",
                toastType === 'info' && "bg-blue-500 text-white"
              )}
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}