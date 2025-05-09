import Link from 'next/link';
import { Users } from 'lucide-react';
import { Project, projectIcons, projectColors } from '../types';

interface ProjectCardProps extends Project {}

export function ProjectCard({ 
  id, 
  title, 
  description, 
  lastUpdated,
  type,
  progress = 0,
  collaborators = 0,
}: ProjectCardProps) {
  const Icon = projectIcons[type] || projectIcons.biology;
  const colorClasses = projectColors[type] || projectColors.biology;
  const displayType = type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <Link
      href={`/projects/${id}/overview`}
      className="group block p-6 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {displayType}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h2>
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
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
            {lastUpdated}
          </div>
          {collaborators > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              {collaborators}
            </div>
          )}
        </div>
        {progress > 0 && (
          <div className="flex items-center">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="ml-2 text-sm text-gray-600">{progress}%</span>
          </div>
        )}
      </div>
    </Link>
  );
} 