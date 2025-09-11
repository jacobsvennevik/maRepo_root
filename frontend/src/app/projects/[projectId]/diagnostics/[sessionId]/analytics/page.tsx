import React from 'react';
import { DiagnosticAnalytics } from '@/features/diagnostics';

interface DiagnosticAnalyticsPageProps {
  params: Promise<{
    projectId: string;
    sessionId: string;
  }>;
}

export default async function DiagnosticAnalyticsPage({ params }: DiagnosticAnalyticsPageProps) {
  const { projectId, sessionId } = await params;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticAnalytics sessionId={sessionId} />
    </div>
  );
}
