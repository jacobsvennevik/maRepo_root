"use client"

import { ReactNode } from "react"
import { BaseLayout } from "./base-layout"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <BaseLayout>
      {children}
    </BaseLayout>
  )
} 