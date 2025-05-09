'use client';

import { useParams } from 'next/navigation';
import { DashboardHeader } from "@/components/layout/dashboard-header";
import ProjectSidebar from '@/app/components/ProjectSidebar';

// This would typically come from your database/API
const getProjectName = (projectId: string) => {
  // Temporary mock data - replace with actual data fetching
  const projects: Record<string, string> = {
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
  };
  return projects[projectId] || 'Project';
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.projectId as string;
  const projectName = getProjectName(projectId);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <DashboardHeader />
      <div className="flex flex-1">
        <ProjectSidebar projectId={projectId} projectName={projectName} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 