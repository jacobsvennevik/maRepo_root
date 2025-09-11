'use client';

import React, { useState, useEffect } from 'react';
import { axiosApi } from "@/lib/axios-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Target, Plus, BarChart3, Play, Edit, Trash2 } from 'lucide-react';

interface DiagnosticSession {
  id: string;
  topic: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  delivery_mode: 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK';
  scheduled_for?: string;
  due_at?: string;
  max_questions: number;
  created_at: string;
  participation_rate?: number;
  average_score?: number;
}

interface CreateDiagnosticForm {
  topic: string;
  delivery_mode: 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK';
  max_questions: number;
  difficulty: number;
  scheduled_for?: string;
  due_at?: string;
}

export default function DiagnosticDashboard({ projectId }: { projectId: string }) {
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDiagnosticForm>({
    topic: '',
    delivery_mode: 'DEFERRED_FEEDBACK',
    max_questions: 3,
    difficulty: 2,
  });

  useEffect(() => {
    fetchDiagnosticSessions();
  }, [projectId]);

  const fetchDiagnosticSessions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosApi.get(`/diagnostic-sessions/?project=${projectId}`);
      const data = response.data;
      setSessions(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch diagnostic sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiagnostic = async () => {
    try {
      setIsLoading(true);
      const response = await axiosApi.post('/diagnostics/generate/', {
        project_id: projectId,
        topic: formData.topic,
        difficulty: formData.difficulty,
        delivery_mode: formData.delivery_mode,
        max_questions: formData.max_questions,
        scheduled_for: formData.scheduled_for,
        due_at: formData.due_at,
      });

      if (response.status >= 200 && response.status < 300) {
        const newSession = response.data;
        setSessions(prev => [newSession, ...prev]);
        setIsCreateDialogOpen(false);
        setFormData({
          topic: '',
          delivery_mode: 'DEFERRED_FEEDBACK',
          max_questions: 3,
          difficulty: 2,
        });
      }
    } catch (error) {
      console.error('Failed to create diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'secondary',
      OPEN: 'default',
      CLOSED: 'destructive',
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getDeliveryModeLabel = (mode: string) => {
    return mode === 'IMMEDIATE_FEEDBACK' ? 'Immediate Feedback' : 'Deferred Feedback';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pre-Lecture Diagnostics</h2>
          <p className="text-muted-foreground">
            Assess student readiness and identify knowledge gaps before lectures
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Diagnostic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Diagnostic</DialogTitle>
              <DialogDescription>
                Generate a pre-lecture diagnostic to assess student knowledge
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Thermodynamics Fundamentals"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_mode">Feedback Mode</Label>
                  <DropdownMenu>
                    <Select
                      value={formData.delivery_mode}
                      onValueChange={(value: string) => 
                        setFormData(prev => ({ ...prev, delivery_mode: value as 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK' }))
                      }
                    >
                      <SelectTrigger id="delivery_mode">
                        <SelectValue placeholder={formData.delivery_mode === 'IMMEDIATE_FEEDBACK' ? 'Immediate Feedback' : 'Deferred Feedback'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE_FEEDBACK">Immediate Feedback</SelectItem>
                        <SelectItem value="DEFERRED_FEEDBACK">Deferred Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </DropdownMenu>
                </div>
                <div>
                  <Label htmlFor="max_questions">Questions</Label>
                  <DropdownMenu>
                    <Select
                      value={formData.max_questions.toString()}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, max_questions: parseInt(value) }))
                      }
                    >
                      <SelectTrigger id="max_questions">
                        <SelectValue placeholder={`${formData.max_questions} Questions`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </DropdownMenu>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_for">Scheduled For</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={formData.scheduled_for || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="due_at">Due By</Label>
                  <Input
                    id="due_at"
                    type="datetime-local"
                    value={formData.due_at || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_at: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDiagnostic} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Diagnostic'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <DiagnosticSessionCard
                key={session.id}
                session={session}
                onRefresh={fetchDiagnosticSessions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.filter(s => s.status === 'DRAFT').map((session) => (
              <DiagnosticSessionCard
                key={session.id}
                session={session}
                onRefresh={fetchDiagnosticSessions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.filter(s => s.status === 'OPEN').map((session) => (
              <DiagnosticSessionCard
                key={session.id}
                session={session}
                onRefresh={fetchDiagnosticSessions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.filter(s => s.status === 'CLOSED').map((session) => (
              <DiagnosticSessionCard
                key={session.id}
                session={session}
                onRefresh={fetchDiagnosticSessions}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {sessions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No diagnostic sessions yet</h3>
          <p className="mt-2 text-muted-foreground">
            Create your first diagnostic to start assessing student readiness
          </p>
        </div>
      )}
    </div>
  );
}

function DiagnosticSessionCard({ 
  session, 
  onRefresh 
}: { 
  session: DiagnosticSession; 
  onRefresh: () => void;
}) {
  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'secondary',
      OPEN: 'default',
      CLOSED: 'destructive',
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getDeliveryModeLabel = (mode: string) => {
    return mode === 'IMMEDIATE_FEEDBACK' ? 'Immediate Feedback' : 'Deferred Feedback';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleTimeString();
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axiosApi.patch(`/diagnostic-sessions/${session.id}/`, { status: newStatus });
      onRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this diagnostic session?')) return;
    
    try {
      await axiosApi.delete(`/diagnostic-sessions/${session.id}/`);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.topic}</CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(session.status)}
              <Badge variant="outline">{getDeliveryModeLabel(session.delivery_mode)}</Badge>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => handleStatusChange('OPEN')}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(session.scheduled_for)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(session.due_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Questions: {session.max_questions}</span>
          <span className="text-muted-foreground">
            Created: {formatDate(session.created_at)}
          </span>
        </div>

        {session.participation_rate !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Participation</span>
              <span>{Math.round(session.participation_rate * 100)}%</span>
            </div>
            <Progress value={session.participation_rate * 100} className="h-2" />
          </div>
        )}

        {session.average_score !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span>Average Score</span>
            <span className="font-medium">{Math.round(session.average_score * 100)}%</span>
          </div>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="mr-2 h-4 w-4" />
            Responses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
