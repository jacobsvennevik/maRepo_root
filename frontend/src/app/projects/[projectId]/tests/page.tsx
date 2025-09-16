'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { quizApi, type DiagnosticSession } from '@/features/quiz';
import { 
  ChevronRight, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Brain, 
  BookOpen, 
  Sparkles, 
  Target, 
  Trophy, 
  Flame, 
  BarChart3, 
  Play, 
  Edit, 
  Trash2, 
  Share2, 
  Download, 
  Upload,
  Filter,
  Calendar,
  Star,
  Timer,
  Award,
  TrendingUp,
  Lightbulb,
  Puzzle,
  FileText,
  Image,
  List,
  Grid3X3
} from 'lucide-react';
import { OceanCenteredPageHeader } from '@/components/ui/common/OceanCenteredPageHeader';
import { Card, CardContent } from "@/components/ui/card";
import { QuizStatsFooter } from '@/features/quiz/components/QuizStatsFooter';
import { CreateQuizWizard } from '@/features/quiz/components/CreateQuizWizard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Loaded from backend
type QuizCard = {
  id: string;
  title: string;
  subject: string;
  type: string;
  questions: number;
  timeEstimate: number;
  lastScore?: number | null;
  status: 'completed' | 'upcoming' | 'needs-review';
  createdAt?: string;
  icon: string;
};

const testTypes = [
  { name: 'Multiple Choice', icon: '✅', description: 'Single or multi-select questions' },
  { name: 'Matching Pairs', icon: '🧩', description: 'Match terms with definitions' },
  { name: 'Short Answer', icon: '✏️', description: 'Fill in the blank questions' },
  { name: 'Interactive Diagram', icon: '🕹️', description: 'Drag labels onto images' },
  { name: 'Ranking', icon: '🔢', description: 'Order steps in a process' }
];

const quickActions = [
  { 
    title: 'Create New Test', 
    description: 'Build custom tests from scratch', 
    icon: Plus, 
    color: 'from-green-400 to-green-600',
    action: 'create'
  },
  { 
    title: 'Auto-Generate', 
    description: 'From your flashcards', 
    icon: Brain, 
    color: 'from-purple-400 to-purple-600',
    action: 'auto-generate'
  },
  { 
    title: 'Import Quiz', 
    description: 'Upload existing tests', 
    icon: Upload, 
    color: 'from-blue-400 to-blue-600',
    action: 'import'
  },
  { 
    title: 'Practice by Topic', 
    description: 'Focus on specific areas', 
    icon: Target, 
    color: 'from-orange-400 to-orange-600',
    action: 'practice'
  },
  { 
    title: 'Analytics', 
    description: 'View performance trends', 
    icon: BarChart3, 
    color: 'from-emerald-400 to-emerald-600',
    action: 'analytics'
  },
  { 
    title: 'Achievements', 
    description: 'Track your progress', 
    icon: Trophy, 
    color: 'from-pink-400 to-pink-600',
    action: 'achievements'
  }
];

export default function ProjectTests() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await quizApi.listSessions({ project: projectId });
        if (isMounted) setSessions(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load quizzes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSessions();
    return () => { isMounted = false; };
  }, [projectId]);

  const tests: QuizCard[] = useMemo(() => (
    sessions.map(s => ({
      id: s.id,
      title: s.title || 'Quiz Session',
      subject: 'Mixed',
      type: 'Mixed',
      questions: 0,
      timeEstimate: s.time_limit_sec || 0,
      lastScore: null,
      status: 'upcoming',
      createdAt: s.created_at,
      icon: '📝'
    }))
  ), [sessions]);

  const completedTests = tests.filter(test => test.status === 'completed');
  const averageScore = 0; // Placeholder until analytics are wired

  // Event handlers
  const handleStartTest = async (testId: string) => {
    try {
      setLoading(true);
      await quizApi.start(testId);
      // TODO: navigate to quiz runner when available
    } catch (e) {
      console.error('Failed to start quiz', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // TODO: Implement specific actions
    if (action === 'auto-generate') {
      setIsWizardOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen space-y-6">
      <Breadcrumbs />
      {/* Centered Page Header for consistency */}
      <OceanCenteredPageHeader
        title="Project Quizzes"
        subtitle="Assess your knowledge with auto-generated quizzes"
        icon={<Target className="h-8 w-8 text-white" />}
        gradientClassName="from-blue-400 to-purple-600"
      />
      {/* Removed top stats; using compact footer like quiz center */}
      {tests[0] && (
        <RecommendedTestCard 
          test={tests[0]}
          onStart={handleStartTest}
        />
      )}
      <QuickActionsGrid onAction={handleQuickAction} />
      <CreateQuizWizard
        projectId={projectId}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
      <TestTypesSection />
      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-white/60">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-lg font-semibold text-slate-900 mb-1">No quizzes yet</div>
          <div className="text-slate-600 mb-4">Generate your first quiz from project materials.</div>
          <Button onClick={() => handleQuickAction('auto-generate')}>Auto-Generate Quiz</Button>
        </div>
      ) : (
        <YourTestsSection 
          tests={tests}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onStartTest={handleStartTest}
        />
      )}
      <QuizStatsFooter
        totalQuizzes={tests.length}
        averageScore={averageScore}
        completedCount={completedTests.length}
        dueToday={0}
        learningCount={0}
        accuracyPct={averageScore}
        setsCount={tests.length}
        pillLabel="Completed"
      />
    </div>
  );
}

