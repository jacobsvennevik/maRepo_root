'use client';

import { useState, useEffect } from 'react';

export function useFloatingAnimation() {
  const [waveOffset, setWaveOffset] = useState(0);
  const [floatingCards, setFloatingCards] = useState(false);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveOffset(prev => (prev + 1) % 100);
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