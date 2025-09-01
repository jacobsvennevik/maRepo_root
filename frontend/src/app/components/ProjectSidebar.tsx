"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useOptionalProject } from "@/app/projects/_context/useOptionalProject";
import Link from "next/link";
import {
  Book,
  FileText,
  Brain,
  ClipboardList,
  StickyNote,
  File,
  BarChart2,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  projectId?: string;
  projectName?: string;
}

const sidebarItems = [
  { name: "Overview", href: "overview", icon: Book },
  { name: "Study Materials", href: "materials", icon: FileText },
  { name: "Flashcards", href: "flashcards", icon: Brain },
  { name: "Diagnostics", href: "diagnostics", icon: ClipboardList },
  { name: "Tests", href: "tests", icon: StickyNote },
  { name: "Settings", href: "settings", icon: File },
];

export default function ProjectSidebar({
  projectId,
  projectName,
}: SidebarProps) {
  const ctx = useOptionalProject();
  const id = ctx?.projectId ?? projectId ?? "unknown";
  const name = ctx?.projectName ?? projectName ?? "Untitled";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`mt-8 mx-4 bg-white border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="p-4 border-b border-gray-100 rounded-t-2xl">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {name}
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-blue-50 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {!isCollapsed && (
        <div className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
          <Link href="/projects" className="hover:text-blue-600 transition-colors">
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">{name}</span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === `/projects/${id}/${item.href}` || 
                          (pathname === `/projects/${id}` && item.href === "overview");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={`/projects/${id}/${item.href}`}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon size={20} className="mr-3 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to Projects */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-100 rounded-b-2xl">
          <Link
            href="/projects"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} className="mr-2" />
            <span>Back to All Projects</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
