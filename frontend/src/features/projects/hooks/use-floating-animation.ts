"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that provides floating animation state for ocean-themed components.
 * @returns {object} Object containing waveOffset and floatingCards state
 * @returns {number} returns.waveOffset - Current wave animation offset (0-99)
 * @returns {boolean} returns.floatingCards - Whether cards should float/animate
 */
export function useFloatingAnimation() {
  const [waveOffset, setWaveOffset] = useState(0);
  const [floatingCards, setFloatingCards] = useState(false);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveOffset((prev) => (prev + 1) % 100);
    }, 50);

    const floatTimeout = setTimeout(() => {
      setFloatingCards(true);
    }, 1000);

    return () => {
      clearInterval(waveInterval);
      clearTimeout(floatTimeout);
    };
  }, []);

  return { waveOffset, floatingCards };
}
