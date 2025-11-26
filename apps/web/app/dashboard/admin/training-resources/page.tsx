'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Switch } from '@workspace/ui/components/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Search, 
  Filter, 
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  Download,
  Star,
  Clock,
  Users,
  BookOpen,
  Video,
  FileText,
  Presentation,
  GraduationCap,
  Tag,
  Calendar,
  Award,
  AlertTriangle,
  X,
  Play,
  Globe,
  ExternalLink,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { Resource } from '@/lib/api/resources';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi } from '../../../../lib/api/resources';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export default function AdminTrainingResourcesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'add-resources' | 'manage-resources'>('manage-resources');
  const [activeUploadType, setActiveUploadType] = useState<'audio' | 'video' | 'pdf' | 'external-link' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedType, setSelectedType] = useState<'all' | string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | string>('all');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'title' | 'downloads' | 'rating' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // File input refs for different resource types
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state matching counselor dashboard
  const [uploadFormData, setUploadFormData] = useState<{
    audio: { file: File | null; title: string; description: string; tags: string; duration: string };
    video: { file: File | null; title: string; description: string; tags: string; duration: string; isYouTube: boolean; youtubeUrl: string };
    pdf: { file: File | null; title: string; description: string; tags: string };
    bulk: { files: File[] };
    externalLink: { url: string; title: string; description: string; tags: string; category: string; duration: string; isYouTube: boolean };
  }>({
    audio: { file: null, title: '', description: '', tags: '', duration: '' },
    video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
    pdf: { file: null, title: '', description: '', tags: '' },
    bulk: { files: [] },
    externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
  });

  // External link preview state
  const [linkPreview, setLinkPreview] = useState<{
    title?: string;
    description?: string;
    thumbnail?: string;
    loading: boolean;
  }>({ loading: false });

  // Load training resources (public resources)
  const {
    resources,
    loading,
    error,
    createResource,
    createResourceWithFile,
    updateResource,
    deleteResource,
    refreshResources,
  } = useResources({ isPublic: true });

  // Dynamically generate categories and types from resources
  const categories = useMemo(() => {
    const cats = new Set<string>(['all']);
    resources.forEach(r => {
      r.tags?.forEach(tag => cats.add(tag));
    });
    return Array.from(cats);
  }, [resources]);

  const types = useMemo(() => {
    const typs = new Set<string>(['all']);
    resources.forEach(r => {
      if (r.type) typs.add(r.type);
    });
    return Array.from(typs);
  }, [resources]);

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.publisher?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || resource.tags?.includes(selectedCategory);
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      // Note: Difficulty is not part of Resource type, so we'll skip it for now
      const matchesDifficulty = true; // selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    }).sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title) * dir;
        case 'downloads':
          // Note: downloads not in Resource type, would need to be added
          return 0 * dir;
        case 'rating':
          // Note: rating not in Resource type, would need to be added
          return 0 * dir;
        case 'createdAt':
        default:
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
    });
  }, [resources, searchTerm, selectedCategory, selectedType, selectedDifficulty, sortBy, sortDir]);

  const total = filteredResources.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pagedResources = filteredResources.slice((page - 1) * pageSize, page * pageSize);

  const resourceSummary = useMemo(() => {
    const totalResources = resources.length;
    const published = resources.filter((resource) => resource.isPublic).length;
    const publicViews = resources.reduce((acc, resource) => acc + (resource.views ?? 0), 0);
    const publicDownloads = resources.reduce(
      (acc, resource) => acc + (resource.downloads ?? 0),
      0,
    );
    return {
      total: totalResources,
      published,
      privateCount: totalResources - published,
      views: publicViews,
      downloads: publicDownloads,
    };
  }, [resources]);

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


  // File selection handlers matching counselor dashboard
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

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        toast.error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 100MB`);
        if (event.target) event.target.value = '';
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
    if (event.target) event.target.value = '';
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxFileSize) {
        toast.error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 500MB`);
        if (event.target) event.target.value = '';
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
    if (event.target) event.target.value = '';
  };

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        toast.error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB`);
        if (event.target) event.target.value = '';
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
    if (event.target) event.target.value = '';
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
    if (event.target) event.target.value = '';
  };

  // Upload handlers matching counselor dashboard
  const handleUploadAudio = async () => {
    const { file, title, description, tags } = uploadFormData.audio;
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
        await updateResource(editingResource.id, {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Admin',
        });
        toast.success('Audio resource updated successfully');
        await refreshResources();
        setEditingResource(null);
        setActiveUploadType(null);
        setActiveTab('manage-resources');
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
          publisherName: user?.name || 'Admin',
          isTrainingResource: true,
        });
        toast.success('Audio resource uploaded successfully');
        await refreshResources();
        setActiveUploadType(null);
        setActiveTab('manage-resources');
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
    const { file, title, description, tags, isYouTube, youtubeUrl } = uploadFormData.video;
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
        await updateResource(editingResource.id, {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Admin',
          youtubeUrl: isYouTube ? youtubeUrl?.trim() : undefined,
        });
        toast.success('Video resource updated successfully');
        await refreshResources();
        setEditingResource(null);
        setActiveUploadType(null);
        setActiveTab('manage-resources');
      } else {
        if (isYouTube) {
          await createResource({
            title: title.trim(),
            description: description.trim(),
            type: 'video',
          tags: tagsArray,
          isPublic: true,
            youtubeUrl: youtubeUrl?.trim(),
            publisherName: user?.name || 'Admin',
            isTrainingResource: true,
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
            publisherName: user?.name || 'Admin',
            isTrainingResource: true,
          });
          toast.success('Video resource uploaded successfully');
        }
        await refreshResources();
        setActiveUploadType(null);
        setActiveTab('manage-resources');
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
        await updateResource(editingResource.id, {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Admin',
        });
        toast.success('PDF resource updated successfully');
        await refreshResources();
        setEditingResource(null);
        setActiveUploadType(null);
        setActiveTab('manage-resources');
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
          publisherName: user?.name || 'Admin',
          isTrainingResource: true,
        });
        toast.success('PDF resource uploaded successfully');
        await refreshResources();
        setActiveUploadType(null);
        setActiveTab('manage-resources');
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

  const handleFetchYouTubeVideoInfo = async () => {
    const url = uploadFormData.video.youtubeUrl.trim();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYouTube) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    try {
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

      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube video information');
      }

      const data = await response.json();
      
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
              
              if (video.contentDetails?.duration) {
                duration = convertISODurationToTime(video.contentDetails.duration);
              }
              
              if (video.snippet?.description) {
                fullDescription = video.snippet.description;
              }
              
              if (video.snippet?.tags && Array.isArray(video.snippet.tags)) {
                videoTags = video.snippet.tags.slice(0, 10);
              }
            }
          }
        } catch (apiError) {
          console.warn('Failed to fetch additional data from YouTube API:', apiError);
        }
      }
      
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
            
            setLinkPreview({
              title: data.title,
              description: data.author_name ? `By ${data.author_name}` : '',
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              loading: false,
            });
            
            setUploadFormData(prev => ({
              ...prev,
              externalLink: {
                ...prev.externalLink,
                title: data.title || '',
                description: data.author_name ? `By ${data.author_name}` : '',
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
        const urlObj = new URL(url);
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
        
        toast.success('Link ready. Please fill in the details manually.');
      }
    } catch (error) {
      console.error('Error fetching link info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch link information');
      setLinkPreview({ loading: false });
    }
  };

  const handleAddExternalLink = async () => {
    const { url, title, description, tags, category, isYouTube } = uploadFormData.externalLink;

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
        publisherName: user?.name || 'Admin',
        content: undefined,
        isTrainingResource: true,
      };

      await createResource(resourceData);
      
      toast.success('External link added successfully');
      await refreshResources();
      
      setUploadFormData(prev => ({
        ...prev,
        externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
      }));
      setLinkPreview({ loading: false });
      setActiveUploadType(null);
      setActiveTab('manage-resources');
    } catch (error) {
      console.error('Error adding external link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add external link');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setActiveTab('add-resources');
    
    if (resource.type === 'audio') {
      setActiveUploadType('audio');
      setUploadFormData(prev => ({
        ...prev,
        audio: {
          file: null,
      title: resource.title,
      description: resource.description || '',
          tags: resource.tags?.join(', ') || '',
      duration: '',
        },
      }));
    } else if (resource.type === 'video') {
      setActiveUploadType('video');
      setUploadFormData(prev => ({
        ...prev,
        video: {
          file: null,
          title: resource.title,
          description: resource.description || '',
          tags: resource.tags?.join(', ') || '',
          duration: '',
          isYouTube: !!resource.youtubeUrl,
          youtubeUrl: resource.youtubeUrl || '',
        },
      }));
    } else if (resource.type === 'pdf') {
      setActiveUploadType('pdf');
      setUploadFormData(prev => ({
        ...prev,
        pdf: {
          file: null,
          title: resource.title,
          description: resource.description || '',
          tags: resource.tags?.join(', ') || '',
        },
      }));
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this training resource?')) return;
    
    try {
      await deleteResource(resourceId);
      await refreshResources();
      toast.success('Training resource deleted successfully!');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected resource(s)?`)) return;
    
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteResource(id)));
      await refreshResources();
      toast.success(`Deleted ${selectedIds.size} resource(s) successfully.`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error bulk deleting resources:', error);
      toast.error('Failed to delete some resources. Please try again.');
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(pagedResources.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (checked) copy.add(id); else copy.delete(id);
      return copy;
    });
  };

  const handleToggleActive = async (resource: Resource, next: boolean) => {
    try {
      await updateResource(resource.id, { isPublic: next });
      await refreshResources();
      toast.success(`${resource.title} ${next ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Error toggling resource status:', error);
      toast.error('Failed to update resource status. Please try again.');
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Play className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'workshop': return <Users className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'presentation': return <Presentation className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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
        title="Training Resources"
        description="Manage training materials for counselor development"
      />

      {error ? (
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Unable to load resources</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {error}. You can retry or add a new training resource manually.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" onClick={refreshResources}>
                Retry
              </Button>
              <Button onClick={() => setActiveTab('add-resources')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </div>
          </CardHeader>
        </AnimatedCard>
      ) : null}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceSummary.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Training materials
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceSummary.views.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {resourceSummary.downloads.toLocaleString()} downloads
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceSummary.published}
            </div>
            <p className="text-xs text-muted-foreground">
              Public resources
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length - 1}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'add-resources' | 'manage-resources')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-resources" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Resources</span>
          </TabsTrigger>
          <TabsTrigger value="manage-resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Manage Resources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-resources" className="mt-6">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Add New Training Resource</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose how you'd like to add content to the training resource library. All resources will be available to counselors.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatedCard delay={0.1} className="group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>
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
                  <div className="relative z-20">
                    <Button 
                      type="button"
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingResource(null);
                        setActiveUploadType('audio');
                        setUploadFormData(prev => ({
                          ...prev,
                          audio: { file: null, title: '', description: '', tags: '', duration: '' },
                        }));
                        // Scroll to form after a brief delay to allow render
                        setTimeout(() => {
                          const formElement = document.querySelector('[data-upload-form="audio"]');
                          formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio
                    </Button>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className="group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>
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
                  <div className="relative z-20">
                    <Button 
                      type="button"
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingResource(null);
                        setActiveUploadType('video');
                        setUploadFormData(prev => ({
                          ...prev,
                          video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
                        }));
                        setTimeout(() => {
                          const formElement = document.querySelector('[data-upload-form="video"]');
                          formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.3} className="group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>
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
                  <div className="relative z-20">
                    <Button 
                      type="button"
                      size="sm" 
                      className="w-full bg-red-600 hover:bg-red-700 cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingResource(null);
                        setActiveUploadType('pdf');
                        setUploadFormData(prev => ({
                          ...prev,
                          pdf: { file: null, title: '', description: '', tags: '' },
                        }));
                        setTimeout(() => {
                          const formElement = document.querySelector('[data-upload-form="pdf"]');
                          formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.4} className="group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>
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
                  <div className="relative z-20">
                    <Button 
                      type="button"
                      size="sm" 
                      className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingResource(null);
                        setActiveUploadType('external-link');
                        setUploadFormData(prev => ({
                          ...prev,
                          externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
                        }));
                        setTimeout(() => {
                          const formElement = document.querySelector('[data-upload-form="external-link"]');
                          formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Upload Forms */}
            {activeUploadType === 'audio' && (
              <div className="space-y-6 mt-8" data-upload-form="audio">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveUploadType(null)}
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
                      Add audio content for training resources
                    </p>
                  </div>
                </div>

                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />

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
                        <Button variant="outline" size="sm" onClick={handleChooseAudioFile}>
                          <Upload className="h-4 w-4 mr-2" />
                          Replace File
                        </Button>
                      </div>
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
                      </div>
                    </div>
                  )}
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
                    <Button variant="outline" onClick={() => setActiveUploadType(null)}>
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
            )}

            {activeUploadType === 'video' && (
              <div className="space-y-6 mt-8" data-upload-form="video">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveUploadType(null)}
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
                      Add video content for training resources
                    </p>
                  </div>
                </div>

                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                <AnimatedCard className="p-8">
                  {editingResource && editingResource.type === 'video' && editingResource.youtubeUrl ? (
                    <div className="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl p-12 text-center hover:border-orange-300 dark:hover:border-orange-700 transition-colors bg-orange-50 dark:bg-orange-950">
                      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Globe className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Paste your YouTube link here</h4>
                      <div className="max-w-lg mx-auto mb-4">
                        <div className="relative">
                          <Input 
                            placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
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
                    </div>
                  ) : editingResource && editingResource.type === 'video' && editingResource.url ? (
                    <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">Current Video</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {editingResource.url.split('/').pop() || 'Video file'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleChooseVideoFile}>
                          <Upload className="h-4 w-4 mr-2" />
                          Replace File
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                      </div>
                    </div>
                  )}
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
                    <Button variant="outline" onClick={() => setActiveUploadType(null)}>
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
            )}

            {activeUploadType === 'pdf' && (
              <div className="space-y-6 mt-8" data-upload-form="pdf">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveUploadType(null)}
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
                      Add PDF content for training resources
                    </p>
                  </div>
                </div>

                <input
                  ref={pdfFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileChange}
                  className="hidden"
                />

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
                        <Button variant="outline" size="sm" onClick={handleChoosePdfFile}>
                          <Upload className="h-4 w-4 mr-2" />
                          Replace File
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                      </div>
                    </div>
                  )}
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
                    <Button variant="outline" onClick={() => setActiveUploadType(null)}>
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
            )}

            {activeUploadType === 'external-link' && (
              <div className="space-y-6 mt-8 max-w-4xl mx-auto" data-upload-form="external-link">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveUploadType(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div>
                    <h3 className="text-xl font-semibold">Add External Link</h3>
                    <p className="text-sm text-muted-foreground">
                      Link to YouTube videos, websites, or other online resources
                    </p>
                  </div>
                </div>

                <AnimatedCard className="p-8">
                  <div className="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl p-12 text-center hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
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
                          value={uploadFormData.externalLink.url}
                          onChange={(e) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, url: e.target.value } }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleFetchLinkInfo();
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
                          onClick={handleFetchLinkInfo}
                          disabled={linkPreview.loading || !uploadFormData.externalLink.url.trim()}
                        >
                          {linkPreview.loading ? 'Fetching...' : 'Fetch Info'}
                        </Button>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-orange-100 dark:border-orange-900 rounded-lg p-8 text-center bg-orange-50/50 dark:bg-orange-950/50">
                      {linkPreview.loading ? (
                        <div className="flex flex-col items-center">
                          <Spinner variant="bars" size={32} className="mb-3" />
                          <p className="text-sm text-muted-foreground">Fetching link information...</p>
                        </div>
                      ) : linkPreview.title || linkPreview.thumbnail ? (
                        <div className="text-left">
                          {linkPreview.thumbnail && (
                            <img 
                              src={linkPreview.thumbnail} 
                              alt={linkPreview.title || 'Preview'} 
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          {linkPreview.title && (
                            <h5 className="font-semibold mb-2">{linkPreview.title}</h5>
                          )}
                          {linkPreview.description && (
                            <p className="text-sm text-muted-foreground">{linkPreview.description}</p>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                          <ExternalLink className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h4 className="font-semibold mb-4">Resource Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
                      <Input 
                        placeholder="Resource title (auto-filled from URL)" 
                        value={uploadFormData.externalLink.title}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, title: e.target.value } }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                      <Textarea 
                        rows={3}
                        placeholder="Resource description (auto-filled from URL or add your own)"
                        value={uploadFormData.externalLink.description}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, description: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                      <Select 
                        value={uploadFormData.externalLink.category}
                        onValueChange={(value) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, category: value } }))}
                      >
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
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Duration (if video)</label>
                      <Input 
                        placeholder="e.g., 12:30" 
                        value={uploadFormData.externalLink.duration}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, duration: e.target.value } }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                      <Input 
                        placeholder="Enter tags separated by commas..." 
                        value={uploadFormData.externalLink.tags}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, externalLink: { ...prev.externalLink, tags: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="outline" onClick={() => {
                      setUploadFormData(prev => ({
                        ...prev,
                        externalLink: { url: '', title: '', description: '', tags: '', category: '', duration: '', isYouTube: false },
                      }));
                      setLinkPreview({ loading: false });
                      setActiveUploadType(null);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleAddExternalLink}
                      disabled={isUploading || !uploadFormData.externalLink.url.trim() || !uploadFormData.externalLink.title.trim()}
                    >
                      {isUploading ? (
                        <>
                          <Spinner variant="bars" size={16} className="mr-2" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Add Resource
                        </>
                      )}
                    </Button>
                  </div>
                </AnimatedCard>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage-resources" className="mt-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={(value) => setSelectedType(value)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'All Levels' : difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        </div>

        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={(v: any) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortDir} onValueChange={(v: any) => { setSortDir(v); setPage(1); }}>
            <SelectTrigger className="w-28 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>Table</Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
        </div>
      </div>

      {viewMode === 'table' ? (
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Training Resources List</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size > 0 && pagedResources.every(r => selectedIds.has(r.id))}
                  onCheckedChange={(c: any) => toggleSelectAll(!!c)}
                />
              </TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(resource.id)}
                    onCheckedChange={(c: any) => toggleSelectOne(resource.id, !!c)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {resource.thumbnail ? (
                      <img src={resource.thumbnail} alt="thumb" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(resource.type)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.publisher || 'Admin'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {resource.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {resource.tags?.[0] || 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    N/A
                  </Badge>
                </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch checked={resource.isPublic} onCheckedChange={(c) => handleToggleActive(resource, !!c)} />
                  <span className="text-xs text-muted-foreground">{resource.isPublic ? 'Published' : 'Unpublished'}</span>
                </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>N/A</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Download className="h-3 w-3 text-muted-foreground" />
                    <span>N/A</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>N/A</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedResource(resource); setIsViewerOpen(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </AnimatedCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pagedResources.map((resource, index) => (
            <AnimatedCard key={resource.id} delay={0.05 * (index + 1)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.publisher || 'Admin'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{resource.tags?.[0] || 'Uncategorized'}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{resource.description || 'No description'}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                  <Badge variant={resource.isPublic ? 'default' : 'secondary'}>
                    {resource.isPublic ? 'Published' : 'Unpublished'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(resource.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => { setSelectedResource(resource); setIsViewerOpen(true); }}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Results Summary & Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + Math.min(1, pagedResources.length)}-{(page - 1) * pageSize + pagedResources.length} of {total} resources
        </p>
        <div className="flex items-center space-x-2">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-24 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
            <div className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      </div>

          </TabsContent>
        </Tabs>

      {/* Viewer Modal */}
      {selectedResource && (
        <ResourceViewerModalV2
          resource={convertToUIResource(selectedResource)}
          isOpen={isViewerOpen}
          onClose={() => { setIsViewerOpen(false); setSelectedResource(null); }}
          onDownload={() => selectedResource && window.open(selectedResource.url || '#', '_blank')}
          onShare={() => alert('Share coming soon')}
          onBookmark={() => alert('Bookmark coming soon')}
        />
      )}
    </div>
  );
}
