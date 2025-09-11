import React from 'react';
import { DiagnosticSession } from '@/features/diagnostics';

interface DiagnosticSessionPageProps {
  params: Promise<{
    projectId: string;
    sessionId: string;
  }>;
}

export default async function DiagnosticSessionPage({ params }: DiagnosticSessionPageProps) {
  const { projectId, sessionId } = await params;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticSession sessionId={sessionId} />
    </div>
  );
}
