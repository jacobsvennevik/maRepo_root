"use client"

import { ReactNode } from "react"

interface ProjectLayoutProps {
  children: ReactNode
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      {children}
    </div>
  )
} 