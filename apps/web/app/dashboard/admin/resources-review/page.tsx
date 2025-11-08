'use client';

import React, { useState, useMemo } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { ResourceEditModal } from '@workspace/ui/components/resource-edit-modal';
import { ArticleEditor } from '@workspace/ui/components/article-editor';
import { ArticleViewerV2 } from '../../../../components/viewers/article-viewer-v2';
import { Input } from '@workspace/ui/components/input';
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
  User
} from 'lucide-react';
import { Resource } from '@/lib/api/resources';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi } from '../../../../lib/api/resources';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { toast } from 'sonner';

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
  const { resources, loading, updateResource, deleteResource } = useResources();
  
  // Modal states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingArticle, setEditingArticle] = useState<Resource | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

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
    if (resource.type === 'article') {
      setEditingArticle(resource);
      setIsArticleEditorOpen(true);
    } else {
      setEditingResource(resource);
      setIsEditOpen(true);
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
        tags: updatedResource.tags,
        isPublic: updatedResource.isPublic,
      });
      toast.success('Resource updated successfully!');
      setIsEditOpen(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource. Please try again.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Resources Review"
        description="Review, edit, publish, unpublish, and manage resources from counselors"
      />

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
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
                  {resources.filter(r => r.isPublic).length}
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
                  {resources.filter(r => !r.isPublic).length}
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
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredResources.length}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
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

      {/* Resource Edit Modal */}
      {editingResource && (
        <ResourceEditModal
          resource={convertToUIResource(editingResource)}
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveResource}
          onDelete={handleDeleteResource}
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

