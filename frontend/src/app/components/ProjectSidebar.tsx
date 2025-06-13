'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Book, FileText, Brain, ClipboardList, StickyNote, File, BarChart2 } from 'lucide-react';
import { useProject } from '../projects/[projectId]/_context/project-context';
import PropTypes from 'prop-types';

const sidebarItems = [
  { name: 'Overview', href: 'overview', icon: Book },
  { name: 'Flashcards', href: 'flashcards', icon: FileText },
  { name: 'Mind Maps', href: 'mindmaps', icon: Brain },
  { name: 'Tests', href: 'tests', icon: ClipboardList },
  { name: 'Notes', href: 'notes', icon: StickyNote },
  { name: 'Files', href: 'files', icon: File },
  { name: 'Analytics', href: 'analytics', icon: BarChart2 },
];

/**
 * Sidebar navigation for project tools and navigation links.
 */
export default function ProjectSidebar() {
  const { projectId, projectName } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const currentTool = pathname.split('/').pop() || 'overview';

  return (
    <div
      className={`
        fixed top-[88px] left-8 z-50
        bg-white/80 backdrop-blur-md
        rounded-2xl shadow-2xl border border-gray-200
        transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        flex flex-col
        min-h-[70vh] max-h-[90vh]
        overflow-hidden
      `}
    >
      {/* Project Name */}
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-2 font-bold text-lg text-gray-800 truncate">
          {projectName}
        </div>
      )}
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 hover:bg-gray-100 self-end"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = currentTool === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={{
                pathname: `/projects/${projectId}/${item.href}`
              }}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className="mr-3" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to Projects */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/projects"
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-2" />
          {!isCollapsed && <span>Back to All Projects</span>}
        </Link>
      </div>
    </div>
  );
}

ProjectSidebar.propTypes = {}; 