import React from 'react';
import { DiagnosticDashboard } from '@/features/diagnostics';

interface DiagnosticPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function DiagnosticPage({ params }: DiagnosticPageProps) {
  const { projectId } = await params;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticDashboard projectId={projectId} />
    </div>
  );
}
