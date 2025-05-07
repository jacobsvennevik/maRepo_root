'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectCard } from "./components/project-card";
import { AddProjectCard } from "./components/add-project-card";
import { mockProjects } from "./data/mock-projects";
import { ProjectType } from "./types";
import { useState } from "react";

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

  const filteredProjects = selectedType === 'all' 
    ? mockProjects
    : mockProjects.filter(project => project.type === selectedType);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
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
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>

          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AddProjectCard />
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  {...project}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 