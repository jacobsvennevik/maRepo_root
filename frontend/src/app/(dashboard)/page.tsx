"use client"

import { useEffect, useState } from "react"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  BookOpenIcon,
  BrainIcon,
  BarChart3Icon,
  Search,
  Bell,
  Settings,
  FileTextIcon,
  BookIcon,
  VideoIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StudyPerformanceChart } from "@/components/study-performance-chart"
import { AiUsageStats } from "@/components/ai-usage-stats"
import { StudyMaterialCard } from "@/components/study-material-card"
import { MainNav } from "@/components/main-nav"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#e5e7eb]">
      {/* Navigation */}
      <header
        className={`w-full border-b border-slate-200/30 z-50 transition-all duration-200 ${
          scrolled ? "bg-white shadow-sm" : "navbar-inner backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center px-6">
          <div className="flex-1">
            <MainNav />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ocean"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </button>

            <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>

            <Avatar className="h-9 w-9 border border-white">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
              <AvatarFallback className="text-sm">US</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 pb-4 pt-2 h-full">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - 6/12 width */}
            <div className="col-span-6 grid grid-rows-[auto_1fr] gap-6">
              {/* Top Row - Study Insights */}
              <Card className="overflow-hidden border-ocean-100 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Study Insights</CardTitle>
                    <CardDescription className="text-xs">Track your learning progress</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 text-xs gap-1 border-ocean-200">
                        Week
                        <ChevronDownIcon className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Day</DropdownMenuItem>
                      <DropdownMenuItem>Week</DropdownMenuItem>
                      <DropdownMenuItem>Month</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="h-[120px]">
                    <StudyPerformanceChart />
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-ocean">+18%</div>
                      <p className="text-xs text-slate-600">Retention improvement</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-emerald-500">12.5 hrs</div>
                      <p className="text-xs text-slate-600">Total study time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Row - Study Materials Grid */}
              <div className="grid grid-cols-2 gap-4">
                <StudyMaterialCard
                  id="biology-notes"
                  title="Biology Notes – Chapter 3"
                  type="PDF"
                  progress={75}
                  lastReviewed="2h ago"
                  tags={["AI Generated"]}
                  status="In Progress"
                  icon={<BookOpenIcon className="h-3.5 w-3.5 text-ocean" />}
                  description="Comprehensive notes on cell structure and function."
                  image="/placeholder.svg?height=120&width=240"
                />

                <StudyMaterialCard
                  id="spanish-vocab"
                  title="Spanish Vocabulary Flashcards"
                  type="Flashcards"
                  progress={45}
                  lastReviewed="Yesterday"
                  tags={["Manual"]}
                  status="In Progress"
                  icon={<BrainIcon className="h-3.5 w-3.5 text-ocean" />}
                  description="Essential Spanish vocabulary by topics."
                  image="/placeholder.svg?height=120&width=240"
                />

                <StudyMaterialCard
                  id="physics-formulas"
                  title="Physics Formulas Mind Map"
                  type="Mind Map"
                  progress={90}
                  lastReviewed="3d ago"
                  tags={["AI Generated", "Shared"]}
                  status="Mastered"
                  icon={<BarChart3Icon className="h-3.5 w-3.5 text-ocean" />}
                  description="Visual representation of key physics formulas."
                  image="/placeholder.svg?height=120&width=240"
                />

                <StudyMaterialCard
                  id="history-timeline"
                  title="World History Timeline"
                  type="Timeline"
                  progress={30}
                  lastReviewed="1w ago"
                  tags={["AI Generated"]}
                  status="Not Started"
                  icon={<BookOpenIcon className="h-3.5 w-3.5 text-ocean" />}
                  description="Chronological overview of major historical events."
                  image="/placeholder.svg?height=120&width=240"
                />
              </div>
            </div>

            {/* Right Column - 6/12 width */}
            <div className="col-span-6 space-y-6 pt-0">
              {/* Your Recent Study Materials - Matching reference design */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-slate-800">Your Recent Study Materials</h2>
                  <Button variant="ghost" size="sm" className="text-sm text-slate-600 hover:text-slate-900 p-0">
                    See all Materials
                  </Button>
                </div>

                {/* First Study Material - Expanded */}
                <div className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded bg-ocean-500 flex items-center justify-center">
                      <FileTextIcon className="h-6 w-6 text-white" />
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
                      <ChevronUpIcon className="h-5 w-5 text-slate-500" />
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
                        <MapPinIcon className="h-4 w-4" />
                        <span>Biology</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
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
                      <BookIcon className="h-6 w-6 text-white" />
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
                      <ChevronDownIcon className="h-5 w-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Divider line with more visible styling */}
                <div className="h-[1px] bg-slate-300 w-full"></div>

                {/* Third Study Material - Collapsed */}
                <div className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded bg-indigo-500 flex items-center justify-center">
                      <VideoIcon className="h-6 w-6 text-white" />
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
                      <ChevronDownIcon className="h-5 w-5 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Tools Usage */}
              <Card className="border-ocean-100 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                  <div>
                    <CardTitle className="text-sm">AI Assistant Usage</CardTitle>
                    <CardDescription className="text-xs">Your AI learning tools</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <CalendarIcon className="h-3 w-3" />
                    April 11
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <AiUsageStats />
                </CardContent>
              </Card>

              {/* Premium Card */}
              <Card className="bg-gradient-to-br from-ocean-50 to-ocean-100 shadow-sm">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm">Unlock Premium Features</CardTitle>
                  <CardDescription className="text-xs">Get access to exclusive learning tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 px-4 pb-3 pt-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-ocean"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="text-xs">Advanced retention analytics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-ocean"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="text-xs">Unlimited AI-generated resources</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-ocean"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="text-xs">Priority access to new learning tools</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-3 pt-0">
                  <Button className="w-full h-7 text-xs bg-primary hover:bg-primary-600">
                    Try for free
                    <ChevronRightIcon className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
