'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import Link from 'next/link';

const projects = [
  {
    id: 'biology',
    title: 'Biology Research',
    description: 'Study of cellular structures and DNA replication',
    lastUpdated: '2 days ago',
  },
  {
    id: 'chemistry',
    title: 'Chemistry Lab',
    description: 'Chemical reactions and molecular structures',
    lastUpdated: '1 day ago',
  },
  {
    id: 'physics',
    title: 'Physics Project',
    description: 'Mechanics and thermodynamics',
    lastUpdated: '3 days ago',
  },
];

export default function Projects() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/active-project/${project.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="text-sm text-gray-500">
                Last updated: {project.lastUpdated}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 