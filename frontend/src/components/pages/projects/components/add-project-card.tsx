"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

export function AddProjectCard() {
  return (
    <Link href="projects/new" className="block">
      <Card className="mb-6 transition-colors hover:bg-slate-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900">Add new project</h3>
            <button className="flex-shrink-0 rounded-full p-2 bg-slate-100 hover:bg-slate-200">
              <Plus className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 