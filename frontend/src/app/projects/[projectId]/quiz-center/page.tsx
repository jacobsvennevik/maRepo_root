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
import { Target } from 'lucide-react';
import { quizApi, type DiagnosticSession } from '@/features/quiz';

export default function QuizCenter() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const averageScore = useMemo(() => {
    // Placeholder: backend analytics not wired yet
    return 0;
  }, [sessions]);

  const totalCount = sessions.length;
  const completedCount = 0; // Placeholder until status mapping exists

  // Event handlers
  const handleStartTest = async (sessionId: string) => {
    try {
      setLoading(true);
      await quizApi.start(sessionId);
      // TODO: navigate to quiz runner when implemented
    } catch (e) {
      console.error('Failed to start quiz', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'auto-generate') {
      try {
        setLoading(true);
        await quizApi.generate({
          project: projectId,
          difficulty: 'INTERMEDIATE',
          delivery_mode: 'IMMEDIATE',
          max_questions: 10,
        });
        // Refresh sessions after generation
        const data = await quizApi.listSessions({ project: projectId });
        setSessions(data);
      } catch (e) {
        console.error('Failed to generate quiz', e);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Quick action:', action);
    }
  };

  return (
    <div className="relative min-h-screen space-y-6">
      <Breadcrumbs />
      {/* Centered Page Header like Flashcards */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Project Quizzes</h1>
        </div>
        <p className="text-slate-600 text-lg">Assess your knowledge with auto-generated quizzes</p>
      </div>
      {/* Removed top stats; footer card used instead */}
      {/* Placeholder recommended card until analytics available */}
      {sessions[0] && (
        <RecommendedTestCard 
          test={{
            id: sessions[0].id,
            title: sessions[0].title || 'Quiz Session',
            subject: 'Mixed',
            type: 'Mixed',
            questions: 0,
            timeEstimate: sessions[0].time_limit_sec || 0,
            lastScore: undefined,
            status: 'upcoming',
            icon: '📝',
          }}
          onStart={handleStartTest}
        />
      )}
      <QuickActionsGrid onAction={handleQuickAction} />
      <TestTypesSection />
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-white/60">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-lg font-semibold text-slate-900 mb-1">No quizzes yet</div>
          <div className="text-slate-600 mb-4">Generate your first quiz from project materials.</div>
          <Button onClick={() => handleQuickAction('auto-generate')}>Auto-Generate Quiz</Button>
        </div>
      ) : (
        <YourTestsSection 
          tests={sessions.map(s => ({
            id: s.id,
            title: s.title || 'Quiz Session',
            subject: 'Mixed',
            type: 'Mixed',
            questions: 0,
            timeEstimate: s.time_limit_sec || 0,
            lastScore: undefined,
            status: 'upcoming',
            createdAt: s.created_at,
            icon: '📝'
          }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onStartTest={handleStartTest}
        />
      )}
      <QuizStatsFooter 
        totalQuizzes={totalCount}
        averageScore={averageScore}
        completedCount={completedCount}
        dueToday={0}
        learningCount={0}
        accuracyPct={averageScore}
        setsCount={totalCount}
        pillLabel="Completed"
      />
    </div>
  );
} 