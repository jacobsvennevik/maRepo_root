'use client';

export function EmeraldOrbBackground() {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none">
      {/* Base gradient - Made more emerald-focused */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-emerald-100 to-emerald-50"></div>
      {/* Animated gradient overlays - Increased emerald presence */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/30 to-transparent mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-emerald-400/10"></div>
      {/* Decorative circles - Made more emerald */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"></div>
      {/* Subtle texture */}
      <div className="absolute inset-0 bg-black/5"></div>
    </div>
  );
} 