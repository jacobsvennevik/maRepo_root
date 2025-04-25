"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronUp, ChevronDown, FileText, Book, Video, MapPin, Clock } from "lucide-react";

export function StudyMaterialsList() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-slate-900">Your Recent Study Materials</h3>
        <Button variant="ghost" className="text-[#47B5FF] flex items-center p-0 h-auto hover:bg-transparent hover:text-blue-600">
          See all Materials <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div>
        {/* First Study Material - Expanded */}
        <div className="py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded bg-ocean-500 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-slate-800">Advanced Biology Notes</h3>
                <Badge className="bg-slate-800 text-white border-none text-xs px-2 py-0.5 rounded-md">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">45 minutes study time</p>
            </div>
            <button className="flex-shrink-0 rounded-full p-2 bg-slate-200 hover:bg-slate-300">
              <ChevronUp className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="mt-3 ml-16 space-y-3">
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full px-3"
              >
                Self-paced
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full px-3"
              >
                PDF
              </Badge>
            </div>

            <p className="text-sm text-slate-600">
              Comprehensive study notes covering advanced cellular biology concepts and processes.
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Biology</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>2h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider line with more visible styling */}
        <div className="h-[1px] bg-slate-300 w-full"></div>

        {/* Second Study Material - Collapsed */}
        <div className="py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded bg-emerald-500 flex items-center justify-center">
              <Book className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-slate-800">Spanish Vocabulary</h3>
                <Badge className="bg-slate-200 text-slate-700 border-none text-xs px-2 py-0.5 rounded-md">
                  In Progress
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">30 minutes study time</p>
            </div>
            <button className="flex-shrink-0 rounded-full p-2 bg-slate-200 hover:bg-slate-300">
              <ChevronDown className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Divider line with more visible styling */}
        <div className="h-[1px] bg-slate-300 w-full"></div>

        {/* Third Study Material - Collapsed */}
        <div className="py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded bg-indigo-500 flex items-center justify-center">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-slate-800">Physics Video Lecture</h3>
                <Badge className="bg-slate-800 text-white border-none text-xs px-2 py-0.5 rounded-md">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">60 minutes study time</p>
            </div>
            <button className="flex-shrink-0 rounded-full p-2 bg-slate-200 hover:bg-slate-300">
              <ChevronDown className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 