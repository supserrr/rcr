'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { ArticleViewerV2 } from '../../../../components/viewers/article-viewer-v2';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Search, 
  Filter, 
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
  Play,
  CheckCircle,
  Bookmark,
  Share2
} from 'lucide-react';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi, type Resource as ResourceType } from '../../../../lib/api/resources';
import { toast } from 'sonner';

export default function CounselorTrainingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedType, setSelectedType] = useState<'all' | string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'downloads' | 'rating' | 'createdAt'>('relevance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<any>(null);
  const [completedResources, setCompletedResources] = useState<Set<string>>(() => new Set<string>(JSON.parse(localStorage.getItem('completedTraining') || '[]')));
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(() => new Set<string>(JSON.parse(localStorage.getItem('bookmarkedTraining') || '[]')));

  // Load training resources (public resources)
  const { resources, loading } = useResources({ isPublic: true });

  // Convert API Resource to UI Resource type
  const convertToUIResource = (apiResource: ResourceType): any => {
    return {
      ...apiResource,
      createdAt: new Date(apiResource.createdAt),
      url: apiResource.url || '',
      views: 0,
      downloads: (apiResource as any).downloadCount || 0,
      updatedAt: new Date(apiResource.createdAt),
    };
  };

  // Get unique categories, types from resources
  const categories = ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];
  const types = ['all', ...new Set(resources.map(r => r.type).filter(Boolean))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']; // Note: difficulty not in Resource type

  const filteredResources = resources.filter(resource => {
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((resource as any).instructor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all'; // Note: difficulty not in Resource type
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'title': return (a.title || '').localeCompare(b.title || '') * dir;
      case 'downloads': return (((a as any).downloadCount || 0) - ((b as any).downloadCount || 0)) * dir;
      case 'rating': return (((a as any).rating || 0) - ((b as any).rating || 0)) * dir;
      case 'createdAt': return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case 'relevance':
      default: return 0;
    }
  });

  const handleViewDetails = (resource: ResourceType) => {
    setSelectedResource(resource);
    setIsViewerOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  };

  const handleDownload = async (resource: ResourceType) => {
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

  const handleToggleBookmark = (resourceId: string) => {
    setBookmarkedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      localStorage.setItem('bookmarkedTraining', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleMarkComplete = (resourceId: string) => {
    setCompletedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      localStorage.setItem('completedTraining', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-5 w-5" />;
      case 'workshop': return <Users className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'presentation': return <Presentation className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
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

  const completedCount = completedResources.size;
  const totalResources = resources.length;
  const progressPercentage = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Professional Development"
        description="Access training resources to enhance your counseling skills"
      />

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{totalResources}
            </div>
            <p className="text-xs text-muted-foreground">
              Resources completed
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookmarkedResources.size}
            </div>
            <p className="text-xs text-muted-foreground">
              Saved resources
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalResources}
            </div>
            <p className="text-xs text-muted-foreground">
              Training resources
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search training resources..."
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
              <SelectItem key={category || 'all'} value={category || 'all'}>
                {category === 'all' ? 'All Categories' : category || 'All'}
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

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-44 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortDir} onValueChange={(v: any) => setSortDir(v)}>
            <SelectTrigger className="w-28 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resources */}
      <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={convertToUIResource(resource)}
              onView={(res: any) => handleViewDetails(resource)}
              onDownload={() => handleDownload(resource)}
              delay={0}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No training resources found</p>
          </div>
        )}
      </AnimatedGrid>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {totalResources} resources
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
        </div>
      </div>

      {/* Resource Viewer Modal (shared) */}
      {selectedResource && (
        <ResourceViewerModalV2
          resource={convertToUIResource(selectedResource)}
          isOpen={isViewerOpen}
          onClose={() => { setIsViewerOpen(false); setSelectedResource(null); }}
          onDownload={(r: any) => selectedResource && handleDownload(selectedResource)}
          onShare={(r: any) => alert(`Share: ${selectedResource?.title || 'Resource'}`)}
          onBookmark={(r: any) => selectedResource && handleToggleBookmark(selectedResource.id)}
          onViewArticle={(r: any) => {
            if (!selectedResource) return;
            setViewingArticle({
              id: selectedResource.id,
              title: selectedResource.title,
              content: selectedResource.content || selectedResource.description || '',
              description: selectedResource.description,
              publisher: selectedResource.publisher,
              createdAt: selectedResource.createdAt,
              thumbnail: selectedResource.thumbnail,
              tags: selectedResource.tags || []
            });
            setIsViewerOpen(false);
            setIsArticleViewerOpen(true);
          }}
        />
      )}

      {/* Article Viewer */}
      <ArticleViewerV2
        article={viewingArticle}
        isOpen={isArticleViewerOpen}
        onClose={() => setIsArticleViewerOpen(false)}
        onShare={(article) => alert(`Share article: ${article?.title}`)}
        onBookmark={() => viewingArticle && handleToggleBookmark(viewingArticle.id)}
        onDownload={() => selectedResource && handleDownload(selectedResource)}
      />
    </div>
  );
}
