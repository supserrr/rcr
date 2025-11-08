'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
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
  Eye, 
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Settings,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Zap,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import { dummySystemHealth, dummyMaintenanceLogs } from '../../../../lib/dummy-data';
import { SystemHealth, MaintenanceLog } from '../../../../lib/types';

export default function AdminSystemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'healthy' | 'warning' | 'critical' | 'offline'>('all');
  const [selectedComponent, setSelectedComponent] = useState<'all' | 'database' | 'api' | 'storage' | 'network' | 'security'>('all');
  const [selectedHealth, setSelectedHealth] = useState<SystemHealth | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceLog | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-refresh system health every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data from the API
      console.log('Refreshing system health data...');
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const filteredHealth = dummySystemHealth.filter(health => {
    const matchesSearch = health.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         health.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || health.status === selectedStatus;
    const matchesComponent = selectedComponent === 'all' || health.type === selectedComponent;
    
    return matchesSearch && matchesStatus && matchesComponent;
  });

  const filteredMaintenance = dummyMaintenanceLogs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewHealth = (health: SystemHealth) => {
    setSelectedHealth(health);
    setIsHealthModalOpen(true);
  };

  const handleCloseHealthModal = () => {
    setIsHealthModalOpen(false);
    setSelectedHealth(null);
  };

  // Charts removed

  const handleViewMaintenance = (log: MaintenanceLog) => {
    setSelectedMaintenance(log);
    setIsMaintenanceModalOpen(true);
  };

  const handleCloseMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setSelectedMaintenance(null);
  };

  const handleRunMaintenance = async (log: MaintenanceLog) => {
    setIsRunningMaintenance(true);
    try {
      // Simulate maintenance execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Running maintenance:', log.id);
      alert('Maintenance task completed successfully!');
    } catch (error) {
      console.error('Error running maintenance:', error);
      alert('Failed to run maintenance task. Please try again.');
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const handleRefreshHealth = async () => {
    try {
      // Simulate API call to refresh health data
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Refreshing system health...');
      alert('System health data refreshed!');
    } catch (error) {
      console.error('Error refreshing health data:', error);
      alert('Failed to refresh data. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'offline':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'api':
        return <Server className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'running':
        return <Activity className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const overallHealthStatus = dummySystemHealth.every(h => h.status === 'healthy') ? 'healthy' :
                             dummySystemHealth.some(h => h.status === 'critical') ? 'critical' : 'warning';

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="System Management"
        description="Monitor system health and manage maintenance tasks"
      />

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <div className={`p-2 rounded-lg ${overallHealthStatus === 'healthy' ? 'bg-green-100' : overallHealthStatus === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {overallHealthStatus === 'healthy' ? <CheckCircle className="h-4 w-4 text-green-600" /> : 
               overallHealthStatus === 'critical' ? <XCircle className="h-4 w-4 text-red-600" /> : 
               <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {overallHealthStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              {dummySystemHealth.filter(h => h.status === 'healthy').length} of {dummySystemHealth.length} components healthy
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dummySystemHealth.filter(h => h.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dummySystemHealth.filter(h => h.status === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need monitoring
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              99.9%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Charts removed as requested */}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleRefreshHealth} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Health Data
        </Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Settings className="h-4 w-4 mr-2" />
          System Settings
        </Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Zap className="h-4 w-4 mr-2" />
          Run Diagnostics
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search components or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedComponent} onValueChange={(value) => setSelectedComponent(value as any)}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Component" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Components</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="network">Network</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* System Health Table */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>System Health List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealth.map((health) => (
                <TableRow key={health.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getComponentIcon(health.type)}
                      <span className="font-medium">{health.component}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {health.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(health.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(health.status)}
                        {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={health.responseTime > 1000 ? 'text-red-600' : health.responseTime > 500 ? 'text-yellow-600' : 'text-green-600'}>
                      {health.responseTime}ms
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{health.lastChecked.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {health.lastChecked.toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {health.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                        onClick={() => handleViewHealth(health)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>

      {/* Maintenance Logs */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Maintenance Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {log.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMaintenanceStatusColor(log.status)}>
                      <div className="flex items-center gap-1">
                        {getMaintenanceStatusIcon(log.status)}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{log.duration}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{log.lastRun?.toLocaleDateString() || 'Never'}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.lastRun?.toLocaleTimeString() || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{log.nextRun?.toLocaleDateString() || 'Not scheduled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.nextRun?.toLocaleTimeString() || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                        onClick={() => handleViewMaintenance(log)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {log.status !== 'running' && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleRunMaintenance(log)}
                          disabled={isRunningMaintenance}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredHealth.length} health checks and {filteredMaintenance.length} maintenance tasks
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Maintenance Detail Modal */}
      {/* Health Detail Modal */}
      <Dialog open={isHealthModalOpen} onOpenChange={handleCloseHealthModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-muted-foreground">Component</span>
                <h3 className="text-lg font-semibold">{selectedHealth?.component}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedHealth && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatusColor(selectedHealth.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedHealth.status)}
                      {selectedHealth.status.charAt(0).toUpperCase() + selectedHealth.status.slice(1)}
                    </div>
                  </Badge>
                  <Badge variant="outline" className="capitalize">{selectedHealth.type}</Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedHealth && (
            <div className="space-y-6 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Performance</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>Response Time: {selectedHealth.responseTime}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Uptime: {selectedHealth.uptime}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Events</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Warnings: {selectedHealth.warningCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Errors: {selectedHealth.errorCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Last Checked</Label>
                <div className="text-sm">
                  {selectedHealth.lastChecked.toLocaleDateString()} at {selectedHealth.lastChecked.toLocaleTimeString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedHealth.description}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={handleCloseHealthModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Detail Modal */}
      <Dialog open={isMaintenanceModalOpen} onOpenChange={handleCloseMaintenanceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-muted-foreground">Maintenance Task</span>
                <h3 className="text-lg font-semibold">{selectedMaintenance?.title}</h3>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedMaintenance && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getMaintenanceStatusColor(selectedMaintenance.status)}>
                    {selectedMaintenance.status === 'running' ? 'Running' : selectedMaintenance.status.charAt(0).toUpperCase() + selectedMaintenance.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{selectedMaintenance.type}</Badge>
                  <Badge variant="outline">{selectedMaintenance.duration}</Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedMaintenance && (
            <div className="space-y-6 mt-4">
              {/* Task Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Task Details</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {selectedMaintenance.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Type: {selectedMaintenance.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Risk Level: {selectedMaintenance.riskLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Schedule Information</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last Run: {selectedMaintenance.lastRun?.toLocaleDateString() || 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Next Run: {selectedMaintenance.nextRun?.toLocaleDateString() || 'Not scheduled'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span>Frequency: {selectedMaintenance.frequency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedMaintenance.description}</p>
                </div>
              </div>

              {/* Steps */}
              {selectedMaintenance.steps && selectedMaintenance.steps.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Execution Steps</Label>
                  <div className="space-y-2">
                    {selectedMaintenance.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs */}
              {selectedMaintenance.logs && selectedMaintenance.logs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Recent Logs</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMaintenance.logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 border rounded text-xs">
                        <div className="flex-shrink-0">
                          <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.timestamp.toLocaleTimeString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.level}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={handleCloseMaintenanceModal}>
              Close
            </Button>
            {selectedMaintenance && selectedMaintenance.status !== 'running' && (
              <Button
                onClick={() => handleRunMaintenance(selectedMaintenance)}
                disabled={isRunningMaintenance}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isRunningMaintenance ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Task
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
