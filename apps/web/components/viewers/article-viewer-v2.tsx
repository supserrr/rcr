'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Download, Share2, Bookmark } from 'lucide-react';

interface ArticleLike {
  id: string;
  title: string;
  content?: string;
  description?: string;
  publisher?: string; // UUID - not displayed
  publisherName?: string; // Display name
  createdAt?: Date;
  thumbnail?: string;
  tags?: string[];
}

interface ArticleViewerV2Props {
  article: ArticleLike | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (article: ArticleLike) => void;
  onBookmark?: (article: ArticleLike) => void;
  onDownload?: (article: ArticleLike) => void;
}

export function ArticleViewerV2({ article, isOpen, onClose, onShare, onBookmark, onDownload }: ArticleViewerV2Props) {
  if (!article) return null;

  const wordCount = (article.content || article.description || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 225));
  const publishedAt = article.createdAt ? new Date(article.createdAt) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent wide className="max-h-[92vh] overflow-y-auto">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">{article.title}</DialogTitle>
        <div className="mx-auto w-full max-w-[1000px]">
          {/* Hero section */}
          {article.thumbnail && (
            <div className="mb-6 overflow-hidden rounded-lg border bg-muted/20">
              <img src={article.thumbnail} alt={article.title} className="h-[360px] w-full object-cover" />
            </div>
          )}

          {/* Title and meta */}
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {article.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {article.publisherName && (
                <div className="inline-flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                    {article.publisherName.substring(0, 2).toUpperCase()}
                  </div>
                  <span>{article.publisherName}</span>
                </div>
              )}
              {publishedAt && (
                <span>{publishedAt.toLocaleDateString()}</span>
              )}
              <span>{readingMinutes} min read</span>
            </div>
          </header>

          {/* Action bar */}
          <div className="mb-6 flex items-center gap-2">
            {onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(article)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            )}
            {onBookmark && (
              <Button variant="outline" size="sm" onClick={() => onBookmark(article)}>
                <Bookmark className="h-4 w-4 mr-2" /> Bookmark
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={() => onDownload(article)}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            )}
          </div>

          {/* Article body */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content || article.description || '' }} />
          </article>

          {/* Tags footer */}
          {article.tags && article.tags.length > 0 && (
            <footer className="mt-8">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </footer>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onShare && (
            <Button variant="outline" onClick={() => onShare(article)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {onBookmark && (
            <Button variant="outline" onClick={() => onBookmark(article)}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
          )}
          {onDownload && (
            <Button onClick={() => onDownload(article)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


