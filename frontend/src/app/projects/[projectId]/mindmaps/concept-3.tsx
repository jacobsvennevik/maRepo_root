'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Network, 
  Download, 
  Upload, 
  List, 
  Sparkles,
  MoreVertical,
  Play,
  Copy,
  Share2,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  Brain,
  Zap,
  Star,
  Eye,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  FolderOpen,
  Folder,
  Archive,
  CheckCircle,
  AlertCircle,
  Clock4,
  Users,
  Globe,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MindMap {
  id: string;
  title: string;
  subject: string;
  nodeCount: number;
  lastEdited: string;
  created: string;
  status: 'recent' | 'active' | 'archived' | 'completed';
  color: string;
  bgColor: string;
  borderColor: string;
  progress: number;
  isAIGenerated: boolean;
  description: string;
  collaborators: number;
  views: number;
  category: 'personal' | 'shared' | 'template';
}

export default function ProjectMindMapsConcept3() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for mind maps
  const mindMaps: MindMap[] = [
    {
      id: '1',
      title: 'Biology: Cell Structure',
      subject: 'Biology',
      nodeCount: 24,
      lastEdited: '2 hours ago',
      created: '3 days ago',
      status: 'recent',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50/80 backdrop-blur-sm',
      borderColor: 'border-blue-200/50',
      progress: 85,
      isAIGenerated: true,
      description: 'Comprehensive overview of cellular components and their functions',
      collaborators: 3,
      views: 45,
      category: 'shared'
    },
    {
      id: '2',
      title: 'Chemistry: Periodic Table',
      subject: 'Chemistry',
      nodeCount: 32,
      lastEdited: '1 day ago',
      created: '1 week ago',
      status: 'active',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50/80 backdrop-blur-sm',
      borderColor: 'border-purple-200/50',
      progress: 60,
      isAIGenerated: false,
      description: 'Interactive exploration of elements and their properties',
      collaborators: 1,
      views: 28,
      category: 'personal'
    },
    {
      id: '3',
      title: 'Physics: Quantum Mechanics',
      subject: 'Physics',
      nodeCount: 18,
      lastEdited: '3 days ago',
      created: '2 weeks ago',
      status: 'active',
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50/80 backdrop-blur-sm',
      borderColor: 'border-emerald-200/50',
      progress: 45,
      isAIGenerated: true,
      description: 'Fundamental principles of quantum physics and wave-particle duality',
      collaborators: 2,
      views: 67,
      category: 'shared'
    },
    {
      id: '4',
      title: 'History: World War II',
      subject: 'History',
      nodeCount: 28,
      lastEdited: '5 days ago',
      created: '3 weeks ago',
      status: 'completed',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50/80 backdrop-blur-sm',
      borderColor: 'border-orange-200/50',
      progress: 100,
      isAIGenerated: false,
      description: 'Chronological timeline of major events and their global impact',
      collaborators: 5,
      views: 120,
      category: 'template'
    }
  ];

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'biology': return '🧬';
      case 'chemistry': return '🧪';
      case 'physics': return '⚛️';
      case 'history': return '📜';
      case 'math': return '📐';
      default: return '📚';
    }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recent': return <Clock4 className="h-4 w-4 text-blue-600" />;
      case 'active': return <Activity className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return <Folder className="h-4 w-4 text-blue-600" />;
      case 'shared': return <Users className="h-4 w-4 text-purple-600" />;
      case 'template': return <Globe className="h-4 w-4 text-emerald-600" />;
      default: return <FolderOpen className="h-4 w-4 text-gray-600" />;
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }

  const stats = {
    total: mindMaps.length,
    totalNodes: mindMaps.reduce((sum, map) => sum + map.nodeCount, 0),
    avgProgress: Math.round(mindMaps.reduce((sum, map) => sum + map.progress, 0) / mindMaps.length),
    aiGenerated: mindMaps.filter(map => map.isAIGenerated).length,
    totalViews: mindMaps.reduce((sum, map) => sum + map.views, 0),
    totalCollaborators: mindMaps.reduce((sum, map) => sum + map.collaborators, 0)
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Mind Maps</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mind Maps Dashboard</h1>
          <p className="text-slate-600 mt-1">Visualize and organize your knowledge</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Mind Map
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Maps</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600">
                <Network className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/80 backdrop-blur-sm border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Nodes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalNodes}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/80 backdrop-blur-sm border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Progress</p>
                <p className="text-2xl font-bold text-slate-900">{stats.avgProgress}%</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 backdrop-blur-sm border-emerald-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">AI Generated</p>
                <p className="text-2xl font-bold text-slate-900">{stats.aiGenerated}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/80 backdrop-blur-sm border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/80 backdrop-blur-sm border-cyan-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Collaborators</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCollaborators}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-600">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Quick Actions</h3>
                  <p className="text-sm text-slate-600">Create, import, or manage your mind maps</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Suggestions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Mind Maps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindMaps.slice(0, 6).map((mindMap) => (
              <Card 
                key={mindMap.id}
                className={`${mindMap.bgColor} ${mindMap.borderColor} border-2 hover:shadow-xl transition-all duration-500 cursor-pointer group`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${mindMap.color} shadow-lg`}>
                        <span className="text-white text-xl">{getSubjectIcon(mindMap.subject)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {mindMap.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(mindMap.status)} text-xs`}>
                            {mindMap.status}
                          </Badge>
                          {getCategoryIcon(mindMap.category)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mindMap.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Progress</span>
                      <span className="font-medium">{mindMap.progress}%</span>
                    </div>
                    <Progress 
                      value={mindMap.progress} 
                      className="h-2"
                      indicatorClassName={`bg-gradient-to-r ${mindMap.color}`}
                    />
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{mindMap.nodeCount} nodes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{mindMap.views} views</span>
                      </div>
                    </div>

                    {mindMap.isAIGenerated && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Generated</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Recent */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Clock4 className="h-4 w-4" />
                  Recent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mindMaps.filter(m => m.status === 'recent').map((mindMap) => (
                  <Card key={mindMap.id} className="bg-white border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSubjectIcon(mindMap.subject)}</span>
                        <h4 className="font-medium text-sm">{mindMap.title}</h4>
                      </div>
                      <Progress value={mindMap.progress} className="h-1 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{mindMap.nodeCount} nodes</span>
                        <span>{mindMap.lastEdited}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Active */}
            <Card className="bg-green-50/50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mindMaps.filter(m => m.status === 'active').map((mindMap) => (
                  <Card key={mindMap.id} className="bg-white border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSubjectIcon(mindMap.subject)}</span>
                        <h4 className="font-medium text-sm">{mindMap.title}</h4>
                      </div>
                      <Progress value={mindMap.progress} className="h-1 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{mindMap.nodeCount} nodes</span>
                        <span>{mindMap.lastEdited}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="bg-emerald-50/50 border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mindMaps.filter(m => m.status === 'completed').map((mindMap) => (
                  <Card key={mindMap.id} className="bg-white border-emerald-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSubjectIcon(mindMap.subject)}</span>
                        <h4 className="font-medium text-sm">{mindMap.title}</h4>
                      </div>
                      <Progress value={mindMap.progress} className="h-1 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{mindMap.nodeCount} nodes</span>
                        <span>{mindMap.lastEdited}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Archived */}
            <Card className="bg-gray-50/50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mindMaps.filter(m => m.status === 'archived').map((mindMap) => (
                  <Card key={mindMap.id} className="bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSubjectIcon(mindMap.subject)}</span>
                        <h4 className="font-medium text-sm">{mindMap.title}</h4>
                      </div>
                      <Progress value={mindMap.progress} className="h-1 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{mindMap.nodeCount} nodes</span>
                        <span>{mindMap.lastEdited}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mindMaps.map((mindMap) => (
                    <div key={mindMap.id} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-lg">{getSubjectIcon(mindMap.subject)}</span>
                        <span className="font-medium text-sm truncate">{mindMap.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={mindMap.progress} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{mindMap.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mindMaps.slice(0, 5).map((mindMap) => (
                    <div key={mindMap.id} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${mindMap.color}`}>
                        <span className="text-white text-sm">{getSubjectIcon(mindMap.subject)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{mindMap.title}</p>
                        <p className="text-xs text-gray-500">Updated {mindMap.lastEdited}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{mindMap.views} views</p>
                        <p className="text-xs text-gray-500">{mindMap.collaborators} collab.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Mind Map Templates</h3>
                  <p className="text-slate-600 mb-6">Coming soon! Pre-built templates for common subjects and use cases.</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}