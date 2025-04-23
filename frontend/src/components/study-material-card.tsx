import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

interface StudyMaterialCardProps {
  title: string
  type: string
  progress: number
  lastReviewed: string
  tags: string[]
  status: "In Progress" | "Mastered" | "Not Started"
  icon: ReactNode
  description?: string
  image?: string
  id: string
}

export function StudyMaterialCard({
  title,
  type,
  progress,
  lastReviewed,
  tags,
  status,
  icon,
  description = "Study material with AI-generated content to help you learn more effectively.",
  image = "/placeholder.svg?height=120&width=240",
  id = "material-1",
}: StudyMaterialCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-all hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col">
      <div className="relative">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={240}
          height={120}
          className="object-cover w-full h-full transform transition-transform hover:scale-105 duration-500 overflow-hidden"
          priority={true}
          onError={(e) => {
            // @ts-ignore - TypeScript doesn't like this, but it works
            e.target.src = "/placeholder.svg?height=120&width=240"
          }}
        />
        <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center">
          <div className="mr-0.5">{icon}</div>
          <span className="text-[10px] font-medium text-slate-700">{type}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
          <Badge
            variant={status === "Mastered" ? "default" : "outline"}
            className={`text-[10px] px-1.5 py-0 ${
              status === "Mastered" ? "bg-primary text-white" : "border-white text-white bg-black/30 backdrop-blur-sm"
            }`}
          >
            {status}
          </Badge>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-slate-900 mb-0.5 line-clamp-1">{title}</h3>
        <p className="text-slate-600 mb-1.5 line-clamp-1 text-[10px]">{description}</p>

        <div className="mb-1.5 mt-auto">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-slate-600">Progress</span>
            <span className="text-ocean font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-ocean-100" indicatorClassName="bg-ocean" />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-[10px] text-slate-500">
            <span>Last: {lastReviewed}</span>
          </div>

          <Link
            href={`/materials/${id}`}
            className="inline-flex items-center text-[10px] text-aqua hover:text-ocean-deep font-medium"
          >
            Continue
            <ChevronRight className="ml-0.5 w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
