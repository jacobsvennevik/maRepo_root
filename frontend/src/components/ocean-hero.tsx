"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Droplets, ArrowRight, ChevronDown, BookOpen, ScrollText, FlaskConical } from "lucide-react"
import { OceanBackground } from "@/components/ocean-background"
import { BlogResourcesSection } from "@/components/blog-resources-section"
import { PricingSection } from "@/components/pricing-section"

export default function OceanHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Ocean Background */}
      <OceanBackground />

      {/* Navigation Bar with Dropdowns */}
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
                  <div className="relative dropdown-container">
                    <button
                      className="text-slate-800 hover:text-aqua transition-colors flex items-center"
                      onMouseEnter={() => setActiveDropdown("features")}
                      onClick={() => toggleDropdown("features")}
                      aria-expanded={activeDropdown === "features"}
                      aria-haspopup="true"
                    >
                      Features
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>
                    {activeDropdown === "features" && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 dropdown-menu"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="grid gap-3">
                          <button
                            onClick={() => scrollToSection("flashcards")}
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors text-left w-full"
                          >
                            <div className="bg-aqua/10 p-2 rounded-full mr-3">
                              <BookOpen className="w-5 h-5 text-aqua" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">Smart Flashcards</h4>
                              <p className="text-sm text-slate-600">AI-generated study materials</p>
                            </div>
                          </button>
                          <button
                            onClick={() => scrollToSection("concept-maps")}
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors text-left w-full"
                          >
                            <div className="bg-ocean-medium/10 p-2 rounded-full mr-3">
                              <ScrollText className="w-5 h-5 text-ocean-medium" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">Concept Maps</h4>
                              <p className="text-sm text-slate-600">Visualize connections between ideas</p>
                            </div>
                          </button>
                          <button
                            onClick={() => scrollToSection("adaptive-tests")}
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors text-left w-full"
                          >
                            <div className="bg-ocean-deep/10 p-2 rounded-full mr-3">
                              <FlaskConical className="w-5 h-5 text-ocean-deep" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">Adaptive Tests</h4>
                              <p className="text-sm text-slate-600">Personalized quizzes and assessments</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resources Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      className="text-slate-800 hover:text-aqua transition-colors flex items-center"
                      onMouseEnter={() => setActiveDropdown("resources")}
                      onClick={() => toggleDropdown("resources")}
                      aria-expanded={activeDropdown === "resources"}
                      aria-haspopup="true"
                    >
                      Resources
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>
                    {activeDropdown === "resources" && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 dropdown-menu"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="grid gap-3">
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Documentation</h4>
                              <p className="text-sm text-slate-600">Guides and tutorials</p>
                            </div>
                          </Link>
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Blog</h4>
                              <p className="text-sm text-slate-600">Latest news and articles</p>
                            </div>
                          </Link>
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Community</h4>
                              <p className="text-sm text-slate-600">Join our learning community</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      className="text-slate-800 hover:text-aqua transition-colors flex items-center"
                      onMouseEnter={() => setActiveDropdown("pricing")}
                      onClick={() => toggleDropdown("pricing")}
                      aria-expanded={activeDropdown === "pricing"}
                      aria-haspopup="true"
                    >
                      Pricing
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>
                    {activeDropdown === "pricing" && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 dropdown-menu"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="grid gap-3">
                          <button
                            onClick={() => scrollToSection("pricing")}
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors text-left w-full"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Plans & Pricing</h4>
                              <p className="text-sm text-slate-600">View our pricing options</p>
                            </div>
                          </button>
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Free Plan</h4>
                              <p className="text-sm text-slate-600">Basic features for students</p>
                            </div>
                          </Link>
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Pro Plan</h4>
                              <p className="text-sm text-slate-600">Advanced features for serious learners</p>
                            </div>
                          </Link>
                          <Link
                            href="#"
                            className="flex items-start p-2 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-slate-900">Enterprise</h4>
                              <p className="text-sm text-slate-600">Custom solutions for organizations</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Hero Content - Card-Based Layout */}
      <main className="relative z-10 container mx-auto px-4 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-xl">
            <div className="mb-6">
              <span className="text-aqua font-medium">AI-Powered Learning</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 leading-tight">
              Transform your study experience
            </h1>
            <p className="text-lg text-slate-700 mb-8">
              Our intelligent platform adapts to your learning style, helping you master complex topics with
              personalized study tools and real-time feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-ocean-deep hover:bg-blue-900 text-white px-8 py-6 rounded-md text-lg">
                Start Learning
              </Button>
              <Button
                variant="outline"
                className="border-ocean-medium text-ocean-deep hover:bg-ocean-medium/10 px-8 py-6 rounded-md text-lg flex items-center"
              >
                View Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right Column - Featured Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-r from-aqua/20 to-ocean-deep/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                  <Droplets className="w-10 h-10 text-aqua" />
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-medium text-slate-900 mb-3">Personalized Learning Paths</h3>
              <p className="text-slate-700 mb-4">
                Our AI analyzes your learning patterns and creates custom study plans that adapt to your progress,
                ensuring you focus on what matters most.
              </p>
              <Link
                href="#"
                className="text-aqua hover:text-ocean-deep transition-colors flex items-center font-medium"
              >
                Learn more <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* AI Tools Section - Alternating Layout */}
      <section id="tools" className="relative z-10 py-16 bg-white/90">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-medium text-slate-900 mb-4">AI-Powered Learning Tools</h2>
            <p className="text-lg text-slate-700">
              Our intelligent tools adapt to your learning style, helping you study more effectively
            </p>
          </div>

          {/* Feature 1: Left text, Right demo */}
          <div
            id="flashcards"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-24 min-h-[85vh] pt-16"
          >
            <div className="max-w-lg pr-0 lg:pr-6 lg:col-span-4">
              <div className="bg-aqua/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-aqua" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 mb-4">Smart Flashcards</h3>
              <p className="text-base text-slate-700 mb-6">
                Our AI-powered flashcards adapt to your learning patterns, focusing on concepts you find challenging
                while reinforcing your knowledge of familiar topics.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="bg-aqua/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-aqua"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Automatically generates flashcards from any text</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-aqua/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-aqua"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Adapts to your learning pace and retention</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-aqua/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-aqua"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Tracks progress and identifies knowledge gaps</span>
                </li>
              </ul>
              <Button className="bg-aqua hover:bg-aqua-dark text-white">Try Flashcards</Button>
            </div>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-102 lg:col-span-8">
              <div className="aspect-[16/10] relative bg-gradient-to-r from-aqua/10 to-aqua/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=600&width=900"
                    alt="Flashcards Demo"
                    width={900}
                    height={600}
                    className="rounded-lg shadow-md w-full h-auto"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-base text-slate-900">Flashcards Interface</h4>
                  <span className="text-xs bg-aqua/10 text-aqua px-3 py-1.5 rounded-full">Live Demo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Right text, Left demo */}
          <div
            id="concept-maps"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-24 min-h-[85vh] pt-16"
          >
            <div className="order-2 lg:order-1 bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-102 lg:col-span-8">
              <div className="aspect-[16/10] relative bg-gradient-to-r from-ocean-medium/10 to-ocean-medium/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=600&width=900"
                    alt="Concept Maps Demo"
                    width={900}
                    height={600}
                    className="rounded-lg shadow-md w-full h-auto"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-base text-slate-900">Concept Maps Interface</h4>
                  <span className="text-xs bg-ocean-medium/10 text-ocean-medium px-3 py-1.5 rounded-full">
                    Live Demo
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 max-w-lg pl-0 lg:pl-6 lg:col-span-4">
              <div className="bg-ocean-medium/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ScrollText className="w-7 h-7 text-ocean-medium" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 mb-4">Interactive Concept Maps</h3>
              <p className="text-base text-slate-700 mb-6">
                Visualize connections between ideas and concepts with our interactive mapping tool, helping you
                understand complex relationships and build a comprehensive mental model.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="bg-ocean-medium/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-medium"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">AI-generated concept relationships</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-ocean-medium/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-medium"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Interactive drag-and-drop interface</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-ocean-medium/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-medium"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Export and share your concept maps</span>
                </li>
              </ul>
              <Button className="bg-ocean-medium hover:bg-ocean-deep text-white">Try Concept Maps</Button>
            </div>
          </div>

          {/* Feature 3: Left text, Right demo */}
          <div
            id="adaptive-tests"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[85vh] pt-16"
          >
            <div className="max-w-lg pr-0 lg:pr-6 lg:col-span-4">
              <div className="bg-ocean-deep/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <FlaskConical className="w-7 h-7 text-ocean-deep" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 mb-4">Adaptive Testing</h3>
              <p className="text-base text-slate-700 mb-6">
                Our adaptive testing engine adjusts question difficulty based on your performance, creating a
                personalized assessment that identifies knowledge gaps and reinforces learning.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="bg-ocean-deep/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-deep"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Questions adapt to your knowledge level</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-ocean-deep/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-deep"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Detailed performance analytics</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-ocean-deep/10 p-1 rounded-full mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-ocean-deep"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-slate-700">Personalized study recommendations</span>
                </li>
              </ul>
              <Button className="bg-ocean-deep hover:bg-blue-900 text-white">Try Adaptive Tests</Button>
            </div>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-102 lg:col-span-8">
              <div className="aspect-[16/10] relative bg-gradient-to-r from-ocean-deep/10 to-ocean-deep/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=600&width=900"
                    alt="Adaptive Testing Demo"
                    width={900}
                    height={600}
                    className="rounded-lg shadow-md w-full h-auto"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-base text-slate-900">Adaptive Testing Interface</h4>
                  <span className="text-xs bg-ocean-deep/10 text-ocean-deep px-3 py-1.5 rounded-full">Live Demo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Blog/Resources Section */}
      <BlogResourcesSection />

      {/* Footer */}
      <footer className="relative z-10 bg-white text-slate-600 py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <Droplets className="w-6 h-6 mr-2 text-aqua" />
              <span className="text-xl font-medium text-ocean-deep">OceanLearn</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="#" className="text-slate-600 hover:text-aqua transition-colors">
                About
              </Link>
              <Link href="#" className="text-slate-600 hover:text-aqua transition-colors">
                Features
              </Link>
              <Link href="#" className="text-slate-600 hover:text-aqua transition-colors">
                Pricing
              </Link>
              <Link href="#" className="text-slate-600 hover:text-aqua transition-colors">
                Blog
              </Link>
              <Link href="#" className="text-slate-600 hover:text-aqua transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-slate-500 text-sm">
            <p>© 2023 OceanLearn. All rights reserved. Elevate your learning experience.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
