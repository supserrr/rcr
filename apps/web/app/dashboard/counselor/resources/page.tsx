'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  // Upload form state
  const [uploadFormData, setUploadFormData] = useState<{
    audio: { file: File | null; title: string; description: string; tags: string; duration: string };
    video: { file: File | null; title: string; description: string; tags: string; duration: string; isYouTube: boolean; youtubeUrl: string };
    pdf: { file: File | null; title: string; description: string; tags: string };
    bulk: { files: File[] };
  }>({
    audio: { file: null, title: '', description: '', tags: '', duration: '' },
    video: { file: null, title: '', description: '', tags: '', duration: '', isYouTube: false, youtubeUrl: '' },
    pdf: { file: null, title: '', description: '', tags: '' },
    bulk: { files: [] },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });

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

  // Track which draft is being edited
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

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

  // Clean up cover image preview URL and reset form when switching away from article editor
  useEffect(() => {
    if (activeTab !== 'create-article') {
      if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImage.preview);
      }
      setCoverImage({ file: null, preview: null });
      // Reset article form data when switching away (but keep if we're loading a draft)
      if (!editingDraftId) {
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
    }
  }, [activeTab, editingDraftId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize and sync contentEditable with state
  useEffect(() => {
    if (activeTab === 'create-article') {
      // Use a small delay to ensure the DOM is ready after tab switch
      const timeoutId = setTimeout(() => {
        if (articleContentRef.current) {
          const currentContent = articleContentRef.current.innerHTML.trim();
          const stateContent = articleFormData.content || '';
          
          // If we have state content and the editor is empty or just has <br>, load the state content
          // This handles loading drafts
          if (stateContent && (!currentContent || currentContent === '<br>' || currentContent === '')) {
            articleContentRef.current.innerHTML = stateContent;
          } else if (stateContent && currentContent !== stateContent) {
            // Only update if the element doesn't have focus (user isn't typing)
            // This prevents overwriting user input while they're typing
            if (document.activeElement !== articleContentRef.current) {
              articleContentRef.current.innerHTML = stateContent;
            }
          } else if (!stateContent && (!currentContent || currentContent === '<br>')) {
            // Initialize with <br> for placeholder to work and ensure it's editable
            articleContentRef.current.innerHTML = '<br>';
            // Ensure the element is properly set up as contentEditable
            articleContentRef.current.setAttribute('contenteditable', 'true');
          }
        }
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timeoutId);
    }
  }, [articleFormData.content, activeTab, editingDraftId]);

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

  // Update formatting states on selection change
  useEffect(() => {
    if (activeTab !== 'create-article') return;

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
  }, [activeTab, updateActiveFormatting]);

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
        publisherName: resource.publisherName || user?.name || 'Unknown',
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
      // For articles, load into the article editor
      setEditingDraftId(resource.id);
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
      setActiveTab('create-article');
      // Force content to load after a brief delay
      setTimeout(() => {
        if (articleContentRef.current && resource.content) {
          const currentContent = articleContentRef.current.innerHTML.trim();
          if (!currentContent || currentContent === '<br>' || currentContent === '') {
            articleContentRef.current.innerHTML = resource.content;
          }
        }
      }, 200);
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
          publisherName: article.publisherName || user?.name || 'Unknown',
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
          publisherName: article.publisherName || user?.name || 'Unknown',
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
        publisherName: updatedResource.publisherName || user?.name || 'Unknown',
      });
      toast.success('Resource updated successfully');
      setEditingResource(null);
      setActiveTab('view');
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


  const handleCloseArticleEditor = () => {
    // Clean up cover image preview URL to prevent memory leaks
    if (coverImage.preview && coverImage.preview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImage.preview);
    }
    setCoverImage({ file: null, preview: null });
    // Reset article form data
    setArticleFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      readingTime: '',
      author: '',
      tags: '',
    });
    setEditingDraftId(null);
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

  const handleChooseCoverImage = () => {
    coverImageInputRef.current?.click();
  };

  // Formatting handlers for article editor
  const handleFormatCommand = (command: string, value?: string) => {
    if (!articleContentRef.current) {
      console.warn('Article content ref not available');
      return;
    }
    
    // Ensure the editor is focused and has content
    articleContentRef.current.focus();
    
    // Ensure there's at least a <br> for commands to work
    if (!articleContentRef.current.innerHTML.trim()) {
      articleContentRef.current.innerHTML = '<br>';
    }
    
    // Set cursor position if no selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(articleContentRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Small delay to ensure focus is set
    setTimeout(() => {
      if (articleContentRef.current) {
        try {
          const success = document.execCommand(command, false, value);
          console.log(`Command ${command} executed:`, success);
          
          if (!success) {
            console.warn(`Command ${command} failed. Trying alternative approach...`);
            // Fallback: try to apply formatting to selected text
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (!range.collapsed) {
                // There's a selection, try wrapping it
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
          }
          
          // Update content after formatting
          const content = articleContentRef.current.innerHTML;
          setArticleFormData(prev => ({ ...prev, content }));
          
          // Keep focus on the editor
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
        const success = document.execCommand('formatBlock', false, `h${level}`);
        console.log(`Heading H${level} executed:`, success);
        
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
        const success = document.execCommand(command, false);
        console.log(`List command ${command} executed:`, success);
        
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
        if (alignment === 'center') {
          command = 'justifyCenter';
        } else if (alignment === 'right') {
          command = 'justifyRight';
        } else if (alignment === 'justify') {
          command = 'justifyFull';
        }
        
        const success = document.execCommand(command, false);
        console.log(`Alignment ${alignment} executed:`, success);
        
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  const handleInsertLink = () => {
    if (!articleContentRef.current) return;
    
    articleContentRef.current.focus();
    
    setTimeout(() => {
      if (articleContentRef.current) {
        const url = prompt('Enter URL:');
        if (url) {
          const success = document.execCommand('createLink', false, url);
          console.log('Link command executed:', success);
          
          const content = articleContentRef.current.innerHTML;
          setArticleFormData(prev => ({ ...prev, content }));
          articleContentRef.current.focus();
        }
      }
    }, 10);
  };

  const handleInsertImage = () => {
    if (!articleContentRef.current) return;
    
    articleContentRef.current.focus();
    
    setTimeout(() => {
      if (articleContentRef.current) {
        const url = prompt('Enter image URL:');
        if (url) {
          const success = document.execCommand('insertImage', false, url);
          console.log('Image command executed:', success);
          
          const content = articleContentRef.current.innerHTML;
          setArticleFormData(prev => ({ ...prev, content }));
          articleContentRef.current.focus();
        }
      }
    }, 10);
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
        const success = document.execCommand('insertHorizontalRule', false);
        console.log('Horizontal rule executed:', success);
        
        const content = articleContentRef.current.innerHTML;
        setArticleFormData(prev => ({ ...prev, content }));
        articleContentRef.current.focus();
      }
    }, 10);
  };

  // Article actions
  const handlePreviewArticle = () => {
    if (!articleFormData.title.trim()) {
      toast.error('Please enter an article title to preview');
      return;
    }
    
    // Create a preview article object
    const preview: Resource = {
      id: 'preview',
      title: articleFormData.title,
      description: articleFormData.excerpt || articleFormData.title,
      type: 'article',
      content: articleFormData.content,
      category: articleFormData.category,
      tags: articleFormData.tags.split(',').map(t => t.trim()).filter(t => t),
      isPublic: true,
      publisher: user?.id || '',
      // publisherName is not stored in database - use author field or current user's name for preview only
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const fileExt = coverImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
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
      
      console.log('Saving draft with content length:', cleanedContent.length);
      console.log('Content preview:', cleanedContent.substring(0, 100));

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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const fileExt = coverImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
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
      
      console.log('Publishing article with content length:', cleanedContent.length);

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
      setActiveTab('manage');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish article');
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
        // Update existing resource
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
        };
        
        // If a new file was selected, upload it first
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
        // Create new resource
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
      
      // Reset form
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
        // Update existing resource
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
          youtubeUrl: isYouTube ? youtubeUrl?.trim() : undefined,
        };
        
        // If a new file was selected (and not YouTube), upload it first
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
        // Create new resource
        if (isYouTube) {
          // Create YouTube resource
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
      
      // Reset form
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
        // Update existing resource
        const updateData: any = {
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          publisherName: editingResource.publisherName || user?.name || 'Unknown',
        };
        
        // If a new file was selected, upload it first
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
        // Create new resource
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
      
      // Reset form
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
                            {resource.publisherName ? `by ${resource.publisherName}` : resource.publisher === user?.id ? 'by You' : 'by Unknown'}
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

            {/* Drafts Section */}
            {(() => {
              const drafts = resources.filter(r => r.type === 'article' && !r.isPublic && r.publisher === user?.id);
              if (drafts.length === 0) return null;
              
              return (
                <AnimatedCard className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Draft Articles</h3>
                        <p className="text-sm text-muted-foreground">
                          {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} saved
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Load draft into editor
                          setEditingDraftId(draft.id);
                          setArticleFormData({
                            title: draft.title,
                            excerpt: draft.description || '',
                            content: draft.content || '',
                            category: draft.category || '',
                            readingTime: draft.readingTime || '',
                            author: draft.publisherName || user?.name || '', // Load saved publisher name or fallback to current user
                            tags: draft.tags.join(', '),
                          });
                          // Load cover image if exists
                          if (draft.thumbnail) {
                            setCoverImage({ file: null, preview: draft.thumbnail });
                          } else {
                            setCoverImage({ file: null, preview: null });
                          }
                          // Switch to article editor tab
                          setActiveTab('create-article');
                          // Force content to load after a brief delay to ensure DOM is ready
                          setTimeout(() => {
                            if (articleContentRef.current && draft.content) {
                              const currentContent = articleContentRef.current.innerHTML.trim();
                              if (!currentContent || currentContent === '<br>' || currentContent === '') {
                                articleContentRef.current.innerHTML = draft.content;
                              }
                            }
                          }, 200);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{draft.title || 'Untitled Draft'}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {draft.description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {new Date(draft.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Set editing draft ID first
                              setEditingDraftId(draft.id);
                              // Set form data with draft content
                              setArticleFormData({
                                title: draft.title,
                                excerpt: draft.description || '',
                                content: draft.content || '',
                                category: draft.category || '',
                                readingTime: draft.readingTime || '',
                                author: draft.publisherName || user?.name || '', // Load saved publisher name or fallback to current user
                                tags: draft.tags.join(', '),
                              });
                              // Load cover image if exists
                              if (draft.thumbnail) {
                                setCoverImage({ file: null, preview: draft.thumbnail });
                              } else {
                                setCoverImage({ file: null, preview: null });
                              }
                              // Switch to article editor tab
                              setActiveTab('create-article');
                              // Force content to load after a brief delay to ensure DOM is ready
                              setTimeout(() => {
                                if (articleContentRef.current && draft.content) {
                                  const currentContent = articleContentRef.current.innerHTML.trim();
                                  if (!currentContent || currentContent === '<br>' || currentContent === '') {
                                    articleContentRef.current.innerHTML = draft.content;
                                  }
                                }
                              }, 200);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Continue Editing
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this draft?')) {
                                try {
                                  await deleteResource(draft.id);
                                  toast.success('Draft deleted');
                                } catch (error) {
                                  toast.error('Failed to delete draft');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              );
            })()}

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
                    onClick={() => {
                      setEditingDraftId(null);
                      setActiveTab('create-article');
                    }}
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
                onClick={() => {
                  setEditingResource(null);
                  setActiveTab('manage');
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
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('manage');
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
                  setActiveTab('manage');
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
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('manage');
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
                  setActiveTab('manage');
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
                <Button variant="outline" onClick={() => {
                  setEditingResource(null);
                  setActiveTab('manage');
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
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handlePublishArticle}
                >
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
                              if (coverImage.preview) {
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
                        >
                          <Upload className="h-4 w-4" />
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

                    {/* Editor Content Area */}
                      <div className="min-h-[500px]">
                        <div
                          ref={articleContentRef}
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => {
                            // Ensure editor is ready when focused
                            if (articleContentRef.current && !articleContentRef.current.innerHTML.trim()) {
                              articleContentRef.current.innerHTML = '<br>';
                            }
                          }}
                          onInput={(e) => {
                            const content = e.currentTarget.innerHTML;
                            // Always update to ensure state is in sync
                            setArticleFormData(prev => ({ ...prev, content }));
                          }}
                          onBlur={(e) => {
                            const content = e.currentTarget.innerHTML;
                            setArticleFormData(prev => ({ ...prev, content }));
                          }}
                          onPaste={(e) => {
                            // Allow default paste behavior first to maintain undo history
                            // Then clean up the pasted content and update state
                            
                            // Use requestAnimationFrame to ensure paste completes first
                            requestAnimationFrame(() => {
                              // Use setTimeout to ensure DOM is updated
                              setTimeout(() => {
                                if (!articleContentRef.current) return;
                                
                                // Clean up all color styles in the entire editor
                                const allElements = articleContentRef.current.querySelectorAll('*');
                                allElements.forEach((el) => {
                                  const element = el as HTMLElement;
                                  
                                  // Remove color and background-color from inline styles
                                  if (element.style.color) {
                                    element.style.removeProperty('color');
                                  }
                                  if (element.style.backgroundColor) {
                                    element.style.removeProperty('background-color');
                                  }
                                  
                                  // Clean up style attribute
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
                                  
                                  // Remove color attribute
                                  element.removeAttribute('color');
                                });
                                
                                // Update state with the cleaned content
                                const content = articleContentRef.current.innerHTML;
                                setArticleFormData(prev => {
                                  // Force update even if content appears the same
                                  return { ...prev, content };
                                });
                              }, 10);
                            });
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
                        [contenteditable] p,
                        [contenteditable] div,
                        [contenteditable] span,
                        [contenteditable] h1,
                        [contenteditable] h2,
                        [contenteditable] h3,
                        [contenteditable] h4,
                        [contenteditable] h5,
                        [contenteditable] h6,
                        [contenteditable] li,
                        [contenteditable] ul,
                        [contenteditable] ol,
                        [contenteditable] strong,
                        [contenteditable] b,
                        [contenteditable] em,
                        [contenteditable] i,
                        [contenteditable] u,
                        [contenteditable] s {
                          color: inherit !important;
                        }
                        /* Ensure headings are visible and styled */
                        [contenteditable] h1 {
                          font-size: 2em;
                          font-weight: bold;
                          margin: 0.67em 0;
                          color: inherit !important;
                        }
                        [contenteditable] h2 {
                          font-size: 1.5em;
                          font-weight: bold;
                          margin: 0.75em 0;
                          color: inherit !important;
                        }
                        [contenteditable] h3 {
                          font-size: 1.17em;
                          font-weight: bold;
                          margin: 0.83em 0;
                          color: inherit !important;
                        }
                        /* Ensure lists are visible */
                        [contenteditable] ul,
                        [contenteditable] ol {
                          margin: 1em 0;
                          padding-left: 2em;
                          color: inherit !important;
                        }
                        [contenteditable] li {
                          margin: 0.5em 0;
                          color: inherit !important;
                        }
                        /* Ensure strong/bold is visible */
                        [contenteditable] strong,
                        [contenteditable] b {
                          font-weight: bold;
                          color: inherit !important;
                        }
                        /* Ensure italic is visible */
                        [contenteditable] em,
                        [contenteditable] i {
                          font-style: italic;
                          color: inherit !important;
                        }
                        /* Ensure underline is visible */
                        [contenteditable] u {
                          text-decoration: underline;
                          color: inherit !important;
                        }
                        /* Ensure strikethrough is visible */
                        [contenteditable] s,
                        [contenteditable] strike,
                        [contenteditable] del {
                          text-decoration: line-through;
                          color: inherit !important;
                        }
                        /* Override any inline styles with black color */
                        [contenteditable] [style*="color: black"],
                        [contenteditable] [style*="color:#000"],
                        [contenteditable] [style*="color:#000000"],
                        [contenteditable] [style*="color: rgb(0, 0, 0)"],
                        [contenteditable] [style*="color: rgba(0, 0, 0"] {
                          color: inherit !important;
                        }
                      `}</style>
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
                      value={articleFormData.tags}
                      onChange={(e) => setArticleFormData(prev => ({ ...prev, tags: e.target.value }))}
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
                          <input 
                            type="checkbox" 
                            className="toggle" 
                            checked={articleSettings.allowComments}
                            onChange={(e) => setArticleSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Featured Article</p>
                            <p className="text-xs text-muted-foreground">Show this article prominently in the library</p>
                          </div>
                          <input 
                            type="checkbox" 
                            className="toggle" 
                            checked={articleSettings.featuredArticle}
                            onChange={(e) => setArticleSettings(prev => ({ ...prev, featuredArticle: e.target.checked }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">SEO Description</label>
                          <Textarea 
                            placeholder="Optional: Custom description for search engines..." 
                            rows={2}
                            className="text-sm"
                            value={articleSettings.seoDescription}
                            onChange={(e) => setArticleSettings(prev => ({ ...prev, seoDescription: e.target.value }))}
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


      {/* Article Editor */}
      {editingArticle && (
        <ArticleEditor
          article={editingArticle ? convertToUIResource(editingArticle) : null}
          isOpen={isArticleEditorOpen}
          onClose={handleCloseArticleEditor}
          onSave={handleSaveArticle as any}
        />
      )}

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
            content: viewingArticle.content,
            description: viewingArticle.description,
            publisher: viewingArticle.publisher,
            publisherName: viewingArticle.publisherName,
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