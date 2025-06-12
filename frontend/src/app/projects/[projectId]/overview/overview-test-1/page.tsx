'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { WhiteBackground } from '@/components/common/backgrounds/white-background';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in a real app, this would come from an API
const projectDetails = {
  id: '1',
  name: 'Biology Research Project',
  stats: {
    progress: '75%',
    tasksCompleted: 23,
    filesUploaded: 12,
  },
  team: [
    { id: 'u1', name: 'Alice', avatar: 'https://github.com/shadcn.png' },
    { id: 'u2', name: 'Bob', avatar: 'https://github.com/shadcn.png' },
    { id: 'u3', name: 'Charlie', avatar: 'https://github.com/shadcn.png' },
  ]
};

export default function ProjectOverviewTest1() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <WhiteBackground />
      <DashboardHeader />
      
      <main className="flex-1 p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">{projectDetails.name} - Overview 1</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Progress</h4>
                  <p className="text-2xl font-bold">{projectDetails.stats.progress}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tasks Completed</h4>
                  <p className="text-2xl font-bold">{projectDetails.stats.tasksCompleted}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Files Uploaded</h4>
                  <p className="text-2xl font-bold">{projectDetails.stats.filesUploaded}</p>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectDetails.team.map(member => (
                  <div key={member.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Add New Task</button>
                <button className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">Upload File</button>
                <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">View Reports</button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 