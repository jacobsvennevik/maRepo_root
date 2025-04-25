"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FolderOpen, 
  Clock, 
  Users, 
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectSidebar() {
  const pathname = usePathname()
  
  const sidebarNavItems = [
    {
      title: "Overview",
      href: "/projects",
      icon: LayoutDashboard,
    },
    {
      title: "Files",
      href: "/projects/files",
      icon: FolderOpen,
    },
    {
      title: "Activity",
      href: "/projects/activity",
      icon: Clock,
    },
    {
      title: "Team",
      href: "/projects/team",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/projects/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 bg-white">
      <div className="h-full py-6 px-3">
        <div className="space-y-1">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-cyan-100 text-cyan-700"
                  : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
} 