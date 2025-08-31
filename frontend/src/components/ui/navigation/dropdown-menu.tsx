"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownMenuItemProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
}

export function DropdownMenuItem({
  icon,
  title,
  description,
  onClick,
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors text-left w-full"
    >
      {icon && <div className="mr-3">{icon}</div>}
      <div>
        <h4 className="font-medium text-slate-900">{title}</h4>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
    </button>
  );
}

interface DropdownMenuProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}

export function DropdownMenu({
  label,
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  children,
}: DropdownMenuProps) {
  return (
    <div className="relative dropdown-container">
      <button
        className="text-slate-800 hover:text-aqua transition-colors flex items-center"
        onMouseEnter={onMouseEnter}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="ml-1 w-4 h-4" />
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 dropdown-menu"
          onMouseLeave={onMouseLeave}
        >
          <div className="grid gap-3">{children}</div>
        </div>
      )}
    </div>
  );
}
