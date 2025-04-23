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
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <AiUsageStats />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 