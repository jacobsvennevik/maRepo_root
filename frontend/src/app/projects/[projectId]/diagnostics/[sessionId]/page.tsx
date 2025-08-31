import React from 'react';
import { DiagnosticSession } from '@/components/diagnostic';

interface DiagnosticSessionPageProps {
  params: {
    projectId: string;
    sessionId: string;
  };
}

export default function DiagnosticSessionPage({ params }: DiagnosticSessionPageProps) {
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticSession sessionId={params.sessionId} />
    </div>
  );
}
