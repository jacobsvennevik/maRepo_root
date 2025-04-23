"use client"

import { Header } from "@/components/layout/header"
import { usePathname } from "next/navigation"

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <>
      {!isDashboard && <Header />}
      {children}
    </>
  )
} 