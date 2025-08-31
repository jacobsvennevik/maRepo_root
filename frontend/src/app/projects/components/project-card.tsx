import Link from "next/link";
import { Users } from "lucide-react";
import { ProjectV2, projectIcons, projectColors } from "../types";
import {
  isSchoolProject,
  isSelfStudyProject,
  getProjectDisplayName,
} from "../utils";
import { AIMetadataTags } from './ai-metadata-tags';

interface ProjectCardProps {
  project: ProjectV2;
}

/**
 * Card component for displaying a project overview in the projects grid.
 * Uses STI data structure for enhanced project information.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const displayName = getProjectDisplayName(project);
  const Icon = projectIcons[project.type] || projectIcons.biology;
  const colorClasses = projectColors[project.type] || projectColors.biology;

  // Determine project type display
  let displayType: string;
  if (isSchoolProject(project)) {
    displayType = "School Project";
  } else if (isSelfStudyProject(project)) {
    displayType = "Self Study";
  } else {
    // This should never happen due to discriminated union, but TypeScript needs this
    displayType = "Project";
  }

  return (
    <Link
      href={`/projects/${project.id}/overview`}
      className="group block h-full w-full p-6 bg-gradient-to-br from-emerald-50 to-blue-100 rounded-xl shadow hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col"
      data-testid="project-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorClasses}`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {displayType}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors flex-1">
        {displayName}
      </h2>
      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
        {project.description}
      </p>

      {/* AI-generated tags */}
      <AIMetadataTags project={project} />

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-gray-500">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {project.lastUpdated}
          </div>
          {(project.collaborators || 0) > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Users className="w-4 h-4 mr-1.5" />
              {project.collaborators}
            </div>
          )}
        </div>
        {(project.progress || 0) > 0 && (
          <div className="flex items-center">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <span className="ml-2 text-xs text-gray-600 font-medium">
              {project.progress}%
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
