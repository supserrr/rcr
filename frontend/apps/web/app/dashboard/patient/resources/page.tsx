'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModal } from '@workspace/ui/components/resource-viewer-modal';
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
import { Search, Filter, Play, FileText, Video, BookOpen, Download } from 'lucide-react';
import { dummyResources } from '../../../../lib/dummy-data';
import { Resource } from '../../../../lib/types';

export default function PatientResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [savedResources, setSavedResources] = useState<string[]>([]); // Track saved resource IDs

  const resourceTypes = ['all', 'audio', 'pdf', 'video', 'article'];

  const filteredResources = dummyResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getResourcesByType = (type: string) => {
    if (type === 'all') return filteredResources;
    return filteredResources.filter(resource => resource.type === type);
  };

  const getSavedResources = () => {
    return dummyResources.filter(resource => savedResources.includes(resource.id));
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  };

  const handleDownloadResource = (resource: Resource) => {
    console.log('Download resource:', resource.title);
    // Implement download logic
  };

  const handleShareResource = (resource: Resource) => {
    console.log('Share resource:', resource.title);
    // Implement share logic
  };

  const handleBookmarkResource = (resource: Resource) => {
    console.log('Bookmark resource:', resource.title);
    // Toggle saved state
    setSavedResources(prev => 
      prev.includes(resource.id) 
        ? prev.filter(id => id !== resource.id)
        : [...prev, resource.id]
    );
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

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Resources"
        description="Access educational materials, guided meditations, and helpful articles"
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resource Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="article" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Articles
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
            {getResourcesByType('all').length > 0 ? (
              <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                {getResourcesByType('all').map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={handleViewResource}
                    onDownload={handleDownloadResource}
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
                    resource={resource}
                    onView={handleViewResource}
                    onDownload={handleDownloadResource}
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
                  variant="outline" 
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
              {getResourcesByType(type).length > 0 ? (
                <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                  {getResourcesByType(type).map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onView={handleViewResource}
                      onDownload={handleDownloadResource}
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
                    variant="outline" 
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
        <ResourceViewerModal
          resource={selectedResource}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onDownload={handleDownloadResource}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
        />
      )}
    </div>
  );
}
