'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { ArticleViewerV2 } from '../../../../components/viewers/article-viewer-v2';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
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
  X,
  ExternalLink,
  Copy,
  Archive,
  Settings,
  AlertCircle,
  Plus,
  List
} from 'lucide-react';
import { Resource } from '@/lib/api/resources';
import { useResources } from '../../../../hooks/useResources';
import { useResourceViewer } from '../../../../hooks/useResourceViewer';
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
  const [reviewTab, setReviewTab] = useState<'review' | 'published' | 'rejected'>('review');
  
  // Load all resources (admin can see all)
  const { resources, loading, updateResource, deleteResource, createResourceWithFile, createResource, refreshResources } = useResources();
  
  // Modal states
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'upload-audio' | 'upload-video' | 'upload-pdf' | 'upload-article'>('review');
  
  // Use shared resource viewer hook for consistent behavior
  const {
    selectedResource,
    viewingArticle,
    isViewerOpen,
    isArticleViewerOpen,
    handleViewResource,
    handleCloseViewer,
    handleCloseArticleViewer,
    setViewingArticle,
    setIsArticleViewerOpen,
  } = useResourceViewer(false); // Admin doesn't track views
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  
  // File input refs
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const articleImageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const draggedImageRef = useRef<HTMLElement | null>(null);
  
  // Upload form state
  const [uploadFormData, setUploadFormData] = useState<{
    audio: { file: File | null; title: string; description: string; tags: string; duration: string };
    video: { file: File | null; title: string; description: string; tags: string; duration: string; isYouTube: boolean; youtubeUrl: string };
    pdf: { file: File | null; title: string; description: string; tags: string };
    externalLink: { url: string; title: string; description: string; tags: string; category: string; duration: string; isYouTube: boolean };
  }>({
    audio: { file: null, title: '', description: '', tags: '', duration: '' },
    video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
    pdf: { file: null, title: '', description: '', tags: '' },
    externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
  });
  
  // External link preview state
  const [linkPreview, setLinkPreview] = useState<{
    title?: string;
    description?: string;
    thumbnail?: string;
    loading: boolean;
  }>({ loading: false });

  // Article editor state
  const [coverImage, setCoverImage] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  
  // Embed dialog state
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Article editor form state
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    readingTime: '',
    author: '',
    tags: '',
  });

  // Track active formatting states
  const [activeFormatting, setActiveFormatting] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    heading: 'h1' | 'h2' | 'h3' | null;
    list: 'ordered' | 'unordered' | null;
    align: 'left' | 'center' | 'right' | null;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    heading: null,
    list: null,
    align: null,
  });

  // Advanced article settings
  const [articleSettings, setArticleSettings] = useState({
    allowComments: true,
    featuredArticle: false,
    seoDescription: '',
  });

  // Preview state
  const [previewArticle, setPreviewArticle] = useState<Resource | null>(null);

  // Track which draft/article is being edited
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  
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
    // Filter out training resources (admin-created resources don't need review)
    const counselorResources = resources.filter((resource) => !resource.isTrainingResource);
    const total = counselorResources.length;
    const published = counselorResources.filter((resource) => resource.isPublic).length;
    const privateCount = total - published;
    const totalViews = counselorResources.reduce((sum, resource) => sum + (resource.views ?? 0), 0);
    const totalDownloads = counselorResources.reduce(
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
      // Exclude training resources (admin-created resources don't need review)
      if (resource.isTrainingResource) {
        return false;
      }
      
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (resource.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (resource.publisher?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'public' && resource.isPublic) ||
                           (statusFilter === 'private' && !resource.isPublic);
      // Filter by review status based on active tab
      const matchesReviewStatus = reviewTab === 'review'
        ? (resource.status === 'pending_review' || !resource.status)
        : reviewTab === 'published'
        ? (resource.status === 'published')
        : reviewTab === 'rejected'
        ? (resource.status === 'rejected')
        : false;
      
      return matchesSearch && matchesType && matchesStatus && matchesReviewStatus;
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
  }, [resources, searchTerm, selectedType, statusFilter, sortBy, sortOrder, reviewTab]);

  // Resource viewing is now handled by useResourceViewer hook

  const handleEditResource = (resource: Resource) => {
    // For articles, switch to article editor tab
    if (resource.type === 'article') {
      setEditingResource(resource);
      // Load article data into form
      setArticleFormData({
        title: resource.title,
        excerpt: resource.description || '',
        content: resource.content || '',
        category: resource.category || '',
        readingTime: resource.readingTime || '',
        author: resource.publisherName || user?.name || '',
        tags: resource.tags.join(', '),
      });
      if (resource.thumbnail) {
        setCoverImage({ file: null, preview: resource.thumbnail });
      }
      setEditingDraftId(resource.id);
      setActiveTab('upload-article');
    } else {
      // For other resource types, switch to appropriate tab and set editing resource
      setEditingResource(resource);
      // Set the appropriate form data based on resource type
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

  const handleChooseCoverImage = () => {
    coverImageInputRef.current?.click();
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
        setActiveTab('review');
        await refreshResources();
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
        // Tab removed - admin only views resources
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
        setActiveTab('review');
        await refreshResources();
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
        // Tab removed - admin only views resources
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
        setActiveTab('review');
        await refreshResources();
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
        // Tab removed - admin only views resources
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

  const handleSaveDraft = async () => {
    if (!articleFormData.title.trim()) {
      toast.error('Please enter an article title');
      return;
    }

    try {
      // Get the latest content directly from the contentEditable div
      const currentContent = articleContentRef.current?.innerHTML || articleFormData.content || '';
      
      // Ensure content is not just empty tags
      const cleanedContent = currentContent.trim() === '<br>' || currentContent.trim() === '' ? '' : currentContent;
      
      const tags = articleFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Upload cover image if a new file was selected
      let thumbnailUrl: string | undefined = undefined;
      if (coverImage.file) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (!supabase) {
          throw new Error('Supabase is not configured');
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('User not authenticated');
        }

        const fileExt = coverImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${authUser.id}-cover-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, coverImage.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrl;
      } else if (coverImage.preview && coverImage.preview.startsWith('http')) {
        // Use existing URL if it's already a URL (from loaded draft)
        thumbnailUrl = coverImage.preview;
      }

      const resourceData = {
        title: articleFormData.title,
        description: articleFormData.excerpt || articleFormData.title,
        type: 'article' as const,
        content: cleanedContent,
        category: articleFormData.category || undefined,
        tags,
        isPublic: false, // Draft is not public
        thumbnail: thumbnailUrl,
        readingTime: articleFormData.readingTime || undefined,
        publisherName: articleFormData.author || user?.name || 'Unknown',
      };

      // Update existing draft or create new one
      if (editingDraftId) {
        await updateResource(editingDraftId, resourceData);
        toast.success('Draft updated successfully');
      } else {
        await createResource(resourceData);
        toast.success('Draft saved successfully');
      }
      
      // Update state with the saved content
      setArticleFormData(prev => ({ ...prev, content: currentContent }));
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    }
  };

  const handlePublishArticle = async () => {
    if (!articleFormData.title.trim()) {
      toast.error('Please enter an article title');
      return;
    }

    // Get the latest content directly from the contentEditable div
    const currentContent = articleContentRef.current?.innerHTML || articleFormData.content || '';
    
    // Ensure content is not just empty tags
    const cleanedContent = currentContent.trim() === '<br>' || currentContent.trim() === '' ? '' : currentContent;
    
    if (!cleanedContent.trim()) {
      toast.error('Please add article content');
      return;
    }

    try {
      const tags = articleFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Upload cover image if a new file was selected
      let thumbnailUrl: string | undefined = undefined;
      if (coverImage.file) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (!supabase) {
          throw new Error('Supabase is not configured');
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('User not authenticated');
        }

        const fileExt = coverImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${authUser.id}-cover-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, coverImage.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrl;
      } else if (coverImage.preview && coverImage.preview.startsWith('http')) {
        // Use existing URL if it's already a URL (from loaded draft)
        thumbnailUrl = coverImage.preview;
      }

      const resourceData = {
        title: articleFormData.title,
        description: articleFormData.excerpt || articleFormData.title,
        type: 'article' as const,
        content: cleanedContent,
        category: articleFormData.category || undefined,
        tags,
        isPublic: true, // Published articles are public
        thumbnail: thumbnailUrl,
        readingTime: articleFormData.readingTime || undefined,
        publisherName: articleFormData.author || user?.name || 'Unknown',
      };

      // Update existing draft or create new one
      if (editingDraftId) {
        await updateResource(editingDraftId, resourceData);
        toast.success('Article published successfully');
      } else {
        await createResource(resourceData);
        toast.success('Article published successfully');
      }
      
      // Reset form
      setArticleFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        readingTime: '',
        author: '',
        tags: '',
      });
      if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImage.preview);
      }
      setCoverImage({ file: null, preview: null });
      setArticleSettings({
        allowComments: true,
        featuredArticle: false,
        seoDescription: '',
      });
      setEditingDraftId(null);
      // Tab removed - admin only views resources
      await refreshResources();
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish article');
    }
  };

  const handleSaveArticle = async () => {
    if (!articleFormData.title.trim()) {
      toast.error('Please enter an article title');
      return;
    }

    try {
      // Get the latest content directly from the contentEditable div
      const currentContent = articleContentRef.current?.innerHTML || articleFormData.content || '';
      
      // Ensure content is not just empty tags
      const cleanedContent = currentContent.trim() === '<br>' || currentContent.trim() === '' ? '' : currentContent;
      
      const tags = articleFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Upload cover image if a new file was selected
      let thumbnailUrl: string | undefined = undefined;
      if (coverImage.file) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (!supabase) {
          throw new Error('Supabase is not configured');
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('User not authenticated');
        }

        const fileExt = coverImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${authUser.id}-cover-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, coverImage.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrl;
      } else if (coverImage.preview && coverImage.preview.startsWith('http')) {
        // Use existing URL if it's already a URL (from loaded article)
        thumbnailUrl = coverImage.preview;
      }

      const resourceData = {
        title: articleFormData.title,
        description: articleFormData.excerpt || articleFormData.title,
        type: 'article' as const,
        content: cleanedContent,
        category: articleFormData.category || undefined,
        tags,
        thumbnail: thumbnailUrl,
        readingTime: articleFormData.readingTime || undefined,
        publisherName: articleFormData.author || user?.name || 'Unknown',
        // Preserve the current status if editing an existing article
        ...(editingResource && editingResource.status ? { status: editingResource.status } : {}),
        ...(editingResource && editingResource.isPublic !== undefined ? { isPublic: editingResource.isPublic } : {}),
      };

      // Update existing article or create new one
      if (editingDraftId && editingResource) {
        await updateResource(editingDraftId, resourceData);
        toast.success('Article updated successfully');
      } else {
        await createResource(resourceData);
        toast.success('Article created successfully');
      }
      
      // Reset form and switch back to review tab
      setArticleFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        readingTime: '',
        author: '',
        tags: '',
      });
      if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImage.preview);
      }
      setCoverImage({ file: null, preview: null });
      setEditingDraftId(null);
      setEditingResource(null);
      setActiveTab('review');
      await refreshResources();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save article');
    }
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPEG, PNG, WebP, etc.)');
        if (event.target) {
          event.target.value = '';
        }
        return;
      }

      // Validate file size (10MB limit for cover images)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        toast.error(
          `Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 10MB. ` +
          `Please compress your image or choose a smaller file.`
        );
        if (event.target) {
          event.target.value = '';
        }
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setCoverImage({ file, preview });
      toast.success('Cover image selected');
    }
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handlePreviewArticle = () => {
    if (!articleFormData.title.trim()) {
      toast.error('Please enter an article title to preview');
      return;
    }
    
    // Get the latest content directly from the contentEditable div
    const currentContent = articleContentRef.current?.innerHTML || articleFormData.content || '';
    
    // Create a preview article object
    const preview: Resource = {
      id: 'preview',
      title: articleFormData.title,
      description: articleFormData.excerpt || articleFormData.title,
      type: 'article',
      content: currentContent,
      category: articleFormData.category,
      tags: articleFormData.tags.split(',').map(t => t.trim()).filter(t => t),
      isPublic: true,
      publisher: user?.id || '',
      publisherName: articleFormData.author || user?.name || 'Unknown',
      thumbnail: coverImage.preview || undefined,
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setPreviewArticle(preview);
    setIsArticleViewerOpen(true);
  };

  // Function to make existing images interactive (draggable and deletable)
  const makeImagesInteractive = useCallback(() => {
    if (!articleContentRef.current) return;
    
    const images = articleContentRef.current.querySelectorAll('img:not(.article-image-container img)');
    images.forEach((img) => {
      // Skip if already wrapped
      if (img.parentElement?.classList.contains('article-image-container')) return;
      
      // Create container
      const container = document.createElement('div');
      container.className = 'article-image-container';
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.width = '100%';
      container.style.maxWidth = '100%';
      container.style.margin = '1rem 0';
      container.setAttribute('draggable', 'true');
      container.setAttribute('contenteditable', 'false');
      
      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '×';
      deleteBtn.className = 'article-image-delete';
      deleteBtn.setAttribute('type', 'button');
      deleteBtn.setAttribute('contenteditable', 'false');
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.remove();
        const content = articleContentRef.current?.innerHTML || '';
        setArticleFormData(prev => ({ ...prev, content }));
      };
      
      // Set image styles
      (img as HTMLImageElement).style.maxWidth = '100%';
      (img as HTMLImageElement).style.height = 'auto';
      (img as HTMLImageElement).style.display = 'block';
      (img as HTMLImageElement).style.borderRadius = '0.5rem';
      (img as HTMLImageElement).style.margin = '0';
      img.setAttribute('draggable', 'false');
      img.setAttribute('contenteditable', 'false');
      
      // Add drag handlers
      container.ondragstart = (e) => {
        draggedImageRef.current = container;
        e.dataTransfer?.setData('text/plain', '');
        e.dataTransfer!.effectAllowed = 'move';
        container.style.opacity = '0.5';
        container.style.cursor = 'grabbing';
      };
      
      container.ondragend = () => {
        if (draggedImageRef.current) {
          draggedImageRef.current.style.opacity = '1';
          draggedImageRef.current.style.cursor = 'move';
          draggedImageRef.current = null;
        }
      };
      
      // Wrap image
      img.parentNode?.insertBefore(container, img);
      container.appendChild(img);
      container.appendChild(deleteBtn);
    });
  }, []);

  // Update active formatting states based on cursor position
  const updateActiveFormatting = useCallback(() => {
    if (!articleContentRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;

    // If it's a text node, get the parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement || node;
    }

    // Find the containing element
    let element = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : (node as Node).parentElement;
    
    if (!element) return;

    // Check formatting states
    const isBold = document.queryCommandState('bold') || 
                   element.closest('strong, b') !== null ||
                   window.getComputedStyle(element).fontWeight === '700' ||
                   parseInt(window.getComputedStyle(element).fontWeight) >= 700;
    
    const isItalic = document.queryCommandState('italic') || 
                     element.closest('em, i') !== null ||
                     window.getComputedStyle(element).fontStyle === 'italic';
    
    const isUnderline = document.queryCommandState('underline') || 
                        element.closest('u') !== null ||
                        window.getComputedStyle(element).textDecoration?.includes('underline');
    
    const isStrikethrough = document.queryCommandState('strikeThrough') || 
                            element.closest('s, strike, del') !== null ||
                            window.getComputedStyle(element).textDecoration?.includes('line-through');

    // Check heading
    let heading: 'h1' | 'h2' | 'h3' | null = null;
    const headingElement = element.closest('h1, h2, h3');
    if (headingElement) {
      const tagName = headingElement.tagName.toLowerCase();
      if (tagName === 'h1') heading = 'h1';
      else if (tagName === 'h2') heading = 'h2';
      else if (tagName === 'h3') heading = 'h3';
    }

    // Check list
    let list: 'ordered' | 'unordered' | null = null;
    const listElement = element.closest('ul, ol, li');
    if (listElement) {
      if (listElement.tagName.toLowerCase() === 'ol' || listElement.closest('ol')) {
        list = 'ordered';
      } else if (listElement.tagName.toLowerCase() === 'ul' || listElement.closest('ul')) {
        list = 'unordered';
      }
    }

    // Check alignment
    let align: 'left' | 'center' | 'right' | null = null;
    const textAlign = window.getComputedStyle(element).textAlign;
    if (textAlign === 'center') align = 'center';
    else if (textAlign === 'right') align = 'right';
    else if (textAlign === 'left' || textAlign === 'start') align = 'left';

    setActiveFormatting({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      strikethrough: isStrikethrough,
      heading,
      list,
      align,
    });
  }, []);

  // Clean up cover image preview URL and reset form when switching away from article editor
  // Cleanup article form data when not editing (admin doesn't create articles)
  useEffect(() => {
    if (!editingDraftId) {
      if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImage.preview);
      }
      setCoverImage({ file: null, preview: null });
      setArticleFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        readingTime: '',
        author: '',
        tags: '',
      });
    }
  }, [editingDraftId]);

  // Initialize and sync contentEditable with state (only when editing article)
  useEffect(() => {
    if (!editingDraftId) return;
    
    const timeoutId = setTimeout(() => {
      if (articleContentRef.current) {
        const currentContent = articleContentRef.current.innerHTML.trim();
        const stateContent = articleFormData.content || '';
        
        if (stateContent && (!currentContent || currentContent === '<br>' || currentContent === '')) {
          articleContentRef.current.innerHTML = stateContent;
          setTimeout(() => makeImagesInteractive(), 50);
        } else if (stateContent && currentContent !== stateContent) {
          if (document.activeElement !== articleContentRef.current) {
            articleContentRef.current.innerHTML = stateContent;
            setTimeout(() => makeImagesInteractive(), 50);
          }
        } else if (!stateContent && (!currentContent || currentContent === '<br>')) {
          articleContentRef.current.innerHTML = '<br>';
          articleContentRef.current.setAttribute('contenteditable', 'true');
        } else {
          makeImagesInteractive();
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [articleFormData.content, editingDraftId, makeImagesInteractive]);

  // Update formatting states on selection change (only when editing article)
  useEffect(() => {
    if (!editingDraftId) return;

    const handleSelectionChange = () => {
      if (articleContentRef.current && document.activeElement === articleContentRef.current) {
        updateActiveFormatting();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    if (articleContentRef.current) {
      articleContentRef.current.addEventListener('keyup', updateActiveFormatting);
      articleContentRef.current.addEventListener('mouseup', updateActiveFormatting);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (articleContentRef.current) {
        articleContentRef.current.removeEventListener('keyup', updateActiveFormatting);
        articleContentRef.current.removeEventListener('mouseup', updateActiveFormatting);
      }
    };
  }, [editingDraftId, updateActiveFormatting]);

  // Formatting handlers for article editor
  const handleFormatCommand = (command: string, value?: string) => {
    if (!articleContentRef.current) return;
    
    articleContentRef.current.focus();
    
    if (!articleContentRef.current.innerHTML.trim()) {
      articleContentRef.current.innerHTML = '<br>';
    }
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(articleContentRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setTimeout(() => {
      if (articleContentRef.current) {
        try {
          const success = document.execCommand(command, false, value);
          if (!success && selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
              const selectedText = range.toString();
              if (command === 'bold') {
                const strong = document.createElement('strong');
                strong.textContent = selectedText;
                range.deleteContents();
                range.insertNode(strong);
              } else if (command === 'italic') {
                const em = document.createElement('em');
                em.textContent = selectedText;
                range.deleteContents();
                range.insertNode(em);
              }
            }
          }
          
          const content = articleContentRef.current.innerHTML;
          setArticleFormData(prev => ({ ...prev, content }));
          articleContentRef.current.focus();
        } catch (error) {
          console.error(`Error executing command ${command}:`, error);
        }
      }
    }, 50);
  };

  const handleFormatHeading = (level: number) => {
    if (!articleContentRef.current) return;
    articleContentRef.current.focus();
    setTimeout(() => {
      if (articleContentRef.current) {
        document.execCommand('formatBlock', false, `h${level}`);
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  const handleInsertList = (ordered: boolean) => {
    if (!articleContentRef.current) return;
    articleContentRef.current.focus();
    setTimeout(() => {
      if (articleContentRef.current) {
        const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
        document.execCommand(command, false);
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  const handleUndo = () => {
    articleContentRef.current?.focus();
    document.execCommand('undo', false);
    if (articleContentRef.current) {
      const content = articleContentRef.current.innerHTML;
      setArticleFormData(prev => ({ ...prev, content }));
    }
  };

  const handleRedo = () => {
    articleContentRef.current?.focus();
    document.execCommand('redo', false);
    if (articleContentRef.current) {
      const content = articleContentRef.current.innerHTML;
      setArticleFormData(prev => ({ ...prev, content }));
    }
  };

  const handleAlignText = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!articleContentRef.current) return;
    articleContentRef.current.focus();
    setTimeout(() => {
      if (articleContentRef.current) {
        let command = 'justifyLeft';
        if (alignment === 'center') command = 'justifyCenter';
        else if (alignment === 'right') command = 'justifyRight';
        else if (alignment === 'justify') command = 'justifyFull';
        document.execCommand(command, false);
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  const handleInsertLink = () => {
    if (!articleContentRef.current) return;
    setLinkUrl('');
    setShowLinkDialog(true);
  };

  const handleConfirmLink = () => {
    if (!linkUrl.trim() || !articleContentRef.current) return;
    try {
      new URL(linkUrl.trim());
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    articleContentRef.current.focus();
    setTimeout(() => {
      if (articleContentRef.current) {
        document.execCommand('createLink', false, linkUrl.trim());
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
        setShowLinkDialog(false);
        setLinkUrl('');
        toast.success('Link inserted successfully');
      }
    }, 10);
  };

  const handleInsertImage = () => {
    if (!articleContentRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (articleContentRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
    articleImageInputRef.current?.click();
  };

  const handleArticleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      if (event.target) event.target.value = '';
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      toast.error(`Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 10MB.`);
      if (event.target) event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase is not configured');

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${authUser.id}-article-image-${Date.now()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      if (articleContentRef.current) {
        articleContentRef.current.focus();
        let range: Range | null = null;
        const selection = window.getSelection();
        
        if (savedSelectionRef.current) {
          try {
            const savedRange = savedSelectionRef.current;
            if (articleContentRef.current.contains(savedRange.commonAncestorContainer)) {
              range = savedRange;
            }
          } catch (e) {
            console.log('Saved range is invalid, using current selection');
          }
          savedSelectionRef.current = null;
        }
        
        if (!range && selection && selection.rangeCount > 0) {
          const currentRange = selection.getRangeAt(0);
          if (articleContentRef.current.contains(currentRange.commonAncestorContainer)) {
            range = currentRange;
          }
        }
        
        if (!range) {
          range = document.createRange();
          if (articleContentRef.current.childNodes.length > 0) {
            const lastNode = articleContentRef.current.childNodes[articleContentRef.current.childNodes.length - 1];
            if (lastNode) {
              range.setStartAfter(lastNode);
            } else {
              range.selectNodeContents(articleContentRef.current);
              range.collapse(false);
            }
          } else {
            range.selectNodeContents(articleContentRef.current);
            range.collapse(false);
          }
        }
        
        const container = document.createElement('div');
        container.className = 'article-image-container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.width = '100%';
        container.style.maxWidth = '100%';
        container.style.margin = '1rem 0';
        container.setAttribute('draggable', 'true');
        container.setAttribute('contenteditable', 'false');
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.className = 'article-image-delete';
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.setAttribute('contenteditable', 'false');
        deleteBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.remove();
          const content = articleContentRef.current?.innerHTML || '';
          setArticleFormData(prev => ({ ...prev, content }));
        };
        
        container.onmouseenter = () => { deleteBtn.style.opacity = '1'; };
        container.onmouseleave = () => { deleteBtn.style.opacity = '0'; };
        
        const img = document.createElement('img');
        img.src = publicUrl;
        img.alt = file.name;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.borderRadius = '0.5rem';
        img.setAttribute('draggable', 'false');
        img.setAttribute('contenteditable', 'false');
        
        container.ondragstart = (e) => {
          draggedImageRef.current = container;
          e.dataTransfer?.setData('text/plain', '');
          e.dataTransfer!.effectAllowed = 'move';
          container.style.opacity = '0.5';
          container.style.cursor = 'grabbing';
        };
        
        container.ondragend = () => {
          if (draggedImageRef.current) {
            draggedImageRef.current.style.opacity = '1';
            draggedImageRef.current.style.cursor = 'move';
            draggedImageRef.current = null;
          }
        };
        
        container.appendChild(img);
        container.appendChild(deleteBtn);
        range.insertNode(container);
        
        const br = document.createElement('br');
        range.setStartAfter(container);
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }

      toast.success('Image inserted successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleInsertEmbed = () => {
    if (!articleContentRef.current) return;
    setEmbedUrl('');
    setShowEmbedDialog(true);
  };

  const convertToEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = '';
        if (hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v') || '';
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (hostname.includes('vimeo.com')) {
        const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }

      if (hostname.includes('soundcloud.com')) {
        const soundcloudUrl = urlObj.toString();
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      }

      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return url;
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleConfirmEmbed = () => {
    if (!embedUrl.trim()) {
      toast.error('Please enter an embed URL');
      return;
    }

    if (!articleContentRef.current) return;
    
    try {
      const convertedUrl = convertToEmbedUrl(embedUrl.trim());
      if (!convertedUrl) {
        toast.error('Invalid embed URL. Please enter a valid YouTube, Vimeo, SoundCloud, or other supported platform URL.');
        return;
      }

      articleContentRef.current.focus();
      
      setTimeout(() => {
        if (!articleContentRef.current) return;
        
        const selection = window.getSelection();
        const isSoundCloud = embedUrl.toLowerCase().includes('soundcloud.com');
        const paddingBottom = isSoundCloud ? '166px' : '56.25%';
        const minHeight = isSoundCloud ? '166px' : '0';
        const iframeHeight = isSoundCloud ? '166px' : '100%';
        
        const container = document.createElement('div');
        container.setAttribute('data-embed', 'true');
        container.setAttribute('style', `position: relative; width: 100%; max-width: 100%; margin: 1rem 0; padding-bottom: ${paddingBottom}; height: ${minHeight}; overflow: hidden; border-radius: 0.5rem; min-height: ${isSoundCloud ? '166px' : '200px'};`);
        
        const iframe = document.createElement('iframe');
        iframe.src = convertedUrl;
        iframe.setAttribute('style', `position: absolute; top: 0; left: 0; width: 100%; height: ${iframeHeight}; border: none;`);
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        
        container.appendChild(iframe);
        
        let range: Range | null = null;
        
        if (selection && selection.rangeCount > 0) {
          const currentRange = selection.getRangeAt(0);
          if (articleContentRef.current.contains(currentRange.commonAncestorContainer)) {
            range = currentRange;
          }
        }
        
        if (!range) {
          range = document.createRange();
          if (articleContentRef.current.childNodes.length > 0) {
            const lastNode = articleContentRef.current.childNodes[articleContentRef.current.childNodes.length - 1];
            if (lastNode) {
              range.setStartAfter(lastNode);
            } else {
              range.selectNodeContents(articleContentRef.current);
              range.collapse(false);
            }
          } else {
            range.selectNodeContents(articleContentRef.current);
            range.collapse(false);
          }
        }
        
        range.insertNode(container);
        
        const br = document.createElement('br');
        range.setStartAfter(container);
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
        
        setShowEmbedDialog(false);
        setEmbedUrl('');
        toast.success('Embed inserted successfully');
      }, 10);
    } catch (error) {
      console.error('Error inserting embed:', error);
      toast.error('Failed to insert embed');
    }
  };

  const handleInsertQuote = () => {
    articleContentRef.current?.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '4px solid currentColor';
      blockquote.style.paddingLeft = '1rem';
      blockquote.style.margin = '1rem 0';
      blockquote.style.fontStyle = 'italic';
      blockquote.style.color = 'inherit';
      
      if (range.collapsed) {
        blockquote.innerHTML = '<br>';
      } else {
        blockquote.appendChild(range.extractContents());
      }
      
      range.insertNode(blockquote);
      range.setStartAfter(blockquote);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (articleContentRef.current) {
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
      }
    }
  };

  const handleInsertCodeBlock = () => {
    articleContentRef.current?.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.style.color = 'inherit';
      code.style.backgroundColor = 'transparent';
      
      if (range.collapsed) {
        code.innerHTML = '<br>';
      } else {
        code.appendChild(range.extractContents());
      }
      
      pre.appendChild(code);
      range.insertNode(pre);
      range.setStartAfter(pre);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (articleContentRef.current) {
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
      }
    }
  };

  const handleInsertHorizontalRule = () => {
    if (!articleContentRef.current) return;
    articleContentRef.current.focus();
    setTimeout(() => {
      if (articleContentRef.current) {
        document.execCommand('insertHorizontalRule', false);
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  const handleReviewStatusChange = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) {
        toast.error('Resource not found');
        return;
      }
      
      let newStatus: 'pending_review' | 'reviewed' | 'published';
      let successMessage: string;
      
      // Cycle through statuses: pending_review -> reviewed -> published -> reviewed
      if (resource.status === 'pending_review' || !resource.status) {
        newStatus = 'reviewed';
        successMessage = 'Resource marked as reviewed!';
      } else if (resource.status === 'reviewed') {
        newStatus = 'published';
        successMessage = 'Resource published successfully!';
      } else {
        // published -> reviewed
        newStatus = 'reviewed';
        successMessage = 'Resource unpublished successfully!';
      }
      
      await updateResource(resourceId, { status: newStatus });
      toast.success(successMessage);
      await refreshResources();
    } catch (error) {
      console.error('Error updating resource status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resource status. Please try again.');
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

  // Helper function to fetch YouTube video info for video upload form
  const handleFetchYouTubeVideoInfo = async () => {
    const url = uploadFormData.video.youtubeUrl.trim();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    // Check if it's a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYouTube) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    try {
      // Extract video ID
      let videoId = '';
      if (url.includes('youtu.be')) {
        videoId = url.split('/').pop()?.split('?')[0] || '';
      } else {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      }

      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Fetch YouTube video metadata using oEmbed
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube video information');
      }

      const data = await response.json();
      
      // Try to fetch additional metadata from YouTube Data API if available
      let duration = '';
      let fullDescription = '';
      let videoTags: string[] = [];
      const youtubeApiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      
      if (youtubeApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet,statistics&key=${youtubeApiKey}`;
          const apiResponse = await fetch(apiUrl);
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            if (apiData.items && apiData.items[0]) {
              const video = apiData.items[0];
              
              // Get duration
              if (video.contentDetails?.duration) {
                duration = convertISODurationToTime(video.contentDetails.duration);
              }
              
              // Get full description
              if (video.snippet?.description) {
                fullDescription = video.snippet.description;
              }
              
              // Get video tags
              if (video.snippet?.tags && Array.isArray(video.snippet.tags)) {
                videoTags = video.snippet.tags.slice(0, 10);
              }
            }
          }
        } catch (apiError) {
          console.warn('Failed to fetch additional data from YouTube API:', apiError);
        }
      }
      
      // Auto-fill form with fetched data
      setUploadFormData(prev => ({
        ...prev,
        video: {
          ...prev.video,
          title: data.title || prev.video.title,
          description: fullDescription || prev.video.description,
          duration: duration || prev.video.duration,
          tags: videoTags.length > 0 ? videoTags.join(', ') : prev.video.tags,
          isYouTube: true,
          youtubeUrl: url,
        },
      }));
      
      toast.success('YouTube video information fetched successfully');
    } catch (error) {
      console.error('Error fetching YouTube video info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch YouTube video information');
    }
  };

  // Helper function to convert ISO 8601 duration to MM:SS or HH:MM:SS format
  const convertISODurationToTime = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // External link handlers
  const handleFetchLinkInfo = async () => {
    const url = uploadFormData.externalLink.url.trim();
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLinkPreview({ loading: true });

    try {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      if (isYouTube) {
        let videoId = '';
        if (url.includes('youtu.be')) {
          videoId = url.split('/').pop()?.split('?')[0] || '';
        } else {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v') || '';
        }

        if (videoId) {
          const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const response = await fetch(oEmbedUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            let duration = '';
            let fullDescription = '';
            let videoTags: string[] = [];
            let publishedAt = '';
            let channelTitle = '';
            let viewCount = '';
            const youtubeApiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
            if (youtubeApiKey) {
              try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet,statistics&key=${youtubeApiKey}`;
                const apiResponse = await fetch(apiUrl);
                if (apiResponse.ok) {
                  const apiData = await apiResponse.json();
                  if (apiData.items && apiData.items[0]) {
                    const video = apiData.items[0];
                    
                    if (video.contentDetails?.duration) {
                      duration = convertISODurationToTime(video.contentDetails.duration);
                    }
                    
                    if (video.snippet?.description) {
                      fullDescription = video.snippet.description;
                      if (fullDescription.length > 500) {
                        fullDescription = fullDescription.substring(0, 500) + '...';
                      }
                    }
                    
                    if (video.snippet?.tags && Array.isArray(video.snippet.tags)) {
                      videoTags = video.snippet.tags.slice(0, 10);
                    }
                    
                    if (video.snippet?.publishedAt) {
                      const date = new Date(video.snippet.publishedAt);
                      publishedAt = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }
                    
                    if (video.snippet?.channelTitle) {
                      channelTitle = video.snippet.channelTitle;
                    }
                    
                    if (video.statistics?.viewCount) {
                      const views = parseInt(video.statistics.viewCount, 10);
                      viewCount = views >= 1000000 
                        ? `${(views / 1000000).toFixed(1)}M views`
                        : views >= 1000
                        ? `${(views / 1000).toFixed(1)}K views`
                        : `${views} views`;
                    }
                  }
                }
              } catch (apiError) {
                console.warn('Failed to fetch additional data from YouTube API:', apiError);
              }
            }
            
            let descriptionParts: string[] = [];
            if (channelTitle) {
              descriptionParts.push(`By ${channelTitle}`);
            } else if (data.author_name) {
              descriptionParts.push(`By ${data.author_name}`);
            }
            if (publishedAt) {
              descriptionParts.push(`Published: ${publishedAt}`);
            }
            if (viewCount) {
              descriptionParts.push(viewCount);
            }
            
            const previewDescription = descriptionParts.length > 0 
              ? descriptionParts.join(' • ')
              : (fullDescription || (data.author_name ? `By ${data.author_name}` : ''));
            
            setLinkPreview({
              title: data.title,
              description: previewDescription,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              loading: false,
            });
            
            setUploadFormData(prev => ({
              ...prev,
              externalLink: {
                ...prev.externalLink,
                title: data.title || '',
                description: fullDescription || (channelTitle ? `By ${channelTitle}` : data.author_name ? `By ${data.author_name}` : ''),
                duration: duration,
                tags: videoTags.length > 0 ? videoTags.join(', ') : prev.externalLink.tags,
                isYouTube: true,
              },
            }));
            
            toast.success('Link information fetched successfully');
          } else {
            throw new Error('Failed to fetch YouTube video information');
          }
        } else {
          throw new Error('Invalid YouTube URL');
        }
      } else {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            const htmlContent = proxyData.contents;
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            const getMetaContent = (property: string, attribute: string = 'property') => {
              const meta = doc.querySelector(`meta[${attribute}="${property}"]`);
              return meta?.getAttribute('content') || '';
            };
            
            const ogTitle = getMetaContent('og:title') || doc.querySelector('title')?.textContent || '';
            const ogDescription = getMetaContent('og:description') || getMetaContent('description', 'name') || '';
            const ogImage = getMetaContent('og:image') || '';
            const ogSiteName = getMetaContent('og:site_name') || new URL(url).hostname;
            const ogType = getMetaContent('og:type') || '';
            const articleAuthor = getMetaContent('article:author', 'property') || getMetaContent('author', 'name') || '';
            
            const isArticle = ogType === 'article' || 
                             url.includes('/article/') || 
                             url.includes('/post/') || 
                             url.includes('/blog/') ||
                             url.includes('/news/');
            
            const articleTitle = ogTitle || new URL(url).hostname;
            const articleDescription = ogDescription || '';
            const articleThumbnail = ogImage || '';
            const articlePublisher = articleAuthor || ogSiteName || new URL(url).hostname;
            
            setLinkPreview({
              title: articleTitle,
              description: articleDescription || `From ${articlePublisher}`,
              thumbnail: articleThumbnail || undefined,
              loading: false,
            });
            
            setUploadFormData(prev => ({
              ...prev,
              externalLink: {
                ...prev.externalLink,
                title: articleTitle,
                description: articleDescription,
                isYouTube: false,
              },
            }));
            
            toast.success(isArticle ? 'Article metadata fetched successfully' : 'Link metadata fetched successfully');
          } else {
            throw new Error('Failed to fetch page metadata');
          }
        } catch (fetchError) {
          console.warn('Failed to fetch article metadata:', fetchError);
          const urlObj = new URL(url);
          const isArticle = url.includes('/article/') || 
                          url.includes('/post/') || 
                          url.includes('/blog/') ||
                          url.includes('/news/');
          
          setLinkPreview({
            title: urlObj.hostname,
            description: '',
            thumbnail: undefined,
            loading: false,
          });
          
          setUploadFormData(prev => ({
            ...prev,
            externalLink: {
              ...prev.externalLink,
              title: urlObj.hostname,
              isYouTube: false,
            },
          }));
          
          toast.success(isArticle ? 'Article link ready. Please fill in the details.' : 'Link ready. Please fill in the details manually.');
        }
      }
    } catch (error) {
      console.error('Error fetching link info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch link information');
      setLinkPreview({ loading: false });
    }
  };

  const handleAddExternalLink = async () => {
    const { url, title, description, tags, category, duration, isYouTube } = uploadFormData.externalLink;

    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const isArticle = !isYouTube && (
        url.includes('/article/') || 
        url.includes('/post/') || 
        url.includes('/blog/') ||
        url.includes('/news/') ||
        url.includes('/story/')
      );
      
      const resourceData: import('../../../../lib/api/resources').CreateResourceInput = {
        title: title.trim(),
        description: description.trim() || 'External link resource',
        type: isYouTube ? 'video' : (isArticle ? 'article' : 'article'),
        url: url.trim(),
        thumbnail: linkPreview.thumbnail,
        tags: tagsArray,
        isPublic: true,
        youtubeUrl: isYouTube ? url.trim() : undefined,
        category: category || undefined,
        publisherName: user?.name || user?.email?.split('@')[0] || 'Unknown',
        content: undefined,
      };

      await createResource(resourceData);
      
      toast.success('External link added successfully');
      
      setUploadFormData(prev => ({
        ...prev,
        externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
      }));
      setLinkPreview({ loading: false });
      // Tab removed - admin only views resources
    } catch (error) {
      console.error('Error adding external link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add external link');
    } finally {
      setIsUploading(false);
    }
  };

  // Resource viewing is now handled by useResourceViewer hook

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

      {/* Resources View */}
      <div className="mt-6">

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

      {/* Review Tabs */}
      <Tabs value={reviewTab} onValueChange={(value) => setReviewTab(value as 'review' | 'published' | 'rejected')} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Review</span>
            <Badge variant="secondary" className="ml-2">
              {resources.filter(r => !r.isTrainingResource && (r.status === 'pending_review' || !r.status)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Published</span>
            <Badge variant="secondary" className="ml-2">
              {resources.filter(r => !r.isTrainingResource && r.status === 'published').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>Rejected</span>
            <Badge variant="secondary" className="ml-2">
              {resources.filter(r => !r.isTrainingResource && r.status === 'rejected').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-6">
          {/* Enhanced Search and Filters */}
          <div className="space-y-4 mb-8">
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

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'title' | 'type' | 'publisher')}>
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner variant="bars" size={32} className="text-primary" />
          </div>
      ) : filteredResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredResources.map((resource, index) => {
              const uiResource = convertToUIResource(resource);
            return (
                <div key={resource.id} className="relative">
                  <ResourceCard
                    resource={uiResource}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    onEdit={(r: any) => handleEditResource(resource)}
                    onDelete={(r: any) => handleDeleteResource(r.id || resource.id)}
                    showEditActions={false}
                    showActions={true}
                    delay={index * 0.1}
                    customActions={
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                          onClick={async () => {
                            try {
                              await updateResource(resource.id, {
                                status: 'reviewed',
                                reviewed: true,
                              });
                              toast.success('Resource accepted');
                              refreshResources();
                            } catch (error) {
                              console.error('Error accepting resource:', error);
                              toast.error('Failed to accept resource');
                            }
                          }}
                          title="Accept Resource"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                          onClick={async () => {
                            try {
                              await updateResource(resource.id, {
                                status: 'rejected',
                                reviewed: false,
                              });
                              toast.success('Resource rejected');
                              refreshResources();
                            } catch (error) {
                              console.error('Error rejecting resource:', error);
                              toast.error('Failed to reject resource');
                            }
                          }}
                          title="Reject Resource"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                          onClick={() => handleEditResource(resource)}
                          title="Edit resource"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </>
                    }
                  />
                  </div>
                  );
                })}
                  </div>
      ) : (
        <div className="text-center py-12 mt-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
          <h3 className="text-lg font-semibold mb-2">No resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
      )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {/* Enhanced Search and Filters - Same as other tabs */}
          <div className="space-y-4 mb-8">
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
          <SelectTrigger className="w-[140px] bg-primary/5 border-primary/20">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="article">Article</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-primary/5 border-primary/20">
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
          <SelectTrigger className="w-[160px] bg-primary/5 border-primary/20">
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner variant="bars" size={32} className="text-primary" />
                    </div>
      ) : filteredResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredResources.map((resource, index) => {
              const uiResource = convertToUIResource(resource);
            return (
                <div key={resource.id} className="relative">
                  <ResourceCard
                    resource={uiResource}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    onEdit={(r: any) => handleEditResource(resource)}
                    onDelete={(r: any) => handleDeleteResource(r.id || resource.id)}
                    showEditActions={false}
                    showActions={true}
                    delay={index * 0.1}
                    customActions={
                      <>
                    <Button
                      size="sm"
                          variant="outline" 
                          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 hover:border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                          onClick={async () => {
                            try {
                              await updateResource(resource.id, {
                                status: 'reviewed',
                                isPublic: false,
                              });
                              toast.success('Resource set to private');
                              refreshResources();
                            } catch (error) {
                              console.error('Error setting resource to private:', error);
                              toast.error('Failed to set resource to private');
                            }
                          }}
                          title="Make Private"
                        >
                          <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                          variant="outline" 
                          className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      onClick={() => handleEditResource(resource)}
                          title="Edit resource"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                      </>
                    }
                  />
                </div>
            );
          })}
          </div>
      ) : (
        <div className="text-center py-12 mt-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No published resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {/* Enhanced Search and Filters - Same as other tabs */}
          <div className="space-y-4 mb-8">
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
          <SelectTrigger className="w-[140px] bg-primary/5 border-primary/20">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="article">Article</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-primary/5 border-primary/20">
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
          <SelectTrigger className="w-[160px] bg-primary/5 border-primary/20">
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner variant="bars" size={32} className="text-primary" />
        </div>
      ) : filteredResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredResources.map((resource, index) => {
              const uiResource = convertToUIResource(resource);
            return (
                <div key={resource.id} className="relative">
                  <ResourceCard
                    resource={uiResource}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    onEdit={(r: any) => handleEditResource(resource)}
                    onDelete={(r: any) => handleDeleteResource(r.id || resource.id)}
                    showEditActions={false}
                    showActions={true}
                    delay={index * 0.1}
                    customActions={
                      <>
                    <Button
                      size="sm"
                          variant="outline" 
                          className="bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      onClick={() => handleEditResource(resource)}
                          title="Edit resource"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteResource(resource.id);
                          }}
                          title="Delete resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                      </>
                    }
                  />
                  </div>
            );
          })}
          </div>
      ) : (
        <div className="text-center py-12 mt-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No rejected resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
        </TabsContent>
      </Tabs>
      </div>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewerModalV2
          resource={convertToUIResource(selectedResource)}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onDownload={handleDownloadResource}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
          onViewArticle={(r: any) => handleViewResource(r)}
        />
      )}

      {/* Embed Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Embed</DialogTitle>
            <DialogDescription>
              Enter a URL from YouTube, Vimeo, SoundCloud, or another supported platform to embed content in your article.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="embedUrl">Embed URL</Label>
              <Input
                id="embedUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://soundcloud.com/..."
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleConfirmEmbed();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube, Vimeo, SoundCloud, or other embeddable URL
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Examples:</span>
              <span>youtube.com/watch?v=...</span>
              <span>•</span>
              <span>vimeo.com/...</span>
              <span>•</span>
              <span>soundcloud.com/...</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEmbedDialog(false);
              setEmbedUrl('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEmbed} disabled={!embedUrl.trim()}>
              Insert Embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link URL Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to. The selected text will become a clickable link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleConfirmLink();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowLinkDialog(false);
              setLinkUrl('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLink} disabled={!linkUrl.trim()}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article Viewer - Preview */}
      {previewArticle && isArticleViewerOpen && (
        <ArticleViewerV2
          article={{
            id: previewArticle.id,
            title: previewArticle.title,
            content: previewArticle.content || '',
            description: previewArticle.description,
            publisher: previewArticle.publisher,
            publisherName: previewArticle.publisherName,
            createdAt: new Date(previewArticle.createdAt),
            thumbnail: previewArticle.thumbnail,
            tags: previewArticle.tags,
          }}
          isOpen={isArticleViewerOpen}
          onClose={() => {
            setIsArticleViewerOpen(false);
            setPreviewArticle(null);
          }}
        />
      )}

      {/* Article Viewer - Existing Article */}
      {viewingArticle && !previewArticle && (
        <ArticleViewerV2
          article={{
            id: viewingArticle.id,
            title: viewingArticle.title,
            content: viewingArticle.content || '',
            description: viewingArticle.description,
            publisher: viewingArticle.publisher,
            publisherName: viewingArticle.publisherName,
            createdAt: new Date(viewingArticle.createdAt),
            thumbnail: viewingArticle.thumbnail,
            tags: viewingArticle.tags,
            url: viewingArticle.url, // Include URL for external articles
          }}
          isOpen={isArticleViewerOpen}
          onClose={handleCloseArticleViewer}
          onShare={(a: any) => handleShareResource(viewingArticle)}
          onBookmark={(a: any) => handleBookmarkResource(viewingArticle)}
          onDownload={(a: any) => handleDownloadResource(viewingArticle)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will permanently remove the resource from your library. All associated data will be lost.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setResourceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Tabs - Identical to Counselor Experience */}
      {(activeTab === 'upload-audio' || activeTab === 'upload-video' || activeTab === 'upload-pdf' || activeTab === 'upload-article') && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload-audio">Audio</TabsTrigger>
            <TabsTrigger value="upload-video">Video</TabsTrigger>
            <TabsTrigger value="upload-pdf">PDF</TabsTrigger>
          </TabsList>

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
                  onClick={() => {
                    setEditingResource(null);
                    setActiveTab('review');
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

              {/* Upload Area */}
              <AnimatedCard className="p-8">
                {editingResource && editingResource.type === 'audio' && editingResource.url ? (
                  <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50 dark:bg-purple-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <Play className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900 dark:text-purple-100">Current Audio File</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {editingResource.url.split('/').pop() || 'Audio file'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChooseAudioFile}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace File
                      </Button>
                    </div>
                    {uploadFormData.audio.file && (
                      <div className="mt-4 p-3 bg-white dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          New file selected: {uploadFormData.audio.file.name}
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          {(uploadFormData.audio.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
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
                  </div>
                )}
                {!(editingResource && editingResource.type === 'audio' && editingResource.url) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
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
                )}
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
                  <Button variant="outline" onClick={() => {
                    setEditingResource(null);
                    setActiveTab('review');
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
                  onClick={() => {
                    setEditingResource(null);
                    setActiveTab('review');
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

              {/* Upload Area */}
              <AnimatedCard className="p-8">
                {/* Show YouTube URL input when replacing a YouTube link - PRIORITIZED */}
                {editingResource && editingResource.type === 'video' && editingResource.youtubeUrl && !uploadFormData.video.youtubeUrl ? (
                  <div className="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl p-12 text-center hover:border-orange-300 dark:hover:border-orange-700 transition-colors bg-orange-50 dark:bg-orange-950">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Globe className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Paste your link here</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Supported: YouTube videos, websites, and other online resources. We'll automatically fetch the title, description, and thumbnail.
                    </p>
                    <div className="max-w-lg mx-auto mb-4">
                      <div className="relative">
                        <Input 
                          placeholder="Paste YouTube URL or website link (e.g., https://youtube.com/watch?v=...)"
                          className="pr-24"
                          value={uploadFormData.video.youtubeUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setUploadFormData(prev => ({ 
                              ...prev, 
                              video: { 
                                ...prev.video, 
                                youtubeUrl: url,
                                isYouTube: url.trim().length > 0 && (url.includes('youtube.com') || url.includes('youtu.be'))
                              } 
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && uploadFormData.video.youtubeUrl.trim()) {
                              e.preventDefault();
                              handleFetchYouTubeVideoInfo();
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
                          onClick={handleFetchYouTubeVideoInfo}
                          disabled={!uploadFormData.video.youtubeUrl.trim()}
                        >
                          Fetch Info
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Preview will appear here after entering URL
                    </div>
                  </div>
                ) : editingResource && editingResource.type === 'video' && (editingResource.url || editingResource.youtubeUrl) && 
                 !(editingResource.youtubeUrl && !uploadFormData.video.youtubeUrl) ? (
                  <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">Current Video</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {editingResource.youtubeUrl && uploadFormData.video.youtubeUrl ? 'YouTube Video' : (editingResource.url?.split('/').pop() || 'Video file')}
                          </p>
                          {editingResource.youtubeUrl && uploadFormData.video.youtubeUrl && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate max-w-md">
                              {uploadFormData.video.youtubeUrl || editingResource.youtubeUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={editingResource.youtubeUrl && uploadFormData.video.youtubeUrl ? () => {
                          // For YouTube videos, clear the URL so user can enter a new one
                          setUploadFormData(prev => ({ 
                            ...prev, 
                            video: { 
                              ...prev.video, 
                              youtubeUrl: '', 
                              isYouTube: false,
                              file: null // Clear any file selection
                            } 
                          }));
                        } : handleChooseVideoFile}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {editingResource.youtubeUrl && uploadFormData.video.youtubeUrl ? 'Replace Link' : 'Replace File'}
                      </Button>
                    </div>
                    {uploadFormData.video.file && (
                      <div className="mt-4 p-3 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          New file selected: {uploadFormData.video.file.name}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {(uploadFormData.video.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
                {!(editingResource && editingResource.type === 'video' && (editingResource.url || (editingResource.youtubeUrl && uploadFormData.video.youtubeUrl))) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
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
                )}
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
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">YouTube URL (optional)</label>
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={uploadFormData.video.youtubeUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setUploadFormData(prev => ({ 
                          ...prev, 
                          video: { 
                            ...prev.video, 
                            youtubeUrl: url,
                            isYouTube: url.trim().length > 0 && (url.includes('youtube.com') || url.includes('youtu.be'))
                          } 
                        }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadFormData.video.youtubeUrl ? 'YouTube video will be used instead of uploaded file' : 'Leave empty to upload a video file'}
                    </p>
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
                    setActiveTab('review');
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
                  onClick={() => {
                    setEditingResource(null);
                    setActiveTab('review');
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h3 className="text-xl font-semibold">
                    {editingResource && editingResource.type === 'pdf' ? 'Edit PDF Resource' : 'Upload PDF File'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {editingResource && editingResource.type === 'pdf' ? 'Update PDF resource details' : 'Add PDF content for your patients'}
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <AnimatedCard className="p-8">
                {editingResource && editingResource.type === 'pdf' && editingResource.url ? (
                  <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50 dark:bg-red-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">Current PDF File</p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {editingResource.url.split('/').pop() || 'PDF file'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChoosePdfFile}
                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace File
                      </Button>
                    </div>
                    {uploadFormData.pdf.file && (
                      <div className="mt-4 p-3 bg-white dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          New file selected: {uploadFormData.pdf.file.name}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {(uploadFormData.pdf.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-red-200 rounded-xl p-12 text-center hover:border-red-300 transition-colors">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-red-600" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Drop your PDF file here</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Supported format: PDF. Maximum file size: 50MB
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
                  </div>
                )}
                {!(editingResource && editingResource.type === 'pdf' && editingResource.url) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
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
                )}
              </AnimatedCard>

              {/* File Details Form */}
              <AnimatedCard className="p-6">
                <h4 className="font-semibold mb-4">Resource Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
                    <Input 
                      placeholder="Enter PDF title..." 
                      value={uploadFormData.pdf.title}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, pdf: { ...prev.pdf, title: e.target.value } }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                    <Textarea 
                      placeholder="Describe the PDF content..." 
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
                    setActiveTab('review');
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

          {/* Article Editor Tab */}
          <TabsContent value="upload-article" className="mt-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditingResource(null);
                    setActiveTab('review');
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Review
                </Button>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePreviewArticle}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSaveArticle}
                  >
                    Save Article
                  </Button>
                </div>
              </div>

              {/* Article Editor - Copy from counselor page */}
              <AnimatedCard className="overflow-hidden">
                <div className="space-y-6">
                  {/* Cover Image Section */}
                  <div className="relative bg-muted/30 border-b">
                    <input
                      ref={coverImageInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <div className="aspect-[21/9] flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 relative overflow-hidden">
                      {coverImage.preview ? (
                        <>
                          <img
                            src={coverImage.preview}
                            alt="Cover preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              className="gap-2 bg-white/90 hover:bg-white"
                              onClick={handleChooseCoverImage}
                            >
                              <Upload className="h-4 w-4" />
                              Change Image
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2 bg-white/90 hover:bg-white"
                              onClick={() => {
                                if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
                                  URL.revokeObjectURL(coverImage.preview);
                                }
                                setCoverImage({ file: null, preview: null });
                                toast.success('Cover image removed');
                              }}
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={handleChooseCoverImage}
                        >
                          <Upload className="h-4 w-4" />
                          Add Cover Image
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="px-8 py-6 space-y-8">
                    {/* Title */}
                    <div>
                      <Input 
                        placeholder="Article Title" 
                        value={articleFormData.title}
                        onChange={(e) => setArticleFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-4xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 text-foreground dark:text-foreground bg-transparent font-extrabold tracking-tight"
                        style={{
                          color: 'inherit',
                          fontSize: '2.25rem',
                          lineHeight: '2.5rem',
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 pb-6 border-b">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Category</label>
                        <Select value={articleFormData.category} onValueChange={(value) => setArticleFormData(prev => ({ ...prev, category: value }))}>
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
                        <Input 
                          placeholder="e.g., 5 min read" 
                          value={articleFormData.readingTime}
                          onChange={(e) => setArticleFormData(prev => ({ ...prev, readingTime: e.target.value }))}
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                          Author (Display Name)
                        </label>
                        <Input 
                          placeholder={user?.name || "Author name"} 
                          value={articleFormData.author || user?.name || ''}
                          onChange={(e) => setArticleFormData(prev => ({ ...prev, author: e.target.value }))}
                          title="Author name for display. Publisher is always the logged-in user."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Display name only (publisher: {user?.name || 'You'})
                        </p>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Article Excerpt</label>
                      <Textarea 
                        placeholder="Write a compelling summary that will appear in previews and search results (150-200 characters recommended)..." 
                        rows={3}
                        value={articleFormData.excerpt}
                        onChange={(e) => setArticleFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">This will be displayed in article previews and search results</p>
                    </div>

                    {/* Rich Text Editor Area */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Article Content</label>
                      
                      <div className="border rounded-lg bg-background">
                        {/* Formatting Toolbar */}
                        <div className="border-b p-2 flex flex-wrap gap-1">
                          {/* Text Formatting */}
                          <div className="flex gap-1 pr-2 border-r">
                            <Button 
                              variant={activeFormatting.bold ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.bold ? 'bg-muted' : ''}`}
                              title="Bold"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatCommand('bold');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="font-bold text-sm">B</span>
                            </Button>
                            <Button 
                              variant={activeFormatting.italic ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.italic ? 'bg-muted' : ''}`}
                              title="Italic"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatCommand('italic');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="italic text-sm">I</span>
                            </Button>
                            <Button 
                              variant={activeFormatting.underline ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.underline ? 'bg-muted' : ''}`}
                              title="Underline"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatCommand('underline');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="underline text-sm">U</span>
                            </Button>
                            <Button 
                              variant={activeFormatting.strikethrough ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.strikethrough ? 'bg-muted' : ''}`}
                              title="Strikethrough"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatCommand('strikeThrough');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="line-through text-sm">S</span>
                            </Button>
                          </div>

                          {/* Headings */}
                          <div className="flex gap-1 pr-2 border-r">
                            <Button 
                              variant={activeFormatting.heading === 'h1' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 px-2 text-xs ${activeFormatting.heading === 'h1' ? 'bg-muted' : ''}`}
                              title="Heading 1"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatHeading(1);
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              H1
                            </Button>
                            <Button 
                              variant={activeFormatting.heading === 'h2' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 px-2 text-xs ${activeFormatting.heading === 'h2' ? 'bg-muted' : ''}`}
                              title="Heading 2"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatHeading(2);
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              H2
                            </Button>
                            <Button 
                              variant={activeFormatting.heading === 'h3' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 px-2 text-xs ${activeFormatting.heading === 'h3' ? 'bg-muted' : ''}`}
                              title="Heading 3"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFormatHeading(3);
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              H3
                            </Button>
                          </div>

                          {/* Lists */}
                          <div className="flex gap-1 pr-2 border-r">
                            <Button 
                              variant={activeFormatting.list === 'unordered' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.list === 'unordered' ? 'bg-muted' : ''}`}
                              title="Bullet List"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertList(false);
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant={activeFormatting.list === 'ordered' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.list === 'ordered' ? 'bg-muted' : ''}`}
                              title="Numbered List"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertList(true);
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="text-xs font-semibold">1.</span>
                            </Button>
                          </div>

                          {/* Alignment */}
                          <div className="flex gap-1 pr-2 border-r">
                            <Button 
                              variant={activeFormatting.align === 'left' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.align === 'left' ? 'bg-muted' : ''}`}
                              title="Align Left"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAlignText('left');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="text-xs">⊣</span>
                            </Button>
                            <Button 
                              variant={activeFormatting.align === 'center' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.align === 'center' ? 'bg-muted' : ''}`}
                              title="Align Center"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAlignText('center');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="text-xs">≡</span>
                            </Button>
                            <Button 
                              variant={activeFormatting.align === 'right' ? "secondary" : "ghost"}
                              size="sm" 
                              className={`h-8 w-8 p-0 ${activeFormatting.align === 'right' ? 'bg-muted' : ''}`}
                              title="Align Right"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAlignText('right');
                                setTimeout(updateActiveFormatting, 100);
                              }}
                            >
                              <span className="text-xs">⊢</span>
                            </Button>
                          </div>

                          {/* Insert Elements */}
                          <div className="flex gap-1 pr-2 border-r">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Insert Link"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertLink();
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Insert Image"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertImage();
                              }}
                              disabled={isUploading}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Insert Embed (YouTube, Vimeo, SoundCloud, etc.)"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertEmbed();
                              }}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Insert Quote"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertQuote();
                              }}
                            >
                              <span className="text-sm">"</span>
                            </Button>
                          </div>

                          {/* Additional Tools */}
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Code Block"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertCodeBlock();
                              }}
                            >
                              <span className="text-xs font-mono">{'<>'}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Horizontal Rule"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertHorizontalRule();
                              }}
                            >
                              <span className="text-xs">—</span>
                            </Button>
                          </div>

                          <div className="ml-auto flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs" 
                              title="Undo"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUndo();
                              }}
                            >
                              ↶
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs" 
                              title="Redo"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRedo();
                              }}
                            >
                              ↷
                            </Button>
                          </div>
                        </div>

                        {/* Hidden file input for article images */}
                        <input
                          ref={articleImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleArticleImageChange}
                          className="hidden"
                        />

                        {/* Editor Content Area - This is a large section, I'll add the key parts */}
                        <div className="min-h-[500px]">
                          <div
                            ref={articleContentRef}
                            contentEditable
                            suppressContentEditableWarning
                            onFocus={() => {
                              if (articleContentRef.current && !articleContentRef.current.innerHTML.trim()) {
                                articleContentRef.current.innerHTML = '<br>';
                              }
                            }}
                            onInput={(e) => {
                              const content = e.currentTarget.innerHTML;
                              setArticleFormData(prev => ({ ...prev, content }));
                            }}
                            onBlur={(e) => {
                              const content = e.currentTarget.innerHTML;
                              setArticleFormData(prev => ({ ...prev, content }));
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace/delete to remove images - same logic as counselor page
                              if (e.key === 'Backspace' || e.key === 'Delete') {
                                const selection = window.getSelection();
                                if (!selection || selection.rangeCount === 0) return;
                                
                                const range = selection.getRangeAt(0);
                                if (!range.collapsed) return;
                                
                                let nodeToCheck: Node | null = null;
                                if (e.key === 'Backspace') {
                                  nodeToCheck = range.startContainer;
                                  if (nodeToCheck.nodeType === Node.TEXT_NODE) {
                                    if (range.startOffset === 0) {
                                      nodeToCheck = nodeToCheck.previousSibling;
                                    }
                                  } else {
                                    nodeToCheck = nodeToCheck.previousSibling;
                                  }
                                } else {
                                  nodeToCheck = range.startContainer;
                                  if (nodeToCheck.nodeType === Node.TEXT_NODE) {
                                    const textNode = nodeToCheck as Text;
                                    if (range.startOffset === textNode.length) {
                                      nodeToCheck = nodeToCheck.nextSibling;
                                    }
                                  } else {
                                    nodeToCheck = (nodeToCheck as Element).firstChild || nodeToCheck.nextSibling;
                                  }
                                }
                                
                                let imageContainer: HTMLElement | null = null;
                                if (nodeToCheck) {
                                  if (nodeToCheck.nodeType === Node.ELEMENT_NODE) {
                                    const element = nodeToCheck as HTMLElement;
                                    if (element.classList?.contains('article-image-container')) {
                                      imageContainer = element;
                                    } else {
                                      imageContainer = element.closest('.article-image-container');
                                    }
                                  } else {
                                    imageContainer = nodeToCheck.parentElement?.closest('.article-image-container') || null;
                                  }
                                }
                                
                                if (!imageContainer) {
                                  const commonAncestor = range.commonAncestorContainer;
                                  if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
                                    imageContainer = (commonAncestor as HTMLElement).closest('.article-image-container');
                                  } else {
                                    imageContainer = commonAncestor.parentElement?.closest('.article-image-container') || null;
                                  }
                                }
                                
                                if (imageContainer && articleContentRef.current?.contains(imageContainer)) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  const newRange = document.createRange();
                                  if (imageContainer.nextSibling) {
                                    newRange.setStartBefore(imageContainer.nextSibling);
                                  } else if (imageContainer.previousSibling) {
                                    newRange.setStartAfter(imageContainer.previousSibling);
                                  } else {
                                    const parent = imageContainer.parentNode;
                                    if (parent) {
                                      newRange.selectNodeContents(parent);
                                      newRange.collapse(false);
                                    }
                                  }
                                  
                                  imageContainer.remove();
                                  
                                  selection.removeAllRanges();
                                  selection.addRange(newRange);
                                  
                                  const content = articleContentRef.current?.innerHTML || '';
                                  setArticleFormData(prev => ({ ...prev, content }));
                                }
                              }
                            }}
                            onPaste={(e) => {
                              requestAnimationFrame(() => {
                                setTimeout(() => {
                                  if (!articleContentRef.current) return;
                                  
                                  const allElements = articleContentRef.current.querySelectorAll('*');
                                  allElements.forEach((el) => {
                                    const element = el as HTMLElement;
                                    
                                    if (element.tagName === 'IFRAME' || 
                                        (element.tagName === 'DIV' && element.style.position === 'relative' && element.querySelector('iframe'))) {
                                      return;
                                    }
                                    
                                    if (element.style.color) {
                                      element.style.removeProperty('color');
                                    }
                                    if (element.style.backgroundColor) {
                                      element.style.removeProperty('background-color');
                                    }
                                    
                                    if (element.getAttribute('style')) {
                                      const style = element.getAttribute('style') || '';
                                      const cleanedStyle = style
                                        .split(';')
                                        .filter((prop) => {
                                          const lowerProp = prop.toLowerCase().trim();
                                          return !lowerProp.startsWith('color') && 
                                                 !lowerProp.startsWith('background-color') &&
                                                 prop.trim() !== '';
                                        })
                                        .join(';');
                                      if (cleanedStyle.trim()) {
                                        element.setAttribute('style', cleanedStyle);
                                      } else {
                                        element.removeAttribute('style');
                                      }
                                    }
                                    
                                    element.removeAttribute('color');
                                  });
                                  
                                  const content = articleContentRef.current.innerHTML;
                                  setArticleFormData(prev => {
                                    return { ...prev, content };
                                  });
                                }, 10);
                              });
                            }}
                            onDragOver={(e) => {
                              if (draggedImageRef.current) {
                                e.preventDefault();
                                e.dataTransfer!.dropEffect = 'move';
                              }
                            }}
                            onDrop={(e) => {
                              if (!draggedImageRef.current || !articleContentRef.current) return;
                              
                              e.preventDefault();
                              e.stopPropagation();
                              
                              const selection = window.getSelection();
                              if (!selection) return;
                              
                              let range: Range | null = null;
                              if (document.caretRangeFromPoint) {
                                range = document.caretRangeFromPoint(e.clientX, e.clientY);
                              } else if (selection.rangeCount > 0) {
                                range = selection.getRangeAt(0);
                              }
                              
                              if (range && articleContentRef.current.contains(range.commonAncestorContainer)) {
                                let insertNode: Node | null = range.commonAncestorContainer;
                                
                                if (insertNode.nodeType === Node.TEXT_NODE) {
                                  insertNode = insertNode.parentElement;
                                }
                                
                                if (insertNode && insertNode !== draggedImageRef.current && 
                                    !draggedImageRef.current.contains(insertNode)) {
                                  const draggedElement = draggedImageRef.current;
                                  draggedElement.remove();
                                  
                                  if (insertNode.parentNode) {
                                    const rect = (insertNode as HTMLElement).getBoundingClientRect();
                                    if (e.clientY < rect.top + rect.height / 2) {
                                      insertNode.parentNode.insertBefore(draggedElement, insertNode);
                                    } else {
                                      insertNode.parentNode.insertBefore(draggedElement, insertNode.nextSibling);
                                    }
                                  }
                                  
                                  const content = articleContentRef.current.innerHTML;
                                  setArticleFormData(prev => ({ ...prev, content }));
                                  
                                  draggedImageRef.current = null;
                                }
                              }
                            }}
                            className="border-0 resize-none focus:outline-none text-base leading-relaxed p-6 bg-transparent min-h-[500px] text-foreground dark:text-foreground"
                            style={{ 
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              color: 'inherit'
                            }}
                            data-placeholder="Start writing your article here..."
                          />
                        </div>
                        <style jsx global>{`
                          [contenteditable][data-placeholder]:empty:before {
                            content: attr(data-placeholder);
                            color: rgb(161 161 170);
                            pointer-events: none;
                          }
                          [contenteditable] {
                            color: inherit !important;
                          }
                          [contenteditable] * {
                            color: inherit !important;
                          }
                          [contenteditable] img {
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 1rem auto;
                            border-radius: 0.5rem;
                          }
                          [contenteditable] .article-image-container {
                            position: relative;
                            display: inline-block;
                            width: 100%;
                            max-width: 100%;
                            margin: 1rem 0;
                            cursor: move;
                          }
                          [contenteditable] .article-image-container:hover {
                            outline: 2px dashed rgba(59, 130, 246, 0.5);
                            outline-offset: 2px;
                          }
                          [contenteditable] .article-image-container img {
                            margin: 0;
                            width: 100%;
                          }
                          [contenteditable] .article-image-delete {
                            position: absolute;
                            top: 0.5rem;
                            right: 0.5rem;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: rgba(0, 0, 0, 0.7);
                            color: white;
                            border: none;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 18px;
                            line-height: 1;
                            z-index: 10;
                          }
                          [contenteditable] .article-image-container:hover .article-image-delete {
                            opacity: 1;
                          }
                          [contenteditable] .article-image-delete:hover {
                            background: rgba(220, 38, 38, 0.9);
                          }
                        `}</style>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <Input 
                        placeholder="Enter tags separated by commas (e.g., mental-health, wellness, coping)" 
                        value={articleFormData.tags}
                        onChange={(e) => setArticleFormData(prev => ({ ...prev, tags: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </TabsContent>
        </Tabs>
      )}

    </div>
  );
}

