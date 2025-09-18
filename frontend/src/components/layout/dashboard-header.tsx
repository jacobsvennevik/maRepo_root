"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Initial check on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if current path starts with a specific route
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={`
      bg-white/90 backdrop-blur-md
      rounded-2xl shadow-lg border border-gray-200
      mx-8 mt-2 px-6 py-4
      flex items-center justify-between
      relative z-[9999]
    `}
    >
      <div className="px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-medium text-ocean-deep flex items-center"
            >
              <Droplets className="mr-2 text-aqua" />
              <span>OceanLearn</span>
            </Link>

            <nav className="hidden md:flex ml-32 space-x-10">
              <Link
                href="/dashboard"
                className={
                  isActive("/dashboard")
                    ? "text-[#47B5FF] hover:text-[#3da5ec] font-medium"
                    : "text-slate-600 hover:text-slate-900 transition-colors"
                }
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className={
                  isActive("/projects")
                    ? "text-[#47B5FF] hover:text-[#3da5ec] font-medium"
                    : "text-slate-600 hover:text-slate-900 transition-colors"
                }
              >
                Projects
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:bg-slate-100"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-full overflow-hidden bg-[#47B5FF] flex items-center justify-center text-white">
              <span className="text-sm font-medium">JS</span>
              <img
                src="/avatar.png"
                alt="User avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target && target.style) {
                    target.style.display = "none";
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
