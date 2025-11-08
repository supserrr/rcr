'use client';

import React, { useState, useMemo } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Search, Filter, Play, FileText, Video, BookOpen, Download, SortAsc, SortDesc, Grid3X3, List, RefreshCw } from 'lucide-react';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi, type Resource } from '../../../../lib/api/resources';
import { toast } from 'sonner';

export default function PatientResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [savedResources, setSavedResources] = useState<string[]>([]); // Track saved resource IDs
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'views' | 'downloads'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const resourceTypes = ['all', 'audio', 'pdf', 'video', 'article'] as const;

  // Build query parameters based on filters
  const queryParams = useMemo(() => {
    const params: {
      type?: 'audio' | 'pdf' | 'video' | 'article';
      search?: string;
      isPublic?: boolean;
      sortBy?: 'title' | 'created_at' | 'views' | 'downloads';
      sortOrder?: 'asc' | 'desc';
    } = {
      isPublic: true, // Only show public resources for patients
      sortBy,
      sortOrder,
    };

    if (selectedType !== 'all') {
      params.type = selectedType as 'audio' | 'pdf' | 'video' | 'article';
    }

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    return params;
  }, [selectedType, searchTerm, sortBy, sortOrder]);

  // Load resources using the hook
  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    refreshResources,
  } = useResources(queryParams);

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

  // Filter resources based on active tab
  const filteredResources = useMemo(() => {
    if (activeTab === 'saved') {
      return resources.filter(resource => savedResources.includes(resource.id));
    }
    return resources;
  }, [resources, activeTab, savedResources]);

  const getResourcesByType = (type: string) => {
    if (type === 'all') return filteredResources;
    return filteredResources.filter(resource => resource.type === type);
  };

  const getSavedResources = () => {
    return resources.filter(resource => savedResources.includes(resource.id));
  };


  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setViewingArticle(null);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
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

  const handleRefresh = async () => {
    await refreshResources();
    toast.success('Resources refreshed');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Play className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (resourcesError) {
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
        title="Resources"
        description="Access educational materials, guided meditations, and helpful articles"
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
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

      {/* Resource Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Saved</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden md:inline">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden md:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger value="article" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Articles</span>
          </TabsTrigger>
        </TabsList>

        {/* All Resources Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {getResourcesByType('all').length} resource{getResourcesByType('all').length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">All resources</span>
              </div>
            </div>

            {/* Resources Grid */}
            {resourcesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : getResourcesByType('all').length > 0 ? (
              <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                {getResourcesByType('all').map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={convertToUIResource(resource)}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    delay={index * 0.1}
                  />
                ))}
              </AnimatedGrid>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Saved Resources Tab */}
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
              <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                {getSavedResources().map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={convertToUIResource(resource)}
                    onView={(r: any) => handleViewResource(resource)}
                    onDownload={(r: any) => handleDownloadResource(resource)}
                    delay={index * 0.1}
                  />
                ))}
              </AnimatedGrid>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No saved resources</h3>
                <p className="text-muted-foreground mb-4">
                  Save resources by clicking the bookmark icon when viewing them
                </p>
                <Button 
                  onClick={() => setActiveTab('all')}
                >
                  Browse All Resources
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other Resource Type Tabs */}
        {resourceTypes.filter(type => type !== 'all').map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="space-y-4">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {getResourcesByType(type).length} resource{getResourcesByType(type).length !== 1 ? 's' : ''} found
                </p>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {type.charAt(0).toUpperCase() + type.slice(1)} resources
                  </span>
                </div>
              </div>

              {/* Resources Grid */}
              {resourcesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : getResourcesByType(type).length > 0 ? (
                <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                  {getResourcesByType(type).map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={convertToUIResource(resource)}
                      onView={(r: any) => handleViewResource(resource)}
                      onDownload={(r: any) => handleDownloadResource(resource)}
                      delay={index * 0.1}
                    />
                  ))}
                </AnimatedGrid>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    {getTypeIcon(type)}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No {type} resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    No {type} resources available at the moment
                  </p>
                  <Button 
                    onClick={() => setActiveTab('all')}
                  >
                    View All Resources
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
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
          onViewArticle={(r: any) => {
            setViewingArticle(selectedResource);
            setIsViewerOpen(false);
            setIsArticleViewerOpen(true);
          }}
            />
          )}

          {/* Article Viewer */}
      {viewingArticle && (
          <ArticleViewerV2
          article={convertToUIResource(viewingArticle)}
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
