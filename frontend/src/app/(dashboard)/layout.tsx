"use client"

import { ReactNode, useState } from "react"
import { NavbarDashboard } from "./components/navbar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#e5e7eb]">
      <div className="flex min-h-screen flex-col">
        {/* Main content */}
        <div className="flex-1">
          {/* Top navigation */}
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between py-4">
              <NavbarDashboard
                label="Dashboard"
                isOpen={isNavOpen}
                onToggle={() => setIsNavOpen(!isNavOpen)}
                onMouseEnter={() => setIsNavOpen(true)}
                onMouseLeave={() => setIsNavOpen(false)}
              >
                <div className="p-2">
                  <nav className="grid gap-1">
                    <a href="/dashboard" className="block px-3 py-2 text-sm hover:bg-slate-100 rounded-md">
                      Overview
                    </a>
                    <a href="/dashboard/settings" className="block px-3 py-2 text-sm hover:bg-slate-100 rounded-md">
                      Settings
                    </a>
                  </nav>
                </div>
              </NavbarDashboard>
            </div>
          </header>
          
          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 