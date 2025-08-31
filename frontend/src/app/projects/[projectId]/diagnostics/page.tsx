import React from 'react';
import { DiagnosticDashboard } from '@/components/diagnostic';

interface DiagnosticPageProps {
  params: {
    projectId: string;
  };
}

export default function DiagnosticPage({ params }: DiagnosticPageProps) {
  return (
    <div className="container mx-auto py-6 px-4">
      <DiagnosticDashboard projectId={params.projectId} />
    </div>
  );
}
