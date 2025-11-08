'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface PDFViewerProps {
  url: string;
  title: string;
  thumbnail?: string;
}

export function PDFViewer({ url, title, thumbnail }: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    // Set up error handling for the PDF
    const handleError = () => {
      setError('Failed to load PDF. The file may be corrupted or inaccessible.');
      setLoading(false);
    };

    // Check if the URL is accessible
    if (url) {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error('PDF not accessible');
          }
          setLoading(false);
        })
        .catch(() => {
          handleError();
        });
    } else {
      handleError();
    }
  }, [url]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      link.target = '_blank';
      link.click();
      
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load PDF</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PDF Embed */}
      <div className="relative w-full">
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
          title={title}
          className="w-full h-[600px] rounded-xl border"
          frameBorder="0"
          onLoad={() => {
            setLoading(false);
            setError(null);
          }}
          onError={() => {
            setError('Failed to load PDF in viewer');
            setLoading(false);
          }}
        />
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>

      {/* PDF Actions */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <Button
          onClick={handleOpenInNewTab}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Open in New Tab</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
