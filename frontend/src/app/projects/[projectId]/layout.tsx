import { DashboardHeader } from "@/components/layout/dashboard-header";
import ProjectSidebar from '@/app/components/ProjectSidebar';
import { WhiteBackground } from '@/components/common/backgrounds/white-background';
import { ProjectProvider } from "./_context/project-context";

// This would typically come from your database/API
const getProjectName = async (projectId: string) => {
  // Temporary mock data - replace with actual data fetching
  // In a real app, this would be an API call:
  // const res = await fetch(`https://api.yourapp.com/projects/${projectId}`);
  // const project = await res.json();
  // return project.name;
  const projects: Record<string, string> = {
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
  };
  return projects[projectId] || 'Project';
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const projectName = await getProjectName(params.projectId);
  const projectData = { projectId: params.projectId, projectName };

  return (
    <ProjectProvider value={projectData}>
      <div className="flex flex-col min-h-screen relative">
        <WhiteBackground />
        <DashboardHeader />
        <div className="flex flex-1">
          <div className="z-10">
            <ProjectSidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-6 z-10">
            {children}
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
} 