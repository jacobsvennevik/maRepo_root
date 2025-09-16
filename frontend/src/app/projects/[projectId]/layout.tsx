import { DashboardHeader } from "@/components/layout/dashboard-header";
import ProjectSidebar from "@/app/components/ProjectSidebar";
import { WhiteBackground } from "@/components/common/backgrounds/white-background";
import { ProjectProvider } from "@/features/projects";

// This would typically come from your database/API
const getProjectName = async (projectId: string) => {
  // Temporary mock data - replace with actual data fetching
  // In a real app, this would be an API call:
  // const res = await fetch(`https://api.yourapp.com/projects/${projectId}`);
  // const project = await res.json();
  // return project.name;
  const projects: Record<string, string> = {
    biology: "Biology",
    chemistry: "Chemistry",
    physics: "Physics",
  };
  return projects[projectId] || "Project";
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectName = await getProjectName(projectId);
  const projectData = { projectId, projectName };

  return (
    <ProjectProvider value={projectData}>
      <div className="relative">
        <WhiteBackground />
        <DashboardHeader />
        <div className="flex min-h-screen">
          <div className="flex-shrink-0">
            <ProjectSidebar />
          </div>
          <main className="flex-1 p-6 pt-4">{children}</main>
        </div>
      </div>
    </ProjectProvider>
  );
}
