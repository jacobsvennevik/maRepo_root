'use client';

import React, { useState, useEffect } from 'react';
import { axiosApi } from '@/lib/axios-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Brain,
  Clock,
  Zap
} from 'lucide-react';

interface DiagnosticAnalytics {
  id: string;
  session: {
    id: string;
    topic: string;
    status: string;
    max_questions: number;
  };
  total_participants: number;
  participation_rate: number;
  average_score: number;
  median_confidence: number;
  overconfidence_rate: number;
  brier_score: number;
  concept_analytics: Record<string, {
    total_responses: number;
    correct_responses: number;
    avg_confidence: number;
    avg_score: number;
    accuracy: number;
    avg_brier: number;
  }>;
  top_misconceptions: Array<{
    concept: string;
    accuracy: number;
    total_responses: number;
    avg_confidence: number;
  }>;
  talking_points: Array<{
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface ConceptBreakdown {
  concept: string;
  accuracy: number;
  totalResponses: number;
  avgConfidence: number;
  avgScore: number;
}

export default function DiagnosticAnalytics({ sessionId }: { sessionId: string }) {
  const [analytics, setAnalytics] = useState<DiagnosticAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [sessionId]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await axiosApi.get(`diagnostics/sessions/${sessionId}/analytics/`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const response = await axiosApi.get(`diagnostics/sessions/${sessionId}/analytics/export/`, { responseType: 'blob' });
      if (response.status === 200) {
        const blob = response.data as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagnostic-analytics-${sessionId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      high: AlertTriangle,
      medium: Clock,
      low: Eye,
    };
    return icons[priority as keyof typeof icons] || Eye;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
          <p className="mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load diagnostic analytics</AlertDescription>
      </Alert>
    );
  }

  const conceptBreakdown: ConceptBreakdown[] = Object.entries(analytics.concept_analytics).map(
    ([concept, data]) => ({
      concept,
      accuracy: data.accuracy,
      totalResponses: data.total_responses,
      avgConfidence: data.avg_confidence,
      avgScore: data.avg_score,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Diagnostic Analytics</h2>
          <p className="text-muted-foreground">
            {analytics.session.topic} • {analytics.session.max_questions} questions
          </p>
        </div>
        <Button onClick={handleExportAnalytics} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Participants</span>
            </div>
            <div className="mt-2 text-3xl font-bold">{analytics.total_participants}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {Math.round(analytics.participation_rate * 100)}% participation rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Average Score</span>
            </div>
            <div className="mt-2 text-3xl font-bold">
              {Math.round(analytics.average_score * 100)}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Across all questions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Confidence</span>
            </div>
            <div className="mt-2 text-3xl font-bold">
              {Math.round(analytics.median_confidence)}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Median confidence level
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Calibration</span>
            </div>
            <div className="mt-2 text-3xl font-bold">
              {Math.round((1 - analytics.overconfidence_rate) * 100)}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Well-calibrated responses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participation Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Participation Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Participation Rate</span>
                    <span className="font-medium">
                      {Math.round(analytics.participation_rate * 100)}%
                    </span>
                  </div>
                  <Progress value={analytics.participation_rate * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.total_participants}
                    </div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(analytics.average_score * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score Distribution</span>
                    <span className="text-sm font-medium">
                      {analytics.average_score < 0.6 ? 'Needs Improvement' : 'Good Performance'}
                    </span>
                  </div>
                  <Progress 
                    value={analytics.average_score * 100} 
                    className="h-2"
                    color={analytics.average_score < 0.6 ? 'bg-red-500' : 'bg-green-500'}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence Calibration</span>
                    <span className="text-sm font-medium">
                      {analytics.overconfidence_rate > 0.4 ? 'High Overconfidence' : 'Well Calibrated'}
                    </span>
                  </div>
                  <Progress 
                    value={analytics.overconfidence_rate * 100} 
                    className="h-2"
                    color={analytics.overconfidence_rate > 0.4 ? 'bg-orange-500' : 'bg-blue-500'}
                  />
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">
                    Brier Score: {analytics.brier_score.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lower is better (0.0 = perfect calibration)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concept-Level Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of performance by concept area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conceptBreakdown.map((concept) => (
                  <div key={concept.concept} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{concept.concept}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={concept.accuracy < 0.7 ? 'destructive' : 'default'}>
                          {Math.round(concept.accuracy * 100)}% accuracy
                        </Badge>
                        <Badge variant="outline">
                          {concept.totalResponses} responses
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-medium">{Math.round(concept.accuracy * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Confidence</div>
                        <div className="font-medium">{Math.round(concept.avgConfidence)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Score</div>
                        <div className="font-medium">{Math.round(concept.avgScore * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress 
                        value={concept.accuracy * 100} 
                        className="h-2"
                        color={concept.accuracy < 0.7 ? 'bg-red-500' : 'bg-green-500'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Misconceptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Top Misconceptions</span>
                </CardTitle>
                <CardDescription>
                  Concepts where students struggled the most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.top_misconceptions.map((misconception, index) => (
                    <div key={misconception.concept} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-red-800">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-red-800">{misconception.concept}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-800">
                          {Math.round(misconception.accuracy * 100)}%
                        </div>
                        <div className="text-xs text-red-600">
                          {misconception.total_responses} responses
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calibration Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Calibration Insights</span>
                </CardTitle>
                <CardDescription>
                  How well students assess their own knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(analytics.median_confidence)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Median Confidence</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Overconfidence Rate</span>
                      <span className="font-medium">
                        {Math.round(analytics.overconfidence_rate * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={analytics.overconfidence_rate * 100} 
                      className="h-2"
                      color={analytics.overconfidence_rate > 0.4 ? 'bg-orange-500' : 'bg-blue-500'}
                    />
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">
                      Brier Score: {analytics.brier_score.toFixed(3)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {analytics.brier_score < 0.2 ? 'Excellent calibration' : 
                       analytics.brier_score < 0.4 ? 'Good calibration' : 'Needs improvement'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Actionable Insights</span>
              </CardTitle>
              <CardDescription>
                Key talking points and recommendations for your lecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.talking_points.map((point, index) => {
                  const IconComponent = getPriorityIcon(point.priority);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getPriorityColor(point.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {point.type}
                            </Badge>
                            <Badge variant={point.priority === 'high' ? 'destructive' : 'default'}>
                              {point.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm">{point.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
