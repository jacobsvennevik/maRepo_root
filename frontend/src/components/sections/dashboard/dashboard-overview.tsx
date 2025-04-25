"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ChevronRight, ChevronUp, ChevronDown, FileText, Book, Video, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge"

export function DashboardOverview() {
  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto bg-[#f8fafc]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Study Materials Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Study Materials */}
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
        </div>

        {/* Right Column - Welcome Card and Goal Tracker */}
        <div className="lg:col-span-5 space-y-6">
          {/* Welcome Card */}
          <Card className="bg-white shadow-sm border-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-8 p-8">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-medium text-slate-900">
                    Good evening, Jacob Horn Svennevik
                  </CardTitle>
                  <CardDescription className="text-base text-slate-700 mt-2">
                    Need help? Tell me a little about yourself so I can make the best recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Button 
                    variant="custom-aqua"
                    className="bg-[#47B5FF] hover:bg-[#47B5FF]/90 text-white px-6 py-5 mt-4 rounded-lg font-medium shadow-sm flex items-center"
                  >
                    <MessageSquareText className="mr-2 h-5 w-5" />
                    Start a conversation
                  </Button>
                </CardContent>
              </div>
              <div className="lg:col-span-4 bg-[#e0f7ff] h-full p-8 hidden lg:block">
                <div className="aspect-square relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/images/dashboard/welcome-illustration.svg"
                      alt="Welcome illustration"
                      className="w-full h-auto"
                      onError={(e) => {
                        // @ts-ignore
                        e.target.src = "/placeholder.svg?height=200&width=200";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Goal Tracker Card */}
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
                  <span className="text-[#47B5FF] font-medium">115%</span>
                </div>
                <Progress value={115} max={100} className="h-2 bg-ocean-100" indicatorClassName="bg-[#47B5FF]" />
                
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
        </div>
      </div>
    </div>
  )
} 