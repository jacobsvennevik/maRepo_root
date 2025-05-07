"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dna } from "lucide-react"
import Link from "next/link"

interface ProjectCardProps {
  id: string
  title: string
  description: string
  lastUpdated: string
  icon?: React.ReactNode
}

export function ProjectCard({ 
  id, 
  title, 
  description, 
  lastUpdated,
  icon = <Dna className="h-6 w-6 text-blue-600" />
}: ProjectCardProps) {
  return (
    <Link href={`projects/${id}`} className="block">
      <Card className="mb-4 transition-colors hover:bg-slate-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
            <div className="text-sm text-slate-500">
              Last updated: {lastUpdated}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 