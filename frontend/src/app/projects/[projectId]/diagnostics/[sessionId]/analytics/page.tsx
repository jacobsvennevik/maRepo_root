import React from 'react';
import { DiagnosticAnalytics } from '@/components/diagnostic';

interface DiagnosticAnalyticsPageProps {
  params: {
    projectId: string;
    sessionId: string;
  };
}

export default function DiagnosticAnalyticsPage({ params }: DiagnosticAnalyticsPageProps) {
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticAnalytics sessionId={params.sessionId} />
    </div>
  );
}
