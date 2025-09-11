"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ProjectContextType {
  projectId: string;
  projectName: string;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ProjectContextType;
}) {
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === null) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
