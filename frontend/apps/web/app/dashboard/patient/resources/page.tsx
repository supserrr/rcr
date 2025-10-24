'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
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
  const [activeTab, setActiveTab] = useState('all');

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

  const handleViewResource = (resource: Resource) => {
    console.log('View resource:', resource.title);
    // Implement resource viewing logic
  };

  const handleDownloadResource = (resource: Resource) => {
    console.log('Download resource:', resource.title);
    // Implement download logic
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All
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

        {resourceTypes.map((type) => (
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
                    {type === 'all' ? 'All resources' : `${type.charAt(0).toUpperCase() + type.slice(1)} resources`}
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
                    {type === 'all' 
                      ? 'Try adjusting your search criteria' 
                      : `No ${type} resources available at the moment`
                    }
                  </p>
                  {type !== 'all' && (
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('all')}
                    >
                      View All Resources
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Access Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Daily Meditation</p>
                <p className="text-xs text-muted-foreground">5 min audio</p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Breathing Exercises</p>
                <p className="text-xs text-muted-foreground">10 min video</p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Treatment Guide</p>
                <p className="text-xs text-muted-foreground">PDF download</p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Latest Articles</p>
                <p className="text-xs text-muted-foreground">Updated weekly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
