"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, User, ChevronDown } from "lucide-react"
import { OceanLearnLogo } from "@/components/ocean-learn-logo"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const navLinks = [
    {
      href: "/dashboard",
      label: "Home",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/projects",
      label: "Projects",
      active: pathname === "/dashboard/projects",
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      href: "/dashboard/resources",
      label: "Resources",
      active: pathname === "/dashboard/resources",
    },
  ]

  return (
    <header className="w-full border-b-2 border-cyan-300 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo and nav links */}
          <div className="flex items-center">
            <div className="flex-none mr-32">
              <OceanLearnLogo />
            </div>
            
            <nav className="hidden md:flex items-center space-x-10 ml-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium py-2 border-b-2 transition-colors",
                    link.active 
                      ? "text-cyan-800 border-cyan-500 font-semibold" 
                      : "text-slate-700 border-transparent hover:text-cyan-600 hover:border-cyan-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side: Settings and Profile */}
          <div className="flex items-center space-x-4" ref={dropdownRef}>
            {/* Settings */}
            <button 
              className="rounded-full p-2 text-slate-700 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("profile")}
                className="flex items-center space-x-2 rounded-full p-1 text-slate-700 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                aria-expanded={activeDropdown === "profile"}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-cyan-300 bg-white p-2 shadow-lg dropdown-menu">
                  <div className="py-1">
                    <Link 
                      href="/dashboard/profile" 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-cyan-100 hover:text-cyan-700 rounded-md"
                    >
                      Your Profile
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-cyan-100 hover:text-cyan-700 rounded-md"
                    >
                      Settings
                    </Link>
                    <div className="my-1 h-px bg-cyan-100" />
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-cyan-100 hover:text-cyan-700 rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 