"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"
import Image from "next/image"

// 2D Underwater Background Component
export default function OceanBackground() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-cyan-400 via-blue-400 to-teal-400">
      {/* Background gradient layers for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-300/30 to-transparent" />

      {/* Light rays */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute top-0 bg-gradient-to-b from-white/20 to-transparent"
            style={{
              left: `${10 + i * 20}%`,
              width: "8%",
              height: "70%",
              transform: `rotate(${-5 + i * 2}deg)`,
              transformOrigin: "top center",
              opacity: 0.4 + (i % 3) * 0.1,
            }}
          />
        ))}
      </div>

      {/* Bubbles */}
      <Bubbles count={isMobile ? 30 : 60} />

      {/* Seaweed */}
      <div className="absolute bottom-0 w-full h-[30%] pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <Seaweed
            key={`seaweed-${i}`}
            position={{
              left: `${5 + i * 12}%`,
              height: `${15 + Math.random() * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Fish */}
      <div className="absolute inset-0 pointer-events-none">
        <FishSchool count={isMobile ? 8 : 15} />
      </div>

      {/* Whale */}
      <Whale />
    </div>
  )
}

// Bubbles Component
function Bubbles({ count = 50 }) {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: 10 + Math.random() * 30,
      left: `${Math.random() * 100}%`,
      animationDuration: 15 + Math.random() * 30,
      animationDelay: Math.random() * -30,
      opacity: 0.5 + Math.random() * 0.5,
      pulseDelay: Math.random() * 5,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-white/80 to-white/40"
          style={{
            left: bubble.left,
            bottom: "-10%",
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.1],
            x: [0, Math.sin(bubble.id) * 50],
          }}
          transition={{
            y: {
              duration: bubble.animationDuration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: bubble.animationDelay,
            },
            x: {
              duration: bubble.animationDuration / 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: bubble.animationDelay,
            },
          }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-white/90 to-white/50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: bubble.pulseDelay,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// Seaweed Component
function Seaweed({ position }) {
  return (
    <motion.div
      className="absolute bottom-0 origin-bottom"
      style={{
        left: position.left,
        height: position.height,
        width: "30px",
      }}
      animate={{
        rotateZ: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-full" />
    </motion.div>
  )
}

// Fish Component using the provided images
function Fish({ position, size, direction = 1, fishType = 1 }) {
  // Choose fish image based on type
  const fishImage = fishType === 1 ? "/images/cartoon-fish1.png" : "/images/cartoon-fish2.png"

  // Determine correct transform based on fish type and direction
  // Fish type 1 (orange/blue) is facing left in the original image
  // Fish type 2 (green/teal) is facing right in the original image
  const shouldFlip = (fishType === 1 && direction > 0) || (fishType === 2 && direction < 0)

  // Adjust animation direction based on fish type to ensure consistent movement
  const animationX =
    fishType === 1 ? (direction > 0 ? [0, 100, 0] : [0, -100, 0]) : direction > 0 ? [0, 100, 0] : [0, -100, 0]

  return (
    <motion.div
      className="absolute"
      style={{
        top: position.top,
        left: position.left,
        width: size,
        height: size * 0.6,
        zIndex: Math.floor(Number.parseInt(position.top)),
      }}
      animate={{
        x: animationX,
        y: [0, 20, 0],
      }}
      transition={{
        x: {
          duration: 10 + Math.random() * 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
        y: {
          duration: 5 + Math.random() * 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={fishImage || "/placeholder.svg"}
          alt="Cartoon fish"
          fill
          style={{
            objectFit: "contain",
            transform: shouldFlip ? "scaleX(-1)" : "none",
          }}
        />
      </div>
    </motion.div>
  )
}

// Fish School Component
function FishSchool({ count = 15 }) {
  const fishSchool = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      position: {
        top: `${10 + Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
      },
      size: 40 + Math.random() * 40,
      direction: Math.random() > 0.5 ? 1 : -1,
      fishType: Math.random() > 0.5 ? 1 : 2, // Randomly choose between the two fish types
    }))
  }, [count])

  return (
    <>
      {fishSchool.map((fish) => (
        <Fish
          key={fish.id}
          position={fish.position}
          size={fish.size}
          direction={fish.direction}
          fishType={fish.fishType}
        />
      ))}
    </>
  )
}

// Whale Component using the provided image
function Whale() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const size = isMobile ? 180 : 250

  return (
    <motion.div
      className="absolute"
      style={{
        bottom: "10%",
        right: "-20%",
        width: size,
        height: size * 0.8,
      }}
      animate={{
        x: [-size, -window.innerWidth + size * 0.8],
      }}
      transition={{
        duration: 40,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        ease: "linear",
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src="/images/cartoon-whale.png"
          alt="Cartoon whale"
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    </motion.div>
  )
}
