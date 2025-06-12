'use client';

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { WhiteBackground } from '@/components/common/backgrounds/white-background';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data
const projectDetails = {
  name: 'Chemistry Lab Project',
};

const progressData = [
  { name: 'Week 1', progress: 10 },
  { name: 'Week 2', progress: 25 },
  { name: 'Week 3', progress: 40 },
  { name: 'Week 4', progress: 60 },
  { name: 'Week 5', progress: 75 },
];

const taskData = [
    { name: 'Experiments', value: 400 },
    { name: 'Documentation', value: 300 },
    { name: 'Analysis', value: 300 },
    { name: 'Presentation', value: 200 },
];

export default function ProjectOverviewTest2() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <WhiteBackground />
      <DashboardHeader />
      
      <main className="flex-1 p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">{projectDetails.name} - Overview 2</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="progress" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Task Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 