// Component: Breadcrumbs
function Breadcrumbs() {
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Link href="/projects" className="hover:text-blue-600">Projects</Link>
      <ChevronRight size={16} className="mx-2" />
      <span className="font-medium text-gray-900">Tests</span>
    </div>
  );
}

// Component: Ocean Header Card
function OceanHeader({ 
  totalTests, 
  completedTests, 
  averageScore 
}: { 
  totalTests: number; 
  completedTests: number; 
  averageScore: number; 
}) {
  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-200/30 shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Quiz Center</h1>
                <p className="text-slate-600">Navigate your learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>{totalTests} Total Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>{averageScore}% Average Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>3-day Streak</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{completedTests}</div>
                <div className="text-xs">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component: Stats Cards
function StatsCards({ 
  totalTests, 
  completedTests, 
  averageScore 
}: { 
  totalTests: number; 
  completedTests: number; 
  averageScore: number; 
}) {
  const stats = [
    { title: 'Total Tests', value: totalTests, icon: Target, color: 'from-blue-400 to-blue-600' },
    { title: 'Completed', value: completedTests, icon: CheckCircle, color: 'from-green-400 to-green-600' },
    { title: 'Avg Score', value: `${averageScore}%`, icon: TrendingUp, color: 'from-purple-400 to-purple-600' },
    { title: 'Streak', value: '3', icon: Flame, color: 'from-orange-400 to-orange-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`bg-gradient-to-r ${stat.color} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component: Recommended Test Card
function RecommendedTestCard({ 
  test, 
  onStart 
}: { 
  test: any; 
  onStart: (id: string) => void; 
}) {
  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-600 shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                <p className="text-slate-600">Based on your learning progress</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{test.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{test.title}</h3>
                  <p className="text-slate-600">{test.subject} • {test.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Timer className="h-3 w-3 mr-1" />
                  {test.timeEstimate} min
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <FileText className="h-3 w-3 mr-1" />
                  {test.questions} questions
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => onStart(test.id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recommended Test
              </Button>
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Edit className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
          
          <div className="text-right space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs">Last Score</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component: Quick Actions Grid
function QuickActionsGrid({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => onAction(action.action)}
        >
          <CardContent className="p-6 text-center">
            <div className={`p-4 rounded-xl bg-gradient-to-r ${action.color} mx-auto w-16 h-16 flex items-center justify-center mb-4`}>
              <action.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
            <p className="text-sm text-slate-600">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component: Test Types Section
function TestTypesSection() {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur-sm border-purple-200/50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Test Types Available</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testTypes.map((type, index) => (
            <div key={index} className="p-4 bg-white/60 rounded-lg border border-purple-200/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-900">{type.name}</h4>
                  <p className="text-sm text-slate-600">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component: Your Tests Section
function YourTestsSection({ 
  tests, 
  viewMode, 
  onViewModeChange, 
  onStartTest 
}: { 
  tests: any[]; 
  viewMode: 'grid' | 'list'; 
  onViewModeChange: (mode: 'grid' | 'list') => void; 
  onStartTest: (id: string) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Your Tests</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <TestListItem key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component: Test Card
function TestCard({ test, onStart }: { test: any; onStart: (id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'needs-review': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'needs-review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl">{test.icon}</span>
            <Badge className={getStatusColor(test.status)}>
              {getStatusIcon(test.status)}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{test.title}</h3>
            <p className="text-sm text-slate-600 mb-2">{test.subject}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="h-3 w-3" />
              <span>{test.questions} questions</span>
              <span>•</span>
              <Timer className="h-3 w-3" />
              <span>{test.timeEstimate} min</span>
            </div>
          </div>

          {test.lastScore && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-slate-600">Last score: {test.lastScore}%</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onStart(test.id)}
            >
              <Play className="h-3 w-3 mr-1" />
              {test.status === 'completed' ? 'Retake' : 'Start'}
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component: Test List Item
function TestListItem({ test, onStart }: { test: any; onStart: (id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'needs-review': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'needs-review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{test.icon}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{test.title}</h3>
              <p className="text-sm text-slate-600">{test.subject} • {test.questions} questions • {test.timeEstimate} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(test.status)}>
              {getStatusIcon(test.status)}
            </Badge>
            <Button size="sm" onClick={() => onStart(test.id)}>
              <Play className="h-3 w-3 mr-1" />
              {test.status === 'completed' ? 'Retake' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 