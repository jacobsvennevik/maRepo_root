"use client";

import Image from "next/image";

export function EmeraldBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Background Image */}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/30 to-transparent mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-blue-500/20"></div>

      {/* Subtle Texture */}
      <div className="absolute inset-0 bg-black/5"></div>
    </div>
  );
}
