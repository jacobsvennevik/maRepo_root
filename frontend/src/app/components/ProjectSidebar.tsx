'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Book, FileText, Brain, ClipboardList, StickyNote, File, BarChart2 } from 'lucide-react';

interface ProjectSidebarProps {
  projectId: string;
  projectName: string;
}

const sidebarItems = [
  { name: 'Overview', href: 'overview', icon: Book },
  { name: 'Flashcards', href: 'flashcards', icon: FileText },
  { name: 'Mind Maps', href: 'mindmaps', icon: Brain },
  { name: 'Tests', href: 'tests', icon: ClipboardList },
  { name: 'Notes', href: 'notes', icon: StickyNote },
  { name: 'Files', href: 'files', icon: File },
  { name: 'Analytics', href: 'analytics', icon: BarChart2 },
];

export default function ProjectSidebar({ projectId, projectName }: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentTool = pathname.split('/').pop() || 'overview';

  return (
    <div className={`flex flex-col h-screen bg-white/60 backdrop-blur-md border-r border-emerald-100 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
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