'use client';

import React, { useState, useMemo, useRef } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { ResourceEditModal } from '@workspace/ui/components/resource-edit-modal';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { 
  Search, 
  Upload, 
  Plus, 
  FileText, 
  Video, 
  BookOpen,
  Play,
  Download,
  Edit,
  Trash2,
  Eye,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Copy,
  Share2,
  Archive,
  BarChart3,
  Users,
  Calendar,
  Tag,
  Globe,
  Lock,
  RefreshCw,
  MoreHorizontal,
  Star,
  StarOff,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi, type Resource } from '../../../../lib/api/resources';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export default function CounselorResourcesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingArticle, setEditingArticle] = useState<Resource | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('view');
  const [savedResources, setSavedResources] = useState<string[]>([]);
  
  // Enhanced state for better management
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'views' | 'downloads'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');

  // File input refs
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadFormData, setUploadFormData] = useState<{
    audio: { file: File | null; title: string; description: string; tags: string; duration: string };
    video: { file: File | null; title: string; description: string; tags: string; duration: string };
    pdf: { file: File | null; title: string; description: string; tags: string };
    bulk: { files: File[] };
  }>({
    audio: { file: null, title: '', description: '', tags: '', duration: '' },
    video: { file: null, title: '', description: '', tags: '', duration: '' },
    pdf: { file: null, title: '', description: '', tags: '' },
    bulk: { files: [] },
  });

  const [isUploading, setIsUploading] = useState(false);

  const resourceTypes = ['all', 'audio', 'pdf', 'video', 'article'] as const;

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ];

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'views', label: 'Views' },
    { value: 'downloads', label: 'Downloads' },
  ];

  // Build query parameters based on filters
  const queryParams = useMemo(() => {
    const params: {
      type?: 'audio' | 'pdf' | 'video' | 'article';
      search?: string;
      isPublic?: boolean;
      publisher?: string;
      sortBy?: 'title' | 'created_at' | 'views' | 'downloads';
      sortOrder?: 'asc' | 'desc';
    } = {
      publisher: user?.id, // Show counselor's own resources
      sortBy,
      sortOrder,
    };

    if (selectedType !== 'all') {
      params.type = selectedType as 'audio' | 'pdf' | 'video' | 'article';
    }

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter === 'public') {
      params.isPublic = true;
    } else if (statusFilter === 'private') {
      params.isPublic = false;
    }

    return params;
  }, [selectedType, searchTerm, sortBy, sortOrder, statusFilter, user?.id]);

  // Load resources using the hook
  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    createResource,
    createResourceWithFile,
    updateResource,
    deleteResource,
    refreshResources,
  } = useResources(queryParams);

  // Filter resources based on active tab (client-side for saved resources)
  const filteredResources = useMemo(() => {
    if (activeTab === 'saved') {
    return resources.filter(resource => savedResources.includes(resource.id));
    }
    return resources;
  }, [resources, activeTab, savedResources]);

  // Get all unique tags from resources
  const allTags = useMemo(() => 
    Array.from(new Set(resources.flatMap(r => r.tags))),
    [resources]
  );

  // Statistics
  const stats = useMemo(() => ({
    total: resources.length,
    public: resources.filter(r => r.isPublic).length,
    private: resources.filter(r => !r.isPublic).length,
    byType: {
      audio: resources.filter(r => r.type === 'audio').length,
      pdf: resources.filter(r => r.type === 'pdf').length,
      video: resources.filter(r => r.type === 'video').length,
      article: resources.filter(r => r.type === 'article').length,
    },
    recent: resources.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) > weekAgo;
    }).length
  }), [resources]);

  const getSavedResources = () => {
    return resources.filter(resource => savedResources.includes(resource.id));
  };

  // Enhanced handlers
  const handleRefresh = async () => {
    try {
      await refreshResources();
      toast.success('Resources refreshed');
    } catch (error) {
      console.error('Error refreshing resources:', error);
      toast.error('Failed to refresh resources');
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      // Implement bulk actions based on action type
      toast.info(`Bulk ${action} functionality coming soon`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const handleDuplicateResource = async (resource: Resource) => {
    try {
      await createResource({
      title: `${resource.title} (Copy)`,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        thumbnail: resource.thumbnail,
        tags: resource.tags,
        isPublic: resource.isPublic,
        youtubeUrl: resource.youtubeUrl,
        content: resource.content,
        category: resource.category,
      });
      toast.success('Resource duplicated successfully');
    } catch (error) {
      console.error('Error duplicating resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate resource');
    }
  };

  const handleArchiveResource = async (resourceId: string) => {
    // Archive functionality can be implemented as a status update
    try {
      // For now, we can delete or update resource
      toast.info('Archive functionality coming soon');
    } catch (error) {
      console.error('Error archiving resource:', error);
      toast.error('Failed to archive resource');
    }
  };

  const handleFeatureResource = async (resourceId: string) => {
    // Feature functionality can be implemented as a metadata update
    try {
      toast.info('Feature functionality coming soon');
    } catch (error) {
      console.error('Error featuring resource:', error);
      toast.error('Failed to feature resource');
    }
  };

  const handleViewResource = async (resource: Resource) => {
    // Track view
    try {
      await ResourcesApi.trackView(resource.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }

    if (resource.type === 'article') {
      setViewingArticle(resource);
      setIsArticleViewerOpen(true);
    } else {
      setSelectedResource(resource);
      setIsViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  };

  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setViewingArticle(null);
  };

  const handleDownloadResource = async (resource: Resource) => {
    try {
      const downloadUrl = await ResourcesApi.getDownloadUrl(resource.id);
      // Track download
      await ResourcesApi.trackView(resource.id);
      
      // Open download URL in new tab
      window.open(downloadUrl.downloadUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download resource');
    }
  };

  const handleShareResource = (resource: Resource) => {
    // Share functionality - can be implemented with Web Share API or copy link
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleBookmarkResource = (resource: Resource) => {
    // Toggle saved state
    setSavedResources(prev => 
      prev.includes(resource.id) 
        ? prev.filter(id => id !== resource.id)
        : [...prev, resource.id]
    );
    toast.success(
      savedResources.includes(resource.id) 
        ? 'Resource removed from saved' 
        : 'Resource saved'
    );
  };

  const handleUnsaveResource = (resourceId: string) => {
    setSavedResources(prev => prev.filter(id => id !== resourceId));
    toast.success('Resource removed from saved');
  };

  const handleEditResource = (resource: Resource) => {
    if (resource.type === 'article') {
      setEditingArticle(resource);
      setIsArticleEditorOpen(true);
    } else {
      setEditingResource(resource);
      setIsEditOpen(true);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setIsArticleEditorOpen(true);
  };

  const handleViewArticle = (resource: Resource | any) => {
    setViewingArticle(resource);
    setIsArticleViewerOpen(true);
  };

  const handleSaveArticle = async (article: Resource) => {
    try {
      if (article.id && editingArticle) {
        // Update existing article
        await updateResource(article.id, {
          title: article.title,
          description: article.description,
          type: article.type,
          content: article.content,
          tags: article.tags,
          isPublic: article.isPublic,
          category: article.category,
        });
        toast.success('Article updated successfully');
      } else {
        // Create new article
        await createResource({
          title: article.title,
          description: article.description,
          type: article.type,
          content: article.content,
          tags: article.tags,
          isPublic: article.isPublic,
          category: article.category,
        });
        toast.success('Article created successfully');
      }
      setIsArticleEditorOpen(false);
      setEditingArticle(null);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save article');
    }
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

  const handleSaveResource = async (updatedResource: any) => {
    try {
      await updateResource(updatedResource.id, {
        title: updatedResource.title,
        description: updatedResource.description,
        type: updatedResource.type,
        url: updatedResource.url,
        thumbnail: updatedResource.thumbnail,
        tags: updatedResource.tags,
        isPublic: updatedResource.isPublic,
        youtubeUrl: updatedResource.youtubeUrl,
        content: updatedResource.content,
        category: updatedResource.category,
      });
      toast.success('Resource updated successfully');
      setIsEditOpen(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resource');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteResource(resourceId);
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete resource');
    }
  };

  const handlePublishResource = async (resourceId: string) => {
    try {
      await updateResource(resourceId, { isPublic: true });
      toast.success('Resource published successfully');
    } catch (error) {
      console.error('Error publishing resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish resource');
    }
  };

  const handleUnpublishResource = async (resourceId: string) => {
    try {
      await updateResource(resourceId, { isPublic: false });
      toast.success('Resource unpublished successfully');
    } catch (error) {
      console.error('Error unpublishing resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unpublish resource');
    }
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingResource(null);
  };

  const handleCloseArticleEditor = () => {
    setIsArticleEditorOpen(false);
    setEditingArticle(null);
  };

  // File input handlers
  const handleChooseAudioFile = () => {
    audioFileInputRef.current?.click();
  };

  const handleChooseVideoFile = () => {
    videoFileInputRef.current?.click();
  };

  const handleChoosePdfFile = () => {
    pdfFileInputRef.current?.click();
  };

  const handleChooseBulkFiles = () => {
    bulkFileInputRef.current?.click();
  };

  // File selection handlers
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (100MB limit for audio)
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 100MB. ` +
          `Please compress your audio or choose a smaller file.`
        );
        // Reset input value
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
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (500MB limit for videos)
      const maxFileSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 500MB. ` +
          `Please compress your video or choose a smaller file.`
        );
        // Reset input value
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
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit for PDFs)
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        toast.error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB. ` +
          `Please compress your PDF or choose a smaller file.`
        );
        // Reset input value
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
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBulkFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadFormData(prev => ({
        ...prev,
        bulk: { files },
      }));
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} selected`);
    }
    // Reset input value to allow selecting the same files again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Upload handlers
  const handleUploadAudio = async () => {
    const { file, title, description, tags, duration } = uploadFormData.audio;
    if (!file) {
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
      await createResourceWithFile(file, {
        title: title.trim(),
        description: description.trim(),
        type: 'audio',
        tags: tagsArray,
        isPublic: true,
      });

      toast.success('Audio resource uploaded successfully');
      
      // Reset form
      setUploadFormData(prev => ({
        ...prev,
        audio: { file: null, title: '', description: '', tags: '', duration: '' },
      }));
      
      // Switch to view tab
      setActiveTab('view');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadVideo = async () => {
    const { file, title, description, tags, duration } = uploadFormData.video;
    if (!file) {
      toast.error('Please select a video file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      await createResourceWithFile(file, {
        title: title.trim(),
        description: description.trim(),
        type: 'video',
        tags: tagsArray,
        isPublic: true,
      });

      toast.success('Video resource uploaded successfully');
      
      // Reset form
      setUploadFormData(prev => ({
        ...prev,
        video: { file: null, title: '', description: '', tags: '', duration: '' },
      }));
      
      // Switch to view tab
      setActiveTab('view');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadPdf = async () => {
    const { file, title, description, tags } = uploadFormData.pdf;
    if (!file) {
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
      await createResourceWithFile(file, {
        title: title.trim(),
        description: description.trim(),
        type: 'pdf',
        tags: tagsArray,
        isPublic: true,
      });

      toast.success('PDF resource uploaded successfully');
      
      // Reset form
      setUploadFormData(prev => ({
        ...prev,
        pdf: { file: null, title: '', description: '', tags: '' },
      }));
      
      // Switch to view tab
      setActiveTab('view');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  if (resourcesError && !resourcesLoading) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading resources</h3>
        <p className="text-muted-foreground">Please try again later.</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Resource Management"
        description="View, upload, and manage educational resources for your patients"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">View Resources</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Saved Resources</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Add Resources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  placeholder="Search resources by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
                />
              </div>
              
              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
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
                  <SelectTrigger className="w-32 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
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

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'title' | 'created_at' | 'views' | 'downloads')}>
                  <SelectTrigger className="w-36 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
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
                  size="sm"
                  className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={handleRefresh}
                  disabled={resourcesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${resourcesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found</span>
              </div>
            </div>
          </div>

          {/* Resources Display */}
          {resourcesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner variant="bars" size={32} className="text-primary" />
            </div>
          ) : filteredResources.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {filteredResources.map((resource, index) => (
                  <div key={resource.id} className="relative">
                    <ResourceCard
                      resource={convertToUIResource(resource)}
                      onView={(r: any) => handleViewResource(resource)}
                      onDownload={(r: any) => handleDownloadResource(resource)}
                      onEdit={(r: any) => handleEditResource(resource)}
                      onDelete={(r: any) => handleDeleteResource(resource.id)}
                      onPublish={(r: any) => handlePublishResource(resource.id)}
                      onUnpublish={(r: any) => handleUnpublishResource(resource.id)}
                      showEditActions={true}
                      delay={index * 0.1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mt-8">
                {filteredResources.map((resource, index) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 cursor-pointer group relative">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted dark:bg-muted/50 rounded-lg flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-200">
                        {resource.type === 'audio' && <Play className="h-6 w-6 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200" />}
                        {resource.type === 'pdf' && <FileText className="h-6 w-6 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200" />}
                        {resource.type === 'video' && <Video className="h-6 w-6 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200" />}
                        {resource.type === 'article' && <BookOpen className="h-6 w-6 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {resource.type.toUpperCase()}
                          </Badge>
                          <Badge variant={resource.isPublic ? "default" : "secondary"} className="text-xs">
                            {resource.isPublic ? "Public" : "Private"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(resource.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {resource.publisher}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleDuplicateResource(resource)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleDownloadResource(resource)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {resource.isPublic ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 hover:border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                          onClick={() => handleUnpublishResource(resource.id)}
                          title="Unpublish resource"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                          onClick={() => handlePublishResource(resource.id)}
                          title="Publish resource"
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleArchiveResource(resource.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 mt-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {getSavedResources().length} saved resource{getSavedResources().length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Your saved resources</span>
              </div>
            </div>

            {/* Saved Resources Grid */}
            {getSavedResources().length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {getSavedResources().map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={convertToUIResource(resource)}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    onEdit={(r: any) => handleEditResource(resource)}
                    onDelete={(r: any) => handleDeleteResource(resource.id)}
                    onUnsave={(r: any) => handleUnsaveResource(resource.id)}
                    showEditActions={true}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No saved resources</h3>
                <p className="text-muted-foreground mb-4">
                  Save resources by clicking the bookmark icon when viewing them
                </p>
                <Button 
                  onClick={() => setActiveTab('view')}
                >
                  Browse All Resources
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Add New Resource</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose how you'd like to add content to your resource library. All resources will be available to your patients.
              </p>
            </div>

            {/* Resource Type Grid - 3x3 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Audio Upload */}
              <AnimatedCard delay={0.1} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800 flex-shrink-0">
                      <Play className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">Audio Files</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Upload podcasts, guided meditations, or audio lessons
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">MP3</Badge>
                    <Badge variant="outline" className="text-xs">WAV</Badge>
                    <Badge variant="outline" className="text-xs">M4A</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveTab('upload-audio')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio
                  </Button>
                </div>
              </AnimatedCard>

              {/* Video Upload */}
              <AnimatedCard delay={0.2} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800 flex-shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">Video Files</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Upload educational videos, demonstrations, or tutorials
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">MP4</Badge>
                    <Badge variant="outline" className="text-xs">MOV</Badge>
                    <Badge variant="outline" className="text-xs">AVI</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab('upload-video')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              </AnimatedCard>

              {/* PDF Upload */}
              <AnimatedCard delay={0.3} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-red-100 text-red-800 flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">PDF Documents</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Upload guides, worksheets, or informational documents
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">PDF</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => setActiveTab('upload-pdf')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </AnimatedCard>

              {/* Create Article */}
              <AnimatedCard delay={0.4} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-green-100 text-green-800 flex-shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">Create Article</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Write new educational content with our rich text editor
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">Rich formatting</Badge>
                    <Badge variant="outline" className="text-xs">Media support</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab('create-article')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </div>
              </AnimatedCard>

              {/* External Link */}
              <AnimatedCard delay={0.5} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-orange-100 text-orange-800 flex-shrink-0">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">External Link</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Link to YouTube videos, websites, or other online resources
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">YouTube</Badge>
                    <Badge variant="outline" className="text-xs">Websites</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => setActiveTab('add-link')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </AnimatedCard>

              {/* Bulk Upload */}
              <AnimatedCard delay={0.6} className="group relative">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-0"></div>
                
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-800 flex-shrink-0">
                      <Upload className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-base">Bulk Upload</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Upload multiple files at once with automatic categorization
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">Drag & drop</Badge>
                    <Badge variant="outline" className="text-xs">Auto-categorize</Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setActiveTab('bulk-upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </div>
              </AnimatedCard>
            </div>

            {/* Help Section */}
            <div className="bg-muted/30 rounded-lg p-6 mt-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn more about creating effective educational resources for your patients.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Guidelines
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Video Tutorial
                    </Button>
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Best Practices
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload-audio" className="mt-6">
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
              onChange={handleAudioFileChange}
              className="hidden"
            />

            {/* Header with Back Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">Upload Audio File</h3>
                <p className="text-sm text-muted-foreground">Add audio content for your patients</p>
              </div>
            </div>

            {/* Upload Area */}
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

            {/* File Details Form */}
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
                <Button variant="outline" onClick={() => setActiveTab('manage')}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleUploadAudio}
                  disabled={isUploading || !uploadFormData.audio.file}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Save
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="upload-video" className="mt-6">
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv"
              onChange={handleVideoFileChange}
              className="hidden"
            />

            {/* Header with Back Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">Upload Video File</h3>
                <p className="text-sm text-muted-foreground">Add video content for your patients</p>
              </div>
            </div>

            {/* Upload Area */}
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

            {/* File Details Form */}
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
                <Button variant="outline" onClick={() => setActiveTab('manage')}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleUploadVideo}
                  disabled={isUploading || !uploadFormData.video.file}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Save
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="upload-pdf" className="mt-6">
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={pdfFileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfFileChange}
              className="hidden"
            />

            {/* Header with Back Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">Upload PDF Document</h3>
                <p className="text-sm text-muted-foreground">Add PDF content for your patients</p>
              </div>
            </div>

            {/* Upload Area */}
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

            {/* File Details Form */}
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
                <Button variant="outline" onClick={() => setActiveTab('manage')}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleUploadPdf}
                  disabled={isUploading || !uploadFormData.pdf.file}
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" size={16} className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Save
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="add-link" className="mt-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </div>

            {/* Link Type Selection */}
            <AnimatedCard className="p-6">
              <h4 className="font-semibold mb-4">Resource Type</h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg text-left hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Video className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold">YouTube Video</h5>
                      <p className="text-xs text-muted-foreground">Embed a YouTube video</p>
                    </div>
                  </div>
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold">External Link</h5>
                      <p className="text-xs text-muted-foreground">Link to any website</p>
                    </div>
                  </div>
                </button>
              </div>
            </AnimatedCard>

            {/* Link Input */}
            <AnimatedCard className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Resource URL</label>
                  <div className="relative">
                    <Input 
                      placeholder="Paste YouTube URL or website link (e.g., https://youtube.com/watch?v=...)"
                      className="pr-24"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
                    >
                      Fetch Info
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll automatically fetch the title, description, and thumbnail
                  </p>
                </div>

                {/* Preview Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Preview will appear here after entering URL
                  </p>
                </div>
              </div>
            </AnimatedCard>

            {/* Resource Details */}
            <AnimatedCard className="p-6">
              <h4 className="font-semibold mb-4">Resource Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input placeholder="Resource title (auto-filled from URL)" />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can edit this if needed
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea 
                    rows={4}
                    placeholder="Resource description (auto-filled from URL or add your own)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="meditation">Meditation</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (if video)</label>
                    <Input placeholder="e.g., 12:30" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <Input placeholder="Add tags (separate with commas): mindfulness, breathing, relaxation..." />
                  <p className="text-xs text-muted-foreground mt-1">
                    Help patients discover this resource with relevant tags
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Make this resource public</p>
                      <p className="text-xs text-muted-foreground">Allow all patients to access this resource</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Tips */}
            <AnimatedCard className="p-6 bg-orange-50/50 border-orange-200">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold mb-2">Tips for Adding External Resources</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• YouTube videos will be embedded directly in the platform</li>
                    <li>• Verify the content is appropriate and helpful for patients</li>
                    <li>• Provide context in the description to help patients understand the value</li>
                    <li>• Use clear, descriptive titles and relevant tags</li>
                  </ul>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="bulk-upload" className="mt-6">
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={bulkFileInputRef}
              type="file"
              accept="audio/*,video/*,.pdf,.mp3,.wav,.m4a,.aac,.mp4,.mov,.avi,.mkv"
              onChange={handleBulkFilesChange}
              multiple
              className="hidden"
            />

            {/* Header with Back Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h3 className="text-xl font-semibold">Bulk Upload</h3>
                <p className="text-sm text-muted-foreground">Upload multiple files at once</p>
              </div>
            </div>

            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center hover:border-indigo-300 transition-colors">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-10 w-10 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Drop multiple files here</h4>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Drag and drop multiple files or click to browse. Files will be automatically categorized.
                </p>
                {uploadFormData.bulk.files.length > 0 && (
                  <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      {uploadFormData.bulk.files.length} file{uploadFormData.bulk.files.length > 1 ? 's' : ''} selected:
                    </p>
                    <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1 text-left">
                      {uploadFormData.bulk.files.map((file, index) => (
                        <li key={index} className="truncate">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleChooseBulkFiles} className="bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFormData.bulk.files.length > 0 ? 'Change Files' : 'Choose Multiple Files'}
                  </Button>
                  {uploadFormData.bulk.files.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadFormData(prev => ({ ...prev, bulk: { files: [] } }))}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Guidelines
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="create-article" className="mt-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('manage')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  Save Draft
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>

            {/* Article Editor */}
            <AnimatedCard className="overflow-hidden">
              <div className="space-y-6">
                {/* Cover Image Section */}
                <div className="relative bg-muted/30 border-b">
                  <div className="aspect-[21/9] flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Add Cover Image
                    </Button>
                  </div>
                </div>

                {/* Article Content */}
                <div className="px-8 py-6 space-y-8">
                  {/* Title */}
                  <div>
                    <Input 
                      placeholder="Article Title" 
                      className="text-4xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 pb-6 border-b">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mental-health">Mental Health</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="coping-strategies">Coping Strategies</SelectItem>
                          <SelectItem value="self-care">Self-Care</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="resources">Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Reading Time</label>
                      <Input placeholder="e.g., 5 min read" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Author</label>
                      <Input placeholder={user?.name || "Author name"} defaultValue={user?.name} />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Article Excerpt</label>
                    <Textarea 
                      placeholder="Write a compelling summary that will appear in previews and search results (150-200 characters recommended)..." 
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">This will be displayed in article previews and search results</p>
                  </div>

                  {/* Rich Text Editor Area */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Article Content</label>
                    
                    {/* Formatting Toolbar */}
                    <div className="border border-b-0 rounded-t-lg p-2 bg-muted/30 flex flex-wrap gap-1">
                      {/* Text Formatting */}
                      <div className="flex gap-1 pr-2 border-r">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bold">
                          <span className="font-bold text-sm">B</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Italic">
                          <span className="italic text-sm">I</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Underline">
                          <span className="underline text-sm">U</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Strikethrough">
                          <span className="line-through text-sm">S</span>
                        </Button>
                      </div>

                      {/* Headings */}
                      <div className="flex gap-1 pr-2 border-r">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Heading 1">
                          H1
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Heading 2">
                          H2
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Heading 3">
                          H3
                        </Button>
                      </div>

                      {/* Lists */}
                      <div className="flex gap-1 pr-2 border-r">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bullet List">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Numbered List">
                          <span className="text-xs font-semibold">1.</span>
                        </Button>
                      </div>

                      {/* Alignment */}
                      <div className="flex gap-1 pr-2 border-r">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align Left">
                          <span className="text-xs">⊣</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align Center">
                          <span className="text-xs">≡</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align Right">
                          <span className="text-xs">⊢</span>
                        </Button>
                      </div>

                      {/* Insert Elements */}
                      <div className="flex gap-1 pr-2 border-r">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Image">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Quote">
                          <span className="text-sm">"</span>
                        </Button>
                      </div>

                      {/* Additional Tools */}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Code Block">
                          <span className="text-xs font-mono">{'<>'}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Horizontal Rule">
                          <span className="text-xs">—</span>
                        </Button>
                      </div>

                      <div className="ml-auto flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Undo">
                          ↶
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Redo">
                          ↷
                        </Button>
                      </div>
                    </div>

                    {/* Editor Content Area */}
                    <div className="border rounded-b-lg min-h-[500px] bg-background">
                      <Textarea 
                        placeholder="Start writing your article here...

You can include:
• Personal stories and experiences
• Evidence-based information
• Practical tips and advice
• Step-by-step guides
• Resources and references

Remember to:
- Use clear, accessible language
- Break content into sections with headings
- Include examples where helpful
- Cite sources for medical/clinical information
                        "
                        rows={24}
                        className="border-0 rounded-t-none resize-none focus-visible:ring-0 text-base leading-relaxed p-6"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Rich text formatting enabled
                        </span>
                        <span>•</span>
                        <span>Supports Markdown</span>
                        <span>•</span>
                        <span className="text-muted-foreground/60">0 words</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input 
                      placeholder="Add tags (separate with commas): mental health, wellness, self-care..." 
                      className="mb-1"
                    />
                    <p className="text-xs text-muted-foreground">Help patients find relevant content with descriptive tags</p>
                  </div>

                  {/* Advanced Settings */}
                  <div className="pt-6 border-t">
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium mb-4">
                        <Settings className="h-4 w-4" />
                        Advanced Settings
                      </summary>
                      <div className="space-y-4 pl-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Allow Comments</p>
                            <p className="text-xs text-muted-foreground">Enable patients to comment on this article</p>
                          </div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Featured Article</p>
                            <p className="text-xs text-muted-foreground">Show this article prominently in the library</p>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">SEO Description</label>
                          <Textarea 
                            placeholder="Optional: Custom description for search engines..." 
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Writing Tips Sidebar */}
            <AnimatedCard className="p-6 bg-muted/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-green-600" />
                Writing Tips
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use a clear, engaging title that accurately reflects the content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Write in an accessible, compassionate tone appropriate for patients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Break up long sections with subheadings for better readability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Include practical, actionable advice when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Cite credible sources for medical or clinical information</span>
                </li>
              </ul>
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
          onDownload={(r: any) => handleDownloadResource(selectedResource)}
          onShare={(r: any) => handleShareResource(selectedResource)}
          onBookmark={(r: any) => handleBookmarkResource(selectedResource)}
          onViewArticle={(r: any) => handleViewArticle(selectedResource)}
        />
      )}

      {/* Resource Edit Modal */}
      {editingResource && (
        <ResourceEditModal
          resource={convertToUIResource(editingResource)}
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveResource}
          onDelete={(resourceId: string) => handleDeleteResource(resourceId)}
          onCreateArticle={handleCreateArticle}
        />
      )}

      {/* Article Editor */}
      {editingArticle && (
        <ArticleEditor
          article={editingArticle ? convertToUIResource(editingArticle) : null}
          isOpen={isArticleEditorOpen}
          onClose={handleCloseArticleEditor}
          onSave={handleSaveArticle as any}
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
          onShare={(a: any) => handleShareResource(viewingArticle)}
          onBookmark={(a: any) => handleBookmarkResource(viewingArticle)}
          onDownload={(a: any) => handleDownloadResource(viewingArticle)}
        />
      )}
    </div>
  );
}