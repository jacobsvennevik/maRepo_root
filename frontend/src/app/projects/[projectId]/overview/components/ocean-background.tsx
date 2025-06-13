'use client';

import { useState, useEffect } from 'react';

interface OceanBackgroundProps {
  children: React.ReactNode;
}

export function OceanBackground({ children }: OceanBackgroundProps) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveOffset(prev => (prev + 1) % 100);
    }, 50);

    return () => {
      clearInterval(waveInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ocean Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-cyan-50 to-blue-100">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M0 50 Q25 40 50 50 T100 50 V100 H0 Z' fill='%2347B5FF' opacity='0.1'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 100px',
            animation: `wave ${3 + Math.sin(waveOffset * 0.1) * 0.5}s ease-in-out infinite`
          }}
        />
      </div>

      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-50px); }
        }
      `}</style>
    </div>
  );
} 