"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <main className="relative z-10 container mx-auto px-4 pt-28 pb-12 md:pt-32 md:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Text Content */}
        <div className="max-w-xl">
          <div className="mb-6">
            <span className="text-[#06b6d4] font-medium text-xl">AI-Powered Learning</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 leading-tight">
            Transform your study experience
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Our intelligent platform adapts to your learning style, helping you master complex topics with
            personalized study tools and real-time feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="solid-blue" 
              size="xl"
            >
              Start Learning
            </Button>
            <Button
              variant="outline-blue"
              size="xl"
              className="flex items-center"
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
              className="text-[#06b6d4] hover:text-ocean-deep transition-colors flex items-center font-medium"
            >
              Learn more <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 