"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownMenuProps {
  label: string
  isOpen: boolean
  onToggle: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  children: ReactNode
}

export function NavbarDashboard({ label, isOpen, onToggle, onMouseEnter, onMouseLeave, children }: DropdownMenuProps) {
  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        onClick={onToggle}
        className={`flex items-center space-x-1 py-5 text-sm font-medium transition-colors border-b-2 ${
          isOpen
            ? "text-ocean border-ocean"
            : "text-slate-700 hover:text-ocean border-transparent hover:border-ocean/40"
        }`}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-ocean" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <div className="grid gap-2">{children}</div>
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  icon?: ReactNode
  title: string
  description?: string
  onClick?: () => void
}

export function DropdownMenuItem({ icon, title, description, onClick }: DropdownMenuItemProps) {
  return (
    <button
      className="flex items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-slate-100"
      onClick={onClick}
    >
      {icon && <div className="mt-0.5">{icon}</div>}
      <div>
        <div className="font-medium text-slate-900">{title}</div>
        {description && <div className="text-xs text-slate-500">{description}</div>}
      </div>
    </button>
  )
}
