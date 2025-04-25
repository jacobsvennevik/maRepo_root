"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface GoalTrackerProps {
  completedDays: string[];
  targetDays?: string[];
}

export function GoalTracker({ 
  completedDays = ["M", "T", "W", "Th", "F"], 
  targetDays = ["M", "T", "W", "Th", "F", "S", "S"] 
}: GoalTrackerProps) {
  
  const weekdays = [
    { id: "M", label: "M", full: "Monday" },
    { id: "T", label: "T", full: "Tuesday" },
    { id: "W", label: "W", full: "Wednesday" },
    { id: "Th", label: "Th", full: "Thursday" },
    { id: "F", label: "F", full: "Friday" },
    { id: "S", label: "S", full: "Saturday" },
    { id: "S", label: "S", full: "Sunday" }
  ];
  
  const progressPercentage = Math.round((completedDays.length / targetDays.length) * 100);
  const isExceeded = completedDays.length >= 5;
  
  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="pb-0 p-8">
        <CardTitle className="text-xl font-medium text-slate-900">
          Weekly Goal Progress Tracker
        </CardTitle>
        <CardDescription className="text-base text-slate-700 mt-1">
          {isExceeded 
            ? "You've exceeded your learning goal this week. Fantastic! Consider raising your goal to continue challenging yourself."
            : "Track your weekly learning progress. Try to complete your daily learning goals."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-8 pb-8">
        <div className="space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Weekly Progress</span>
            <span className="text-[#47B5FF] font-medium">{progressPercentage}%</span>
          </div>
          
          <div className="flex justify-between gap-2 py-2">
            {weekdays.map((day) => {
              const isCompleted = completedDays.includes(day.id);
              const isTarget = targetDays.includes(day.id);
              
              return (
                <div 
                  key={day.id}
                  className={`flex items-center justify-center w-10 h-10 rounded-full 
                    ${isCompleted ? 'bg-[#2E8B57] text-white' : 
                      isTarget ? 'bg-white text-slate-600 border border-slate-200' : 
                      'bg-white text-slate-300 border border-slate-100'}`}
                  title={day.full}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{day.label}</span>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center">
              {isExceeded ? (
                <div className="bg-emerald-100 text-emerald-600 rounded-full px-3 py-1 text-xs font-medium">
                  Goal Exceeded
                </div>
              ) : (
                <div className="bg-blue-50 text-[#47B5FF] rounded-full px-3 py-1 text-xs font-medium">
                  {completedDays.length}/{targetDays.length} Days
                </div>
              )}
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