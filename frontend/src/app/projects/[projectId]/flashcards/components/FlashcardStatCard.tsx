import React from 'react';

interface FlashcardStatCardProps {
  label: string;
  value: number;
  colorClass: string;
}

export function FlashcardStatCard({ label, value, colorClass }: FlashcardStatCardProps) {
  return (
    <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
      <h3 className="font-medium text-emerald-800">{label}</h3>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
} 