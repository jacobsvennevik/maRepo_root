"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-10">
        <div className="flex items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-900" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
            <circle cx="12" cy="10" r="2"></circle>
            <path d="M12 14v4"></path>
            <path d="M12 2v2"></path>
          </svg>
          <h1 className="ml-2 text-slate-900 font-semibold">OceanLearn</h1>
        </div>
        
        <nav className="hidden md:flex space-x-10">
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 pb-2 border-b-2 border-[#47B5FF]">
            Home
          </Link>
          <Link href="/projects" className="text-slate-600 hover:text-slate-900">
            Projects
          </Link>
          <Link href="/analytics" className="text-slate-600 hover:text-slate-900">
            Analytics
          </Link>
          <Link href="/resources" className="text-slate-600 hover:text-slate-900">
            Resources
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Settings className="h-5 w-5" />
        </button>
        <div className="h-9 w-9 rounded-full overflow-hidden bg-[#47B5FF] flex items-center justify-center text-white">
          <span className="text-sm font-medium">JS</span>
          <img 
            src="/avatar.png" 
            alt="User avatar" 
            className="h-full w-full object-cover"
            onError={(e) => {
              // @ts-ignore
              if (e.target && e.target.style) {
                e.target.style.display = "none";
              }
              // No need to set innerText as we already have the fallback
            }}
          />
        </div>
      </div>
    </header>
  )
} 