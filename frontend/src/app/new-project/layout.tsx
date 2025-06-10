'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectBackground } from '@/components/common/backgrounds/project-background';
import ProjectSidebar from '@/app/components/ProjectSidebar';

export default function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <ProjectBackground />
      <DashboardHeader />
      <div className="flex flex-1">
        <div className="z-10">
          <ProjectSidebar 
            projectId="new" 
            projectName="New Project" 
          />
        </div>
        <main className="flex-1 overflow-y-auto p-6 z-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 