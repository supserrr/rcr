'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { ArticleEditor } from '@workspace/ui/components/article-editor';
import { ArticleViewerV2 } from '../../../../components/viewers/article-viewer-v2';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { 
  Search, 
  Edit,
  Trash2,
  Eye,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Filter,
  SortAsc,
  SortDesc,
  FileText,
  Video,
  BookOpen,
  Play,
  AlertTriangle,
  RefreshCw,
  Calendar,
  User,
  Upload,
  ArrowLeft,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Resource } from '@/lib/api/resources';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi } from '../../../../lib/api/resources';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

/**
 * Admin Resources Review Page
 * 
 * Allows admins to review, edit, publish, unpublish, and delete resources
 * published by counselors.
 */
export default function AdminResourcesReviewPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Load all resources (admin can see all)
  const { resources, loading, updateResource, deleteResource, createResourceWithFile, createResource } = useResources();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('view');
  
  // Modal states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingArticle, setEditingArticle] = useState<Resource | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  
  // File input refs
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload form state
  const [uploadFormData, setUploadFormData] = useState<{
    audio: { file: File | null; title: string; description: string; tags: string; duration: string };
    video: { file: File | null; title: string; description: string; tags: string; duration: string; isYouTube: boolean; youtubeUrl: string };
    pdf: { file: File | null; title: string; description: string; tags: string };
  }>({
    audio: { file: null, title: '', description: '', tags: '', duration: '' },
    video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
    pdf: { file: null, title: '', description: '', tags: '' },
  });
  
  const [isUploading, setIsUploading] = useState(false);

  const resourceTypes = ['all', 'audio', 'pdf', 'video', 'article'];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'public', label: 'Published' },
    { value: 'private', label: 'Unpublished' },
  ];
  const sortOptions = [
    { value: 'date', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'publisher', label: 'Publisher' },
  ];
  const resourceSummary = useMemo(() => {
    const total = resources.length;
    const published = resources.filter((resource) => resource.isPublic).length;
    const privateCount = total - published;
    const totalViews = resources.reduce((sum, resource) => sum + (resource.views ?? 0), 0);
    const totalDownloads = resources.reduce(
      (sum, resource) => sum + (resource.downloads ?? 0),
      0,
    );
    return {
      total,
      published,
      privateCount,
      totalViews,
      totalDownloads,
    };
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (resource.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (resource.publisher?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'public' && resource.isPublic) ||
                           (statusFilter === 'private' && !resource.isPublic);
      
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'publisher':
          comparison = (a.publisher || '').localeCompare(b.publisher || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [resources, searchTerm, selectedType, statusFilter, sortBy, sortOrder]);

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  };

  const handleEditResource = (resource: Resource) => {
    // For articles, use the article editor
    if (resource.type === 'article') {
      setEditingArticle(resource);
      setIsArticleEditorOpen(true);
    } else {
      // For other resource types, load into upload tabs (which now support edit mode)
      setEditingResource(resource);
      // Set the appropriate upload tab based on resource type (they work for both create and edit)
      if (resource.type === 'audio') {
        setUploadFormData(prev => ({
          ...prev,
          audio: {
            file: null,
            title: resource.title,
            description: resource.description,
            tags: resource.tags.join(', '),
            duration: '',
          },
        }));
        setActiveTab('upload-audio');
      } else if (resource.type === 'video') {
        setUploadFormData(prev => ({
          ...prev,
          video: {
            file: null,
            title: resource.title,
            description: resource.description,
            tags: resource.tags.join(', '),
            duration: '',
            isYouTube: !!resource.youtubeUrl,
            youtubeUrl: resource.youtubeUrl || '',
          },
        }));
        setActiveTab('upload-video');
      } else if (resource.type === 'pdf') {
        setUploadFormData(prev => ({
          ...prev,
          pdf: {
            file: null,
            title: resource.title,
            description: resource.description,
            tags: resource.tags.join(', '),
          },
        }));
        setActiveTab('upload-pdf');
      }
    }
  };

  const handleCloseArticleEditor = () => {
    setIsArticleEditorOpen(false);
    setEditingArticle(null);
  };

  // Convert API Resource to UI Resource type
  const convertToUIResource = (apiResource: Resource): any => {
    return {
      ...apiResource,
      createdAt: new Date(apiResource.createdAt),
      url: apiResource.url || '',
      views: 0,
      downloads: 0,
      updatedAt: new Date(apiResource.createdAt),
    };
  };

  // File selection handlers
  const handleChooseAudioFile = () => {
    audioFileInputRef.current?.click();
  };

  const handleChooseVideoFile = () => {
    videoFileInputRef.current?.click();
  };

  const handleChoosePdfFile = () => {
    pdfFileInputRef.current?.click();
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 100MB. ` +
          `Please compress your audio or choose a smaller file.`
        );
        if (event.target) {
          event.target.value = '';
        }
        return;
      }
      setUploadFormData(prev => ({
        ...prev,
        audio: {
          ...prev.audio,
          file,
          title: prev.audio.title || file.name.replace(/\.[^/.]+$/, ''),
        },
      }));
      toast.success('Audio file selected');
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 500MB. ` +
          `Please compress your video or choose a smaller file.`
        );
        if (event.target) {
          event.target.value = '';
        }
        return;
      }
      setUploadFormData(prev => ({
        ...prev,
        video: {
          ...prev.video,
          file,
          title: prev.video.title || file.name.replace(/\.[^/.]+$/, ''),
        },
      }));
      toast.success('Video file selected');
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB. ` +
          `Please compress your PDF or choose a smaller file.`
        );
        if (event.target) {
          event.target.value = '';
        }
        return;
      }
      setUploadFormData(prev => ({
        ...prev,
        pdf: {
          ...prev.pdf,
          file,
          title: prev.pdf.title || file.name.replace(/\.[^/.]+$/, ''),
        },
      }));
      toast.success('PDF file selected');
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  // Upload handlers
  const handleUploadAudio = async () => {
    const { file, title, description, tags, duration } = uploadFormData.audio;
    const isEditMode = !!editingResource && editingResource.type === 'audio';
    
    if (!isEditMode && !file) {
      toast.error('Please select an audio file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (isEditMode && editingResource) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
        };
        
        if (file) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          if (!supabase) throw new Error('Supabase is not configured');
          
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) throw new Error('User not authenticated');
          
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
          const fileName = `${authUser.id}-audio-${Date.now()}.${fileExt}`;
          const filePath = fileName;
          
          const { error: uploadError } = await supabase.storage
            .from('resources')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
          
          if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);
          
          const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(filePath);
          
          updateData.url = publicUrl;
        }
        
        await updateResource(editingResource.id, updateData);
        toast.success('Audio resource updated successfully');
        setEditingResource(null);
        setActiveTab('view');
      } else {
        if (!file) {
          toast.error('Please select an audio file');
          setIsUploading(false);
          return;
        }
        
        await createResourceWithFile(file, {
          title: title.trim(),
          description: description.trim(),
          type: 'audio',
          tags: tagsArray,
          isPublic: true,
          publisherName: user?.name || 'Unknown',
        });

        toast.success('Audio resource uploaded successfully');
        setActiveTab('view');
      }
      
      setUploadFormData(prev => ({
        ...prev,
        audio: { file: null, title: '', description: '', tags: '', duration: '' },
      }));
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadVideo = async () => {
    const { file, title, description, tags, duration, isYouTube, youtubeUrl } = uploadFormData.video;
    const isEditMode = !!editingResource && editingResource.type === 'video';
    
    if (!isEditMode && !file && !isYouTube) {
      toast.error('Please select a video file or enable YouTube');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (isYouTube && !youtubeUrl?.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsUploading(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (isEditMode && editingResource) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
          youtubeUrl: isYouTube ? youtubeUrl?.trim() : undefined,
        };
        
        if (file && !isYouTube) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          if (!supabase) throw new Error('Supabase is not configured');
          
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) throw new Error('User not authenticated');
          
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
          const fileName = `${authUser.id}-video-${Date.now()}.${fileExt}`;
          const filePath = fileName;
          
          const { error: uploadError } = await supabase.storage
            .from('resources')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
          
          if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);
          
          const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(filePath);
          
          updateData.url = publicUrl;
        }
        
        await updateResource(editingResource.id, updateData);
        toast.success('Video resource updated successfully');
      setEditingResource(null);
        setActiveTab('view');
      } else {
        if (isYouTube) {
          await createResource({
            title: title.trim(),
            description: description.trim(),
            type: 'video',
            tags: tagsArray,
            isPublic: true,
            youtubeUrl: youtubeUrl?.trim(),
            publisherName: user?.name || 'Unknown',
          });
          toast.success('YouTube video resource created successfully');
        } else {
          if (!file) {
            toast.error('Please select a video file');
            setIsUploading(false);
            return;
          }
          
          await createResourceWithFile(file, {
            title: title.trim(),
            description: description.trim(),
            type: 'video',
            tags: tagsArray,
            isPublic: true,
            publisherName: user?.name || 'Unknown',
          });
          toast.success('Video resource uploaded successfully');
        }
        setActiveTab('view');
      }
      
      setUploadFormData(prev => ({
        ...prev,
        video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
      }));
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadPdf = async () => {
    const { file, title, description, tags } = uploadFormData.pdf;
    const isEditMode = !!editingResource && editingResource.type === 'pdf';
    
    if (!isEditMode && !file) {
      toast.error('Please select a PDF file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (isEditMode && editingResource) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
        };
        
        if (file) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          if (!supabase) throw new Error('Supabase is not configured');
          
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) throw new Error('User not authenticated');
          
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
          const fileName = `${authUser.id}-pdf-${Date.now()}.${fileExt}`;
          const filePath = fileName;
          
          const { error: uploadError } = await supabase.storage
            .from('resources')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
          
          if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);
          
          const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(filePath);
          
          updateData.url = publicUrl;
        }
        
        await updateResource(editingResource.id, updateData);
        toast.success('PDF resource updated successfully');
        setEditingResource(null);
        setActiveTab('view');
      } else {
        if (!file) {
          toast.error('Please select a PDF file');
          setIsUploading(false);
          return;
        }
        
        await createResourceWithFile(file, {
          title: title.trim(),
          description: description.trim(),
          type: 'pdf',
          tags: tagsArray,
          isPublic: true,
          publisherName: user?.name || 'Unknown',
        });

        toast.success('PDF resource uploaded successfully');
        setActiveTab('view');
      }
      
      setUploadFormData(prev => ({
        ...prev,
        pdf: { file: null, title: '', description: '', tags: '' },
      }));
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveArticle = async (article: any) => {
    try {
      await updateResource(article.id, {
        title: article.title,
        description: article.description,
        type: article.type,
        tags: article.tags,
        isPublic: article.isPublic,
        content: article.content,
      });
      toast.success('Article updated successfully!');
      setIsArticleEditorOpen(false);
      setEditingArticle(null);
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Failed to update article. Please try again.');
    }
  };

  const handlePublishResource = async (resourceId: string) => {
    try {
      await updateResource(resourceId, { isPublic: true });
      toast.success('Resource published successfully!');
    } catch (error) {
      console.error('Error publishing resource:', error);
      toast.error('Failed to publish resource. Please try again.');
    }
  };

  const handleUnpublishResource = async (resourceId: string) => {
    try {
      await updateResource(resourceId, { isPublic: false });
      toast.success('Resource unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing resource:', error);
      toast.error('Failed to unpublish resource. Please try again.');
    }
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteResource = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      handleDeleteClick(resource);
    }
  };

  const handleDeleteConfirm = async () => {
    if (resourceToDelete) {
      try {
        await deleteResource(resourceToDelete.id);
        toast.success('Resource deleted successfully!');
        setDeleteConfirmOpen(false);
        setResourceToDelete(null);
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource. Please try again.');
      }
    }
  };

  const handleViewArticle = (resource: any) => {
    setViewingArticle(resource as Resource);
    setIsArticleViewerOpen(true);
  };

  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setViewingArticle(null);
  };

  const handleDownloadResource = async (resource: Resource | any) => {
    try {
      // Track download and get signed URL
      await ResourcesApi.trackView(resource.id);
      if (resource.url) {
        window.open(resource.url, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Download URL not available');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource. Please try again.');
    }
  };

  const handleShareResource = async (resource: Resource | any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description || '',
          url: resource.url || window.location.href,
        });
        toast.success('Resource shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(resource.url || window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      // User cancelled share, don't show error
    }
  };

  const handleBookmarkResource = (resource: Resource | any) => {
    // Note: Bookmarking would need to be implemented in the backend
    toast.info('Bookmarking feature coming soon');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return Play;
      case 'video':
        return Video;
      case 'pdf':
        return FileText;
      case 'article':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'video':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'pdf':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'article':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={40} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Resources Review"
        description="Review, edit, publish, unpublish, and manage resources from counselors"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>View Resources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <AnimatedCard delay={0.1}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{resourceSummary.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.2}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {resourceSummary.published}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.3}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpublished</p>
                <p className="text-2xl font-bold">
                  {resourceSummary.privateCount}
                </p>
              </div>
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.4}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">
                  {resourceSummary.totalViews.toLocaleString()} views
                </p>
              </div>
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              {resourceSummary.totalDownloads.toLocaleString()} downloads
            </p>
          </div>
        </AnimatedCard>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search by title, description, publisher, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <AnimatedCard delay={0.6}>
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <AnimatedCard key={resource.id} delay={0.1 * (index % 6)}>
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-primary" />
                      <Badge className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>
                    <Badge variant={resource.isPublic ? 'default' : 'secondary'}>
                      {resource.isPublic ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Unpublished
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                  </div>

                  {/* Publisher and Date */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{resource.publisher || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResource(resource)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditResource(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={resource.isPublic ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => resource.isPublic 
                        ? handleUnpublishResource(resource.id)
                        : handlePublishResource(resource.id)
                      }
                    >
                      {resource.isPublic ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(resource)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}
        </TabsContent>

        {/* Upload Audio Tab */}
        <TabsContent value="upload-audio" className="mt-6">
          <div className="space-y-6">
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
              onChange={handleAudioFileChange}
              className="hidden"
            />

            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">
                  {editingResource && editingResource.type === 'audio' ? 'Edit Audio Resource' : 'Upload Audio File'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingResource && editingResource.type === 'audio' ? 'Update audio resource details' : 'Add audio content for your patients'}
                </p>
              </div>
            </div>

            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-12 text-center hover:border-purple-300 transition-colors">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Drop your audio file here</h4>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Supported formats: MP3, WAV, M4A, AAC. Maximum file size: 100MB
                </p>
                {uploadFormData.audio.file && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Selected: {uploadFormData.audio.file.name}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      {(uploadFormData.audio.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleChooseAudioFile} className="bg-purple-600 hover:bg-purple-700">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFormData.audio.file ? 'Change Audio File' : 'Choose Audio File'}
                  </Button>
                  {uploadFormData.audio.file && (
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadFormData(prev => ({ ...prev, audio: { ...prev.audio, file: null } }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Guidelines
                  </Button>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <h4 className="font-semibold mb-4">Resource Details</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
                  <Input 
                    placeholder="Enter audio title..." 
                    value={uploadFormData.audio.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, audio: { ...prev.audio, title: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Duration</label>
                  <Input 
                    placeholder="e.g., 15:30" 
                    value={uploadFormData.audio.duration}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, audio: { ...prev.audio, duration: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Describe the audio content..." 
                    rows={3}
                    value={uploadFormData.audio.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, audio: { ...prev.audio, description: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                  <Input 
                    placeholder="Enter tags separated by commas..." 
                    value={uploadFormData.audio.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, audio: { ...prev.audio, tags: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleUploadAudio}
                  disabled={isUploading || (!uploadFormData.audio.file && !(editingResource && editingResource.type === 'audio'))}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      {editingResource && editingResource.type === 'audio' ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {editingResource && editingResource.type === 'audio' ? 'Update & Save' : 'Upload & Save'}
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        {/* Upload Video Tab */}
        <TabsContent value="upload-video" className="mt-6">
          <div className="space-y-6">
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv"
              onChange={handleVideoFileChange}
              className="hidden"
            />

            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">
                  {editingResource && editingResource.type === 'video' ? 'Edit Video Resource' : 'Upload Video File'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingResource && editingResource.type === 'video' ? 'Update video resource details' : 'Add video content for your patients'}
                </p>
              </div>
            </div>

            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-12 text-center hover:border-blue-300 transition-colors">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Drop your video file here</h4>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Supported formats: MP4, MOV, AVI, MKV. Maximum file size: 500MB
                </p>
                {uploadFormData.video.file && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected: {uploadFormData.video.file.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {(uploadFormData.video.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleChooseVideoFile} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFormData.video.file ? 'Change Video File' : 'Choose Video File'}
                  </Button>
                  {uploadFormData.video.file && (
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadFormData(prev => ({ ...prev, video: { ...prev.video, file: null } }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Guidelines
                  </Button>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <h4 className="font-semibold mb-4">Resource Details</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
                  <Input 
                    placeholder="Enter video title..." 
                    value={uploadFormData.video.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, video: { ...prev.video, title: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Duration</label>
                  <Input 
                    placeholder="e.g., 25:45" 
                    value={uploadFormData.video.duration}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, video: { ...prev.video, duration: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Describe the video content..." 
                    rows={3}
                    value={uploadFormData.video.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, video: { ...prev.video, description: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                  <Input 
                    placeholder="Enter tags separated by commas..." 
                    value={uploadFormData.video.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, video: { ...prev.video, tags: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleUploadVideo}
                  disabled={isUploading || (!uploadFormData.video.file && !uploadFormData.video.isYouTube && !(editingResource && editingResource.type === 'video'))}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      {editingResource && editingResource.type === 'video' ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {editingResource && editingResource.type === 'video' ? 'Update & Save' : 'Upload & Save'}
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        {/* Upload PDF Tab */}
        <TabsContent value="upload-pdf" className="mt-6">
          <div className="space-y-6">
            <input
              ref={pdfFileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfFileChange}
              className="hidden"
            />

            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">
                  {editingResource && editingResource.type === 'pdf' ? 'Edit PDF Resource' : 'Upload PDF Document'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingResource && editingResource.type === 'pdf' ? 'Update PDF resource details' : 'Add PDF content for your patients'}
                </p>
              </div>
            </div>

            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-red-200 rounded-xl p-12 text-center hover:border-red-300 transition-colors">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-red-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Drop your PDF file here</h4>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Supported formats: PDF. Maximum file size: 50MB
                </p>
                {uploadFormData.pdf.file && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Selected: {uploadFormData.pdf.file.name}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {(uploadFormData.pdf.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleChoosePdfFile} className="bg-red-600 hover:bg-red-700">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFormData.pdf.file ? 'Change PDF File' : 'Choose PDF File'}
                  </Button>
                  {uploadFormData.pdf.file && (
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadFormData(prev => ({ ...prev, pdf: { ...prev.pdf, file: null } }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Guidelines
                  </Button>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <h4 className="font-semibold mb-4">Resource Details</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
                  <Input 
                    placeholder="Enter document title..." 
                    value={uploadFormData.pdf.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, pdf: { ...prev.pdf, title: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Describe the document content..." 
                    rows={3}
                    value={uploadFormData.pdf.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, pdf: { ...prev.pdf, description: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                  <Input 
                    placeholder="Enter tags separated by commas..." 
                    value={uploadFormData.pdf.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, pdf: { ...prev.pdf, tags: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('view');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleUploadPdf}
                  disabled={isUploading || (!uploadFormData.pdf.file && !(editingResource && editingResource.type === 'pdf'))}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      {editingResource && editingResource.type === 'pdf' ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {editingResource && editingResource.type === 'pdf' ? 'Update & Save' : 'Upload & Save'}
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewerModalV2
          resource={convertToUIResource(selectedResource)}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onDownload={handleDownloadResource}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
          onViewArticle={handleViewArticle}
        />
      )}


      {/* Article Editor */}
      {editingArticle && (
        <ArticleEditor
          article={convertToUIResource(editingArticle)}
          isOpen={isArticleEditorOpen}
          onClose={handleCloseArticleEditor}
          onSave={handleSaveArticle}
        />
      )}

      {/* Article Viewer */}
      {viewingArticle && (
        <ArticleViewerV2
          article={{
            id: viewingArticle.id,
            title: viewingArticle.title,
            content: viewingArticle.content,
            description: viewingArticle.description,
            publisher: viewingArticle.publisher,
            createdAt: new Date(viewingArticle.createdAt),
            thumbnail: viewingArticle.thumbnail,
            tags: viewingArticle.tags,
          }}
          isOpen={isArticleViewerOpen}
          onClose={handleCloseArticleViewer}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
          onDownload={handleDownloadResource}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Resource
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{resourceToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

