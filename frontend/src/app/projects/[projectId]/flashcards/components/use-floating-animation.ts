"use client";

import { useState, useEffect } from "react";

export function useFloatingAnimation() {
  const [waveOffset, setWaveOffset] = useState(0);
  const [floatingCards, setFloatingCards] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset((prev) => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return { waveOffset, floatingCards };
}
