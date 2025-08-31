"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectLayout } from "@/components/layout/project-layout";
import { ProjectSidebar } from "@/components/layout/project-sidebar";

export default function CurrentProject() {
  return (
    <ProjectLayout>
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        {/* Main navigation header - reused from dashboard */}
        <DashboardHeader />

        {/* Project content with sidebar layout */}
        <div className="flex flex-1">
          {/* Left sidebar navigation */}
          <ProjectSidebar projectId="current" projectName="Current Project" />

          {/* Main content area */}
          <main className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Current Project
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Overview Cards */}
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium text-gray-900">Study Progress</h3>
                <p className="text-2xl font-bold text-blue-600">75%</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium text-gray-900">Flashcards</h3>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium text-gray-900">Tests Completed</h3>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Completed Biology Quiz #2
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Created 5 new flashcards
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Updated study notes
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProjectLayout>
  );
}
