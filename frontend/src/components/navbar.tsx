"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-gradient-to-r from-blue-950/80 to-teal-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-200 text-transparent bg-clip-text">
                OceanMind
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="#features"
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Features
                </Link>
                <Link
                  href="#testimonials"
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Testimonials
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link href="#about" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" className="text-gray-200 hover:text-white mr-2">
                Log in
              </Button>
              <Button className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-blue-950 font-medium">
                Sign up
              </Button>
            </div>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-950/90 backdrop-blur-md">
            <Link
              href="#features"
              className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-gray-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </Link>
            <div className="pt-4 pb-3 border-t border-blue-800">
              <Button variant="ghost" className="w-full text-gray-200 hover:text-white mb-2">
                Log in
              </Button>
              <Button className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-blue-950 font-medium">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
