"use client"

import Link from "next/link"
import { Droplets } from "lucide-react"

export function Footer() {
  return (
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
  )
} 