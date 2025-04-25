"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface GoalTrackerProps {
  progress: number;
  maxProgress?: number;
}

export function GoalTracker({ progress, maxProgress = 100 }: GoalTrackerProps) {
  const progressPercentage = (progress / maxProgress) * 100;
  
  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="pb-0 p-8">
        <CardTitle className="text-xl font-medium text-slate-900">
          Weekly Goal Progress Tracker
        </CardTitle>
        <CardDescription className="text-base text-slate-700 mt-1">
          You've exceeded your learning goal this week. Fantastic! Consider raising your goal to continue challenging yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-8 pb-8">
        <div className="space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Progress</span>
            <span className="text-[#47B5FF] font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} max={100} className="h-2 bg-ocean-100" indicatorClassName="bg-[#47B5FF]" />
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center">
              <div className="bg-emerald-100 text-emerald-600 rounded-full px-3 py-1 text-xs font-medium">
                Goal Exceeded
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-[#47B5FF] text-[#47B5FF] hover:bg-[#e0f7ff] hover:text-[#47B5FF]"
            >
              Adjust Goal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 