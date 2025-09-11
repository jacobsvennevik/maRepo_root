"use client";

import { ArrowRight, GraduationCap, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectTypeCardsProps {
  onProjectTypeSelect: (type: "school" | "self-study") => void;
}

export function ProjectTypeCards({
  onProjectTypeSelect,
}: ProjectTypeCardsProps) {
  const handleCardClick = (type: "school" | "self-study") => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onProjectTypeSelect(type)
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
      {/* Self-Study Project Card */}
      <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <CardTitle className="text-lg sm:text-xl text-slate-900">
            Self-Study Project
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
            Create a personal learning project for skill development and
            self-improvement.
          </p>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Personal learning goals
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Focus areas and materials
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Flexible study schedules
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <Button
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 text-sm sm:text-base"
              onClick={handleCardClick("self-study")}
              data-testid="self-study-project-card"
            >
              Create Self-Study Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* School Project Card */}
      <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <CardTitle className="text-lg sm:text-xl text-slate-900">
            School Project
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
            Create a project for academic coursework, classes, or educational
            assignments.
          </p>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Course materials and assignments
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Test preparation and timelines
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Academic evaluation tracking
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base"
              onClick={handleCardClick("school")}
              data-testid="school-project-card"
            >
              Create School Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Group Collaboration Project Card - Coming Soon */}
      <Card className="relative overflow-hidden border-2 border-gray-200 opacity-75">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800 text-xs"
            >
              Coming Soon
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl text-slate-900">
            Group Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
            Create collaborative learning projects with teams, study groups, and
            shared resources.
          </p>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              Team-based learning projects
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              Shared resources and materials
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              Real-time collaboration tools
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <Button
              disabled
              className="w-full text-sm sm:text-base cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
