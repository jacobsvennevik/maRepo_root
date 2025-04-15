"use client"

import { ChevronDown } from "lucide-react"

interface FilterDropdownProps {
  label: string
  options: string[]
  selectedOption: string
  isOpen: boolean
  onToggle: () => void
  onSelect: (option: string) => void
}

export function FilterDropdown({
  label,
  options,
  selectedOption,
  isOpen,
  onToggle,
  onSelect
}: FilterDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light"
      >
        <span className="text-slate-700">{selectedOption}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option}>
                <button
                  onClick={() => onSelect(option)}
                  className={`block w-full text-left px-4 py-2 hover:bg-slate-50 ${
                    selectedOption === option ? "text-ocean-medium font-medium" : "text-slate-700"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 