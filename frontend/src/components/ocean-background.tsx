"use client"
import Image from "next/image"
import { useEffect, useRef } from "react"

export function OceanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "rgba(79, 70, 229, 0.2)") // indigo
    gradient.addColorStop(0.3, "rgba(6, 182, 212, 0.2)") // cyan
    gradient.addColorStop(0.6, "rgba(249, 168, 212, 0.2)") // pink
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.2)") // white

    // Draw flowing wave-like patterns
    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Fill background
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw multiple wave layers
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()

        const amplitude = 50 / i // Decreasing amplitude for each layer
        const frequency = 0.005 * i // Increasing frequency for each layer
        const speed = 0.2 * i // Increasing speed for each layer

        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x < canvas.width; x += 5) {
          const y = Math.sin(x * frequency + time * speed) * amplitude + canvas.height / (1.5 + i * 0.2)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        // Set gradient for each wave
        const waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)

        if (i === 1) {
          waveGradient.addColorStop(0, "rgba(79, 70, 229, 0.1)")
          waveGradient.addColorStop(1, "rgba(6, 182, 212, 0.1)")
        } else if (i === 2) {
          waveGradient.addColorStop(0, "rgba(6, 182, 212, 0.1)")
          waveGradient.addColorStop(1, "rgba(249, 168, 212, 0.1)")
        } else {
          waveGradient.addColorStop(0, "rgba(249, 168, 212, 0.1)")
          waveGradient.addColorStop(1, "rgba(79, 70, 229, 0.1)")
        }

        ctx.fillStyle = waveGradient
        ctx.fill()
      }

      requestAnimationFrame(drawWaves)
    }

    drawWaves()

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      {/* Ocean Image Background - Added back */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/ocean-background.jpg"
          alt="Ocean background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover opacity-60"
        />
      </div>

      {/* Animated Canvas Overlay */}
      <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-70" aria-hidden="true" />

      {/* Subtle gradient overlay to improve text contrast */}
      <div
        className="fixed inset-0 z-2 bg-gradient-to-b from-white/20 to-white/40 pointer-events-none"
        aria-hidden="true"
      />
    </>
  )
}
