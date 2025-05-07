"use client"

import { StudyMaterialsList, WelcomeCard, GoalTracker, AddStudyMaterialCard } from "./components";

export function DashboardOverview() {
  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto bg-[#f8fafc]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Study Materials Section */}
        <div className="lg:col-span-7 space-y-6">
          <AddStudyMaterialCard />
          <StudyMaterialsList />
        </div>

        {/* Right Column - Welcome Card and Goal Tracker */}
        <div className="lg:col-span-5 space-y-6">
          <WelcomeCard userName="Jacob Horn Svennevik" />
          <GoalTracker 
            progress={115} 
            completedDays={["M", "T", "W", "Th", "F"]}
            targetDays={["M", "T", "W", "Th", "F", "Sa", "Su"]}
          />
        </div>
      </div>
    </div>
  )
} 