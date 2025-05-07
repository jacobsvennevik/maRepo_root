'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// This would typically come from your database/API
const getProjectName = (projectId: string) => {
  const projects: Record<string, string> = {
    'biology': 'Biology Research',
    'chemistry': 'Chemistry Lab',
    'physics': 'Physics Project',
  };
  return projects[projectId] || 'Project';
};

const getToolName = (tool: string) => {
  const tools: Record<string, string> = {
    'overview': 'Overview',
    'flashcards': 'Flashcards',
    'mindmaps': 'Mind Maps',
    'tests': 'Tests',
    'notes': 'Notes',
    'files': 'Files',
    'analytics': 'Analytics',
  };
  return tools[tool] || tool;
};

export default function ProjectTool() {
  const params = useParams();
  const projectId = params.projectId as string;
  const tool = params.tool as string;
  
  const projectName = getProjectName(projectId);
  const toolName = getToolName(tool);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link href={`/active-project/${projectId}`} className="hover:text-blue-600">
          {projectName}
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">{toolName}</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">{toolName}</h1>
      
      {/* Tool-specific content will go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          {toolName} content for {projectName} will be displayed here.
        </p>
      </div>
    </div>
  );
} 