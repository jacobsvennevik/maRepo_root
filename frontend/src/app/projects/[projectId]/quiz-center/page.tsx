'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { 
  Breadcrumbs,
  OceanHeader,
  StatsCards,
  RecommendedTestCard,
  QuickActionsGrid,
  TestTypesSection,
  YourTestsSection
} from './components';
import { useEffect, useMemo } from 'react';
import { QuizStatsFooter } from '@/features/quiz/components/QuizStatsFooter';
import { Target, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuizCenter } from '@/features/quiz/hooks/useQuizCenter';
import { CreateQuizWizard } from '@/features/quiz/components/CreateQuizWizard';
import { isTestMode } from '@/features/projects/services/upload-utils';

export default function QuizCenter() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Use the new comprehensive hook
  const {
    sessions,
    loading,
    error,
    generatingQuiz,
    totalSessions,
    completedSessions,
    averageScore,
    totalTimeSpent,
    loadSessions,
    createSession,
    startSession,
    deleteSession,
    clearError,
    refreshData
  } = useQuizCenter({ 
    projectId, 
    autoLoad: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Event handlers using the new architecture
  const handleStartTest = async (sessionId: string) => {
    try {
      await startSession(sessionId);
      // TODO: navigate to quiz runner when implemented
      console.log(`Started quiz session: ${sessionId}`);
    } catch (e) {
      console.error('Failed to start quiz', e);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'auto-generate') {
      try {
        await createSession({
          project: projectId,
          difficulty: 'INTERMEDIATE',
          delivery_mode: 'IMMEDIATE',
          max_questions: 10,
        });
        // Data is automatically refreshed by the hook
      } catch (e) {
        console.error('Failed to generate quiz', e);
      }
    } else if (action === 'create-custom') {
      setShowCreateWizard(true);
    } else {
      console.log('Quick action:', action);
    }
  };

  const handleDeleteTest = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      // Data is automatically refreshed by the hook
    } catch (e) {
      console.error('Failed to delete quiz', e);
    }
  };

  const handleCreateQuiz = async (config: any) => {
    try {
      await createSession({
        project: projectId,
        ...config
      });
      setShowCreateWizard(false);
    } catch (e) {
      console.error('Failed to create quiz', e);
    }
  };

  // Show test mode banner
  const showTestModeBanner = isTestMode();

  return (
    <div className="relative min-h-screen space-y-6">
      <Breadcrumbs />
      
      {/* Test Mode Banner */}
      {showTestModeBanner && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            🧪 Test Mode Active - AI responses are mocked for development
          </AlertDescription>
        </Alert>
      )}

      {/* Error Banner */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Centered Page Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Project Quizzes</h1>
        </div>
        <p className="text-slate-600 text-lg">Assess your knowledge with auto-generated quizzes</p>
      </div>

      {/* Loading State */}
      {loading && sessions.length === 0 && (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading quiz sessions...</span>
        </div>
      )}

      {/* Recommended Quiz Card */}
      {sessions.length > 0 && sessions[0] && (
        <RecommendedTestCard 
          test={{
            id: sessions[0].id,
            title: sessions[0].title || 'Quiz Session',
            subject: sessions[0].topic || 'Mixed',
            type: 'Mixed',
            questions: sessions[0].maxQuestions,
            timeEstimate: sessions[0].timeLimitSec || 0,
            icon: '📝',
          }}
          onStart={handleStartTest}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsGrid 
        onAction={handleQuickAction}
      />

      {/* Test Types Section */}
      <TestTypesSection />

      {/* Main Content */}
      {sessions.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-white/60">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-lg font-semibold text-slate-900 mb-1">No quizzes yet</div>
          <div className="text-slate-600 mb-4">Generate your first quiz from project materials.</div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleQuickAction('auto-generate')}
              disabled={generatingQuiz}
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Auto-Generate Quiz'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleQuickAction('create-custom')}
            >
              Create Custom Quiz
            </Button>
          </div>
        </div>
      ) : (
        <YourTestsSection 
          tests={sessions.map(s => ({
            id: s.id,
            title: s.title || 'Quiz Session',
            subject: s.topic || 'Mixed',
            type: 'Mixed',
            questions: s.maxQuestions,
            timeEstimate: s.timeLimitSec || 0,
            lastScore: s.averageScore,
            status: s.status === 'completed' ? 'completed' : 
                   s.status === 'active' ? 'needs-review' : 'upcoming',
            createdAt: s.createdAt.toISOString(),
            icon: '📝'
          }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onStartTest={handleStartTest}
        />
      )}

      {/* Stats Footer */}
      <QuizStatsFooter 
        totalQuizzes={totalSessions}
        averageScore={averageScore}
        completedCount={completedSessions}
        dueToday={0} // TODO: Implement due today logic
        learningCount={sessions.filter(s => s.status === 'active').length}
        accuracyPct={averageScore}
        setsCount={totalSessions}
        pillLabel="Completed"
      />

      {/* Create Quiz Wizard */}
      {showCreateWizard && (
        <CreateQuizWizard
          projectId={projectId}
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
          onCreated={handleCreateQuiz}
        />
      )}
    </div>
  );
} 