"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Droplets, BookOpen, ScrollText, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/navigation/dropdown-menu"

export function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 80) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  // Smooth scroll to section with offset for fixed header
  const scrollToSection = (sectionId: string) => {
    setActiveDropdown(null)
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Reduced offset for more compact layout
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })

      // Focus the section for accessibility
      setTimeout(() => {
        element.setAttribute("tabindex", "-1")
        element.focus({ preventScroll: true })
      }, 1000)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <header className={`transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "glass-nav py-4"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-medium text-ocean-deep flex items-center">
              <Droplets className="mr-2 text-aqua" />
              <span>OceanLearn</span>
            </Link>

            {/* Desktop Navigation - Centered with Dropdowns */}
            <div className="hidden md:flex items-center space-x-8 justify-center flex-1" ref={dropdownRef}>
              <nav className="flex space-x-8 relative">
                {/* Features Dropdown */}
                <DropdownMenu
                  label="Features"
                  isOpen={activeDropdown === "features"}
                  onToggle={() => toggleDropdown("features")}
                  onMouseEnter={() => setActiveDropdown("features")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <DropdownMenuItem
                    icon={<div className="bg-aqua/10 p-2 rounded-full"><BookOpen className="w-5 h-5 text-aqua" /></div>}
                    title="Smart Flashcards"
                    description="AI-generated study materials"
                    onClick={() => scrollToSection("flashcards")}
                  />
                  <DropdownMenuItem
                    icon={<div className="bg-ocean-medium/10 p-2 rounded-full"><ScrollText className="w-5 h-5 text-ocean-medium" /></div>}
                    title="Concept Maps"
                    description="Visualize connections between ideas"
                    onClick={() => scrollToSection("concept-maps")}
                  />
                  <DropdownMenuItem
                    icon={<div className="bg-ocean-deep/10 p-2 rounded-full"><FlaskConical className="w-5 h-5 text-ocean-deep" /></div>}
                    title="Adaptive Tests"
                    description="Personalized quizzes and assessments"
                    onClick={() => scrollToSection("adaptive-tests")}
                  />
                </DropdownMenu>

                {/* Resources Dropdown */}
                <DropdownMenu
                  label="Resources"
                  isOpen={activeDropdown === "resources"}
                  onToggle={() => toggleDropdown("resources")}
                  onMouseEnter={() => setActiveDropdown("resources")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <DropdownMenuItem
                    title="Documentation"
                    description="Guides and tutorials"
                  />
                  <DropdownMenuItem
                    title="Blog"
                    description="Latest news and articles"
                  />
                  <DropdownMenuItem
                    title="Community"
                    description="Join our learning community"
                  />
                </DropdownMenu>

                {/* Pricing Dropdown */}
                <DropdownMenu
                  label="Pricing"
                  isOpen={activeDropdown === "pricing"}
                  onToggle={() => toggleDropdown("pricing")}
                  onMouseEnter={() => setActiveDropdown("pricing")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <DropdownMenuItem
                    title="Plans & Pricing"
                    description="View our pricing options"
                    onClick={() => scrollToSection("pricing")}
                  />
                  <DropdownMenuItem
                    title="Free Plan"
                    description="Basic features for students"
                  />
                  <DropdownMenuItem
                    title="Pro Plan"
                    description="Advanced features for serious learners"
                  />
                  <DropdownMenuItem
                    title="Enterprise"
                    description="Custom solutions for organizations"
                  />
                </DropdownMenu>
              </nav>
            </div>

            {/* Right-aligned actions */}
            <div className="flex items-center space-x-4">
              <Link href="#" className="text-slate-800 hover:text-aqua transition-colors">
                Log in
              </Link>
              <Button className="bg-ocean-deep hover:bg-blue-900 text-white">Try for free</Button>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
} 