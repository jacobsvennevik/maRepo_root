"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useOptionalProject } from "@/app/projects/_context/useOptionalProject";

interface SidebarProps {
  projectId?: string;
  projectName?: string;
}

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
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {name}
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
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

      {!isCollapsed && (
        <nav className="p-4 space-y-2">
          <a
            href={`/projects/${id}/overview`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === `/projects/${id}/overview`
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Overview
          </a>
          <a
            href={`/projects/${id}/materials`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === `/projects/${id}/materials`
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Study Materials
          </a>
          <a
            href={`/projects/${id}/flashcards`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === `/projects/${id}/flashcards`
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Flashcards
          </a>
          <a
            href={`/projects/${id}/diagnostics`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(`/projects/${id}/diagnostics`)
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Diagnostics
          </a>
          <a
            href={`/projects/${id}/tests`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === `/projects/${id}/tests`
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tests
          </a>
          <a
            href={`/projects/${id}/settings`}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === `/projects/${id}/settings`
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Settings
          </a>
        </nav>
      )}
    </aside>
  );
}
