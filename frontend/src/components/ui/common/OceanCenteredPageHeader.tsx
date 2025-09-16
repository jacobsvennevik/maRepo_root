"use client";

import { ReactNode } from "react";

type IconRenderer = ReactNode;

interface OceanCenteredPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconRenderer;
  gradientClassName?: string; // tailwind gradient e.g. "from-blue-400 to-purple-600"
  className?: string;
}

export function OceanCenteredPageHeader({
  title,
  subtitle,
  icon,
  gradientClassName = "from-blue-400 to-purple-600",
  className = "",
}: OceanCenteredPageHeaderProps) {
  return (
    <div className={`text-center py-6 ${className}`}>
      <div className="flex items-center justify-center gap-4 mb-2">
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClassName} shadow-lg`}>
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      </div>
      {subtitle && <p className="text-slate-600 text-lg">{subtitle}</p>}
    </div>
  );
}


