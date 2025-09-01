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
  TrendingUp
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

interface MindMap {
  id: string;
  title: string;
  subject: string;
  nodeCount: number;
  lastEdited: string;
  created: string;
  status: 'recent' | 'active' | 'archived';
  color: string;
  bgColor: string;
  borderColor: string;
  progress: number;
  isAIGenerated: boolean;
}

export default function ProjectMindMaps() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterSubject, setFilterSubject] = useState('all');

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
      isAIGenerated: true
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
      isAIGenerated: false
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
      isAIGenerated: true
    },
    {
      id: '4',
      title: 'History: World War II',
      subject: 'History',
      nodeCount: 28,
      lastEdited: '5 days ago',
      created: '3 weeks ago',
      status: 'archived',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50/80 backdrop-blur-sm',
      borderColor: 'border-orange-200/50',
      progress: 90,
      isAIGenerated: false
    }
  ];

  const recentMindMap = mindMaps[0]; // Most recent mind map for hero banner

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'biology': return '🧬';
      case 'chemistry': return '🧪';
      case 'physics': return '⚛️';
      case 'history': return '📜';
      case 'math': return '📐';
      default: return '📚';
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recent': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Mind Maps</span>
      </div>

      {/* Hero Banner - Continue Your Mind Map */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50/80 backdrop-blur-sm border-blue-200/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
            <div className="absolute top-4 right-4">
              <div className="animate-pulse">
                <div className="w-3 h-3 bg-blue-400 rounded-full mb-1"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full mb-1"></div>
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
                      <Network className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">Continue Your Mind Map</h1>
                      <p className="text-slate-600">Pick up where you left off</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSubjectIcon(recentMindMap.subject)}</span>
                      <span>{recentMindMap.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Last edited {recentMindMap.lastEdited}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>{recentMindMap.nodeCount} nodes</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">{recentMindMap.progress}%</div>
                      <div className="text-xs">Complete</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
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
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Bar */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50 sticky top-4 z-10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Quick Actions</h3>
              <p className="text-sm text-slate-600">Create, import, or manage your mind maps</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Mind Map
              </Button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm border-blue-200/50 hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total Mind Maps</p>
                <p className="text-2xl font-bold text-slate-900">{mindMaps.length}</p>
              </div>
            </div>
            <Progress 
              value={75} 
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/80 backdrop-blur-sm border-green-200/50 hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total Nodes</p>
                <p className="text-2xl font-bold text-slate-900">102</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Growing knowledge</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/80 backdrop-blur-sm border-purple-200/50 hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">AI Generated</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Smart assistance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/80 backdrop-blur-sm border-orange-200/50 hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Avg Progress</p>
                <p className="text-2xl font-bold text-slate-900">70%</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Great progress!</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Sort Controls */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search mind maps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="recent">Sort by Recent</option>
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
              </select>
              <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Subjects</option>
                <option value="biology">Biology</option>
                <option value="chemistry">Chemistry</option>
                <option value="physics">Physics</option>
                <option value="history">History</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-600">
                <Network className="h-4 w-4 mr-2" />
                Grid View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mind Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mindMaps.map((mindMap) => (
          <Card 
            key={mindMap.id}
            className={`${mindMap.bgColor} ${mindMap.borderColor} border-2 hover:shadow-xl transition-all duration-500 cursor-pointer group`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${mindMap.color} shadow-md`}>
                    <span className="text-white text-lg">{getSubjectIcon(mindMap.subject)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mindMap.title}
                    </h3>
                    <Badge className={`${getStatusColor(mindMap.status)} text-xs`}>
                      {mindMap.status}
                    </Badge>
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
                    <Clock className="h-3 w-3" />
                    <span>{mindMap.lastEdited}</span>
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

      {/* Empty State (commented out since we have data) */}
      {mindMaps.length === 0 && (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <Network className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">You haven't created any mind maps yet!</h3>
                <p className="text-slate-600 mb-6">Start organizing your thoughts and ideas with interactive mind maps</p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mind Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}