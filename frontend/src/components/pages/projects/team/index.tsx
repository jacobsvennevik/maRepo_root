"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectLayout } from "@/components/layout/project-layout";
import { ProjectSidebar } from "@/components/layout/project-sidebar";

export default function ProjectTeam() {
  return (
    <ProjectLayout>
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        {/* Main navigation header - reused from dashboard */}
        <DashboardHeader />

        {/* Project content with sidebar layout */}
        <div className="flex flex-1">
          {/* Left sidebar navigation */}
          <ProjectSidebar />

          {/* Main content area */}
          <main className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Project Team
            </h1>
            {/* Project team content will be added here later */}
            <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-white">
              <p className="text-slate-600">Project team content placeholder</p>
            </div>
          </main>
        </div>
      </div>
    </ProjectLayout>
  );
}
