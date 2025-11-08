'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Award
} from 'lucide-react';
import { ResourceViewerModalV2 } from '../../../../components/viewers/resource-viewer-modal-v2';
import { Resource } from '@/lib/api/resources';
import { useResources } from '../../../../hooks/useResources';
import { ResourcesApi } from '../../../../lib/api/resources';
import { toast } from 'sonner';

export default function AdminTrainingResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedType, setSelectedType] = useState<'all' | string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'course' as 'course' | 'workshop' | 'video' | 'document' | 'presentation',
    category: '',
    duration: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    instructor: '',
    learningObjectives: '',
    tags: ''
  });

  // Load training resources (public resources)
  const { resources, loading, createResource, updateResource, deleteResource } = useResources({ isPublic: true });

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

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      if (isEditing && editingResource) {
        await updateResource(editingResource.id, {
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type as any,
          tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        toast.success('Training resource updated successfully!');
      } else {
        await createResource({
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type as any,
          tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic: true,
        });
        toast.success('Training resource uploaded successfully!');
      }
      setIsUploadModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setUploadForm({
      title: resource.title,
      description: resource.description || '',
      type: resource.type as any,
      category: resource.tags?.[0] || '',
      duration: '',
      difficulty: 'Beginner',
      instructor: resource.publisher || '',
      learningObjectives: '',
      tags: resource.tags?.join(', ') || ''
    });
    setIsEditing(true);
    setIsUploadModalOpen(true);
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this training resource?')) return;
    
    try {
      await deleteResource(resourceId);
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
      toast.success(`${resource.title} ${next ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Error toggling resource status:', error);
      toast.error('Failed to update resource status. Please try again.');
    }
  };

  const resetForm = () => {
    setUploadForm({
      title: '',
      description: '',
      type: 'course',
      category: '',
      duration: '',
      difficulty: 'Beginner',
      instructor: '',
      learningObjectives: '',
      tags: ''
    });
    setIsEditing(false);
    setEditingResource(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'workshop': return <Users className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Training Resources"
        description="Manage training materials for counselor development"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.length}
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
              {/* Note: View count not in Resource type, would need to be added */}
              {resources.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All time views
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
              {resources.filter(r => r.isPublic).length}
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

        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
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
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={selectedIds.size === 0}>
              Bulk Delete
            </Button>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
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

      {/* Upload/Edit Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-muted-foreground">
                  {isEditing ? 'Edit' : 'Upload'} Training Resource
                </span>
                <h3 className="text-lg font-semibold">
                  {isEditing ? 'Update Resource' : 'Add New Resource'}
                </h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the training resource information' : 'Upload a new training resource for counselors'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Enter resource title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor *</label>
                <Input
                  placeholder="Enter instructor name"
                  value={uploadForm.instructor}
                  onChange={(e) => setUploadForm({...uploadForm, instructor: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Enter resource description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <Select value={uploadForm.type} onValueChange={(value: any) => setUploadForm({...uploadForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Input
                  placeholder="e.g., Psychology"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration *</label>
                <Input
                  placeholder="e.g., 4 hours"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm({...uploadForm, duration: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty *</label>
                <Select value={uploadForm.difficulty} onValueChange={(value: any) => setUploadForm({...uploadForm, difficulty: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="e.g., psychology, fundamentals, cancer"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Learning Objectives</label>
              <Textarea
                placeholder="Enter learning objectives (one per line)"
                value={uploadForm.learningObjectives}
                onChange={(e) => setUploadForm({...uploadForm, learningObjectives: e.target.value})}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File Upload *</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, MP4, PPT files up to 100MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {setIsUploadModalOpen(false); resetForm();}}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Resource' : 'Upload Resource'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
