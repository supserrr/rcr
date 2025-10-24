'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Clock, 
  FileText, 
  Video, 
  BookOpen,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Resource } from '@workspace/ui/lib/types';

interface ResourceViewerModalProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (resource: Resource) => void;
  onShare?: (resource: Resource) => void;
  onBookmark?: (resource: Resource) => void;
}

export function ResourceViewerModal({ 
  resource, 
  isOpen, 
  onClose, 
  onDownload,
  onShare,
  onBookmark
}: ResourceViewerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(resource.duration || 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Play className="h-6 w-6" />;
      case 'pdf':
        return <FileText className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'article':
        return <BookOpen className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (resource.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (resource.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement | HTMLVideoElement>) => {
    const target = e.target as HTMLAudioElement | HTMLVideoElement;
    setCurrentTime(target.currentTime);
    setProgress((target.currentTime / target.duration) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (resource.type === 'audio' && audioRef.current) {
      audioRef.current.currentTime = seekTime;
    } else if (resource.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
    setProgress((seekTime / duration) * 100);
  };

  const handleVolumeToggle = () => {
    if (resource.type === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted;
    } else if (resource.type === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (resource.type === 'video' && videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onDownload) {
        onDownload(resource);
      }
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title;
      link.click();
      
      showToastMessage('Resource downloaded successfully!', 'success');
    } catch (error) {
      showToastMessage('Download failed. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.origin + resource.url,
        });
        showToastMessage('Resource shared successfully!', 'success');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.origin + resource.url);
        showToastMessage('Link copied to clipboard!', 'success');
      }
      
      if (onShare) {
        onShare(resource);
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
      
      if (onBookmark) {
        onBookmark(resource);
      }
      
      showToastMessage(
        isBookmarked ? 'Removed from saved resources' : 'Added to saved resources', 
        'success'
      );
    } catch (error) {
      showToastMessage('Bookmark action failed. Please try again.', 'error');
    }
  };

  const renderMediaPlayer = () => {
    switch (resource.type) {
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800">{resource.title}</h3>
                <p className="text-sm text-purple-600">Audio Resource</p>
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={resource.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              className="hidden"
            />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVolumeToggle}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                src={resource.url}
                poster={resource.thumbnail}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                className="w-full aspect-video bg-black rounded-lg"
                controls={false}
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-2 text-white text-sm mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">{resource.title}</h3>
                <p className="text-sm text-red-600">PDF Document</p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  This PDF document is ready for viewing. Click the download button to access the full content.
                </p>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        );

      case 'article':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">{resource.title}</h3>
                <p className="text-sm text-green-600">Article</p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">{resource.title}</h2>
                <p className="text-muted-foreground mb-4">{resource.description}</p>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Key Points</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Understanding your diagnosis and treatment options</li>
                    <li>Managing side effects and maintaining quality of life</li>
                    <li>Building a support network and accessing resources</li>
                    <li>Communicating effectively with your healthcare team</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium">Additional Resources</h3>
                  <p className="text-muted-foreground">
                    For more information and support, please consult with your healthcare provider 
                    or contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{resource.title}</h3>
              <p className="text-sm text-gray-600">Resource</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Clean Header */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    {resource.title}
                  </DialogTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {resource.type.toUpperCase()}
                    </Badge>
                    {resource.duration && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{resource.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "transition-colors",
                    isBookmarked ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-blue-500"
                  )}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 fill-current" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Clean Content */}
          <div className="p-6 space-y-6">
            {/* Media Player */}
            <div className="space-y-4">
              {renderMediaPlayer()}
            </div>

            {/* Resource Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{resource.description}</p>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Added {resource.createdAt.toLocaleDateString()}</span>
                <span>Published by {resource.publisher}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div className={cn(
                "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2",
                toastType === 'success' && "bg-green-50 border-green-200 text-green-800",
                toastType === 'error' && "bg-red-50 border-red-200 text-red-800",
                toastType === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
              )}>
                {toastType === 'success' && <ThumbsUp className="h-4 w-4" />}
                {toastType === 'error' && <X className="h-4 w-4" />}
                {toastType === 'info' && <ExternalLink className="h-4 w-4" />}
                <span className="text-sm font-medium">{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
