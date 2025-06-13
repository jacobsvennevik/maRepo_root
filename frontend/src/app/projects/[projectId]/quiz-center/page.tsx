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
import { mockTests, type Test } from './data/mock-data';

export default function QuizCenter() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const recommendedTest = mockTests[1]; // Chemistry Quiz as recommended
  const completedTests = mockTests.filter(test => test.status === 'completed');
  const averageScore = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, test) => sum + (test.lastScore || 0), 0) / completedTests.length)
    : 0;

  // Event handlers
  const handleStartTest = (testId: string) => {
    console.log('Starting quiz:', testId);
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // TODO: Implement specific actions
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs />
      <OceanHeader 
        totalTests={mockTests.length}
        completedTests={completedTests.length}
        averageScore={averageScore}
      />
      <StatsCards 
        totalTests={mockTests.length}
        completedTests={completedTests.length}
        averageScore={averageScore}
      />
      <RecommendedTestCard 
        test={recommendedTest}
        onStart={handleStartTest}
      />
      <QuickActionsGrid onAction={handleQuickAction} />
      <TestTypesSection />
      <YourTestsSection 
        tests={mockTests}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onStartTest={handleStartTest}
      />
    </div>
  );
} 