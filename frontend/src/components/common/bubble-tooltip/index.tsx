"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BubbleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export function BubbleTooltip({ content, children }: BubbleTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 5,
              scale: 1,
              transition: {
                duration: 0.5,
                y: { type: "spring", stiffness: 100, damping: 15 },
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
            className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 min-w-[140px]"
          >
            <div className="relative">
              {/* Small bubble decorations */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/80 rounded-full animate-float-slow"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/80 rounded-full animate-float-slower"></div>

              {/* Bubble tail/pointer - now at the top */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white/90"></div>

              {/* Bubble shape with wobble animation */}
              <div
                className="bg-white/90 backdrop-blur-sm text-blue-600 p-3 rounded-2xl shadow-lg 
                            animate-bubble-wobble text-center text-sm font-medium"
              >
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
