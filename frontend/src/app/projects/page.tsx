'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectCard } from "./components/project-card";
import { AddProjectCard } from "./components/add-project-card";
import { getProjects } from "./create/services/api";
import { useEffect, useState } from "react";
import { ProjectType } from "./types";
import { WhiteBackground } from '@/components/common/backgrounds/white-background';

const projectTypes: ProjectType[] = [
  'biology',
  'chemistry',
  'physics',
  'math',
  'computer-science',
  'literature',
  'history',
  'geography',
];

export default function Projects() {
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjects();
        // Map backend projects to frontend Project type
        const mapped = data
          .filter((p: any) => !p.is_draft) // Only show non-draft projects
          .map((p: any) => ({
            id: p.id,
            title: p.name || p.course_name || p.goal_description || 'Untitled',
            description: p.goal_description || p.course_name || '',
            lastUpdated: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '',
            type: p.project_type === 'school' ? 'biology' : 'computer-science', // TODO: Map to real type if available
            progress: 0, // Optionally calculate progress
            collaborators: 1, // Optionally set collaborators
          }));
        setProjects(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = selectedType === 'all'
    ? projects
    : projects.filter(project => project.type === selectedType);

  return (
    <div className="flex flex-col min-h-screen relative">
      <WhiteBackground />
      <DashboardHeader />
      <main className="flex-1 p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          </div>
          {/* Project Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                ${selectedType === 'all' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800'
                }`}
            >
              All
            </button>
            {projectTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${selectedType === type 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
              >
                {type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
          <div className="max-w-[1400px] mx-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading projects...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AddProjectCard />
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 