"use client";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  badgeColor?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  badgeColor = "ocean-medium/10", // Default color
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  return (
    <div className={`max-w-3xl ${alignmentClasses[align]} mb-16 ${className}`}>
      {badge && (
        <div
          className={`inline-block bg-${badgeColor} px-4 py-2 rounded-full text-ocean-deep font-medium mb-4`}
        >
          {badge}
        </div>
      )}
      <h2 className="text-4xl font-medium text-slate-900 mb-4">{title}</h2>
      {description && <p className="text-lg text-slate-700">{description}</p>}
    </div>
  );
}
