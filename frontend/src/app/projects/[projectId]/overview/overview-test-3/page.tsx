'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { WhiteBackground } from '@/components/common/backgrounds/white-background';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// Mock data
const projectDetails = {
  name: 'Physics Simulation Project',
};

const upcomingTasks = [
  { id: 1, text: 'Finalize simulation parameters', status: 'due-soon' },
  { id: 2, text: 'Write initial report draft', status: 'on-track' },
  { id: 3, text: 'Peer review of documentation', status: 'on-track' },
];

const recentActivity = [
  { id: 1, text: 'Alice pushed new code to repository', time: '2 hours ago' },
  { id: 2, text: 'Bob created a new task "Review literature"', time: '5 hours ago' },
  { id: 3, text: 'Charlie uploaded "initial-data.csv"', time: '1 day ago' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'due-soon':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'on-track':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export default function ProjectOverviewTest3() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <WhiteBackground />
      <DashboardHeader />
      
      <main className="flex-1 p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">{projectDetails.name} - Overview 3</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {upcomingTasks.map(task => (
                    <li key={task.id} className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <span>{task.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                    {recentActivity.map(activity => (
                        <li key={activity.id} className="flex flex-col">
                            <span>{activity.text}</span>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 