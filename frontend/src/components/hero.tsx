"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import OceanBackground from "./ocean-background"

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={containerRef}>
      <OceanBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Dive Into Smarter Learning with AI
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          An intelligent study platform designed to help you focus, understand, and thrive.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-blue-950 font-medium text-lg px-8 py-6 rounded-full">
            Start Learning
          </Button>
        </motion.div>

        <motion.p
          className="text-white mt-8 italic drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          Explore deep knowledge. Surface with clarity.
        </motion.p>
      </div>
    </div>
  )
}